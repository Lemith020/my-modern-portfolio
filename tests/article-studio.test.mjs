import test from "node:test";
import assert from "node:assert/strict";
import { createStudioService, validArticleUrl } from "../netlify/lib/studio-service.ts";
import { digest, SESSION_MS, verifyPin } from "../netlify/lib/studio-auth.ts";
import { MAX_COVER_BYTES } from "../src/lib/article-studio-types.ts";
import { MemoryStore, TEST_PIN, testVerifier, png } from "./helpers/studio-fixture.mjs";

function fixture() {
  const store = new MemoryStore();
  let time = Date.now();
  const service = createStudioService(store, { verifier: testVerifier, now: () => time });
  let cookie = "";
  async function call(resource, data, { signedIn = true, origin = "https://portfolio.test", ip = "127.0.0.1", headers = {}, raw, method } = {}) {
    return service(new Request(`https://portfolio.test/.netlify/functions/article-studio?resource=${resource}`, {
      method: method ?? (data !== undefined || raw !== undefined ? "POST" : "GET"),
      headers: { ...(signedIn && cookie ? { Cookie: cookie } : {}), Origin: origin, ...(raw === undefined && data !== undefined ? { "Content-Type": "application/json" } : {}), ...headers },
      body: raw ?? (data === undefined ? undefined : JSON.stringify(data)),
    }), ip);
  }
  async function login() {
    const response = await call("login", { pin: TEST_PIN });
    assert.equal(response.status, 200);
    cookie = response.headers.get("set-cookie").split(";")[0];
    return response;
  }
  async function upload() {
    const response = await call("upload", undefined, { raw: png, headers: { "Content-Type": "image/png" } });
    assert.equal(response.status, 201);
    return (await response.json()).key;
  }
  return { store, service, call, login, upload, advance: ms => { time += ms; }, getCookie: () => cookie };
}

const articleData = (coverKey, extra = {}) => ({
  id: "test-article", revision: null, title: "A real test article", category: "Development",
  description: "A short summary.", mediumUrl: "https://medium.com/@test/article-123", coverKey, action: "draft", ...extra,
});

test("PIN verification preserves case, symbols, and surrounding whitespace", async () => {
  assert.equal(await verifyPin(TEST_PIN, testVerifier), true);
  assert.equal(await verifyPin(TEST_PIN.trim(), testVerifier), false);
  assert.equal(await verifyPin(TEST_PIN.toLowerCase(), testVerifier), false);
  const f = fixture();
  const wrong = await f.call("login", { pin: "incorrect-test-pin" });
  assert.equal(wrong.status, 401);
  assert.equal((await wrong.json()).error, "Incorrect PIN");
  const session = await f.login();
  assert.match(session.headers.get("set-cookie"), /HttpOnly; SameSite=Strict; Max-Age=3600; Secure/);
  const token = f.getCookie().split("=")[1];
  assert.match(token, /^[a-f0-9]{64}$/);
  assert.ok(f.store.entries.has(`sessions/${digest(token)}`));
  assert.equal(JSON.stringify([...f.store.entries]).includes(token), false);
  assert.deepEqual(Object.keys(f.store.entries.get(`sessions/${digest(token)}`).data), ["expiresAt"]);
});

test("private routes reject signed-out requests; origin checks precede changes", async () => {
  const f = fixture();
  for (const [resource, data] of [["session"], ["articles"], ["cover&key=secret"], ["upload", {}], ["save", {}], ["logout", {}]]) {
    assert.equal((await f.call(resource, data)).status, 401, resource);
  }
  for (const origin of ["https://evil.test", "null", ""]) {
    assert.equal((await f.call("login", { pin: TEST_PIN }, { origin })).status, 403);
  }
  await f.login();
  assert.equal((await f.call("save", {}, { origin: "https://evil.test" })).status, 403);
  assert.equal((await f.call("save", {}, { headers: { "Sec-Fetch-Site": "cross-site" } })).status, 403);
});

test("session expires on the server and logout revokes the original token", async () => {
  const f = fixture();
  await f.login();
  assert.equal((await f.call("session")).status, 200);
  assert.equal((await f.call("logout", {})).status, 200);
  assert.equal((await f.call("articles")).status, 401);
  await f.login();
  f.advance(SESSION_MS + 1);
  assert.equal((await f.call("articles")).status, 401);
  assert.equal((await f.call("upload", {})).status, 401);
});

test("rate limiting is atomic across separate service instances", async () => {
  const store = new MemoryStore();
  const options = { verifier: testVerifier, now: () => 1_000_000 };
  const handlers = Array.from({ length: 10 }, () => createStudioService(store, options));
  const results = await Promise.all(handlers.map(handle => handle(new Request("https://portfolio.test/?resource=login", {
    method: "POST", headers: { Origin: "https://portfolio.test", "Content-Type": "application/json" }, body: JSON.stringify({ pin: "wrong-test-value" }),
  }), "same-ip")));
  assert.equal(results.filter(r => r.status === 401).length, 5);
  assert.equal(results.filter(r => r.status === 429).length, 5);
  assert.equal(results.find(r => r.status === 429).headers.get("retry-after"), "900");
});

test("global rate limit bounds attempts from different IPs and storage failures fail closed", async () => {
  const f = fixture();
  const window = Math.floor(Date.now() / (15 * 60 * 1000));
  for (let i = 0; i < 30; i++) await f.store.write(`attempts/${window}/global/${i}`, { expiresAt: Date.now() + 999999 });
  assert.equal((await f.call("login", { pin: TEST_PIN }, { ip: "fresh-ip" })).status, 429);
  const broken = fixture();
  broken.store.write = async () => { throw new Error("Offline"); };
  const response = await broken.call("login", { pin: TEST_PIN });
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /retry/i);
  assert.equal(response.headers.has("set-cookie"), false);
});

test("draft -> publish -> edit -> unpublish updates public listing and protects covers without deployment", async () => {
  const f = fixture();
  await f.login();
  const coverKey = await f.upload();
  const draftResponse = await f.call("save", articleData(coverKey));
  assert.equal(draftResponse.status, 200);
  let article = (await draftResponse.json()).article;
  assert.equal((await (await f.call("public", undefined, { signedIn: false })).json()).articles.length, 3);
  assert.equal((await f.call(`cover&key=${coverKey}`, undefined, { signedIn: false })).status, 401);
  assert.equal((await f.call(`public-cover&id=${article.id}&key=${coverKey}`, undefined, { signedIn: false })).status, 404);
  assert.equal((await f.call(`cover&key=${coverKey}`)).status, 200);
  const published = await f.call("save", { ...article, action: "publish" });
  assert.equal(published.status, 200);
  article = (await published.json()).article;
  let listing = (await (await f.call("public", undefined, { signedIn: false })).json()).articles;
  assert.equal(listing.length, 4);
  assert.equal(listing[0].mediumUrl, article.mediumUrl);
  assert.equal("revision" in listing[0], false);
  const publicCover = await f.call(`public-cover&id=${article.id}&key=${coverKey}`, undefined, { signedIn: false });
  assert.equal(publicCover.status, 200);
  assert.match(publicCover.headers.get("cache-control"), /no-store/);
  assert.equal(publicCover.headers.get("content-type"), "image/png");
  assert.deepEqual(Buffer.from(await publicCover.arrayBuffer()), png);
  const replacement = await f.upload();
  article = (await (await f.call("save", { ...article, title: "Updated title", coverKey: replacement, action: "publish" })).json()).article;
  listing = (await (await f.call("public", undefined, { signedIn: false })).json()).articles;
  assert.equal(listing.length, 4);
  assert.equal(listing[0].title, "Updated title");
  assert.equal((await f.call(`public-cover&id=${article.id}&key=${coverKey}`, undefined, { signedIn: false })).status, 404);
  const hidden = await f.call("save", { id: article.id, revision: article.revision, action: "unpublish" });
  assert.equal(hidden.status, 200);
  listing = (await (await f.call("public", undefined, { signedIn: false })).json()).articles;
  assert.equal(listing.length, 3);
  assert.equal((await f.call(`public-cover&id=${article.id}&key=${replacement}`, undefined, { signedIn: false })).status, 404);
  assert.equal((await (await f.call("articles")).json()).articles[0].status, "draft");
});

test("incomplete drafts are allowed, publishing validates required fields and HTTPS links", async () => {
  const f = fixture();
  await f.login();
  const input = articleData("", { title: "", category: "", description: "", mediumUrl: "unfinished" });
  const saved = await f.call("save", input);
  assert.equal(saved.status, 200);
  const article = (await saved.json()).article;
  assert.equal((await f.call("save", { ...article, action: "publish" })).status, 400);
  for (const url of ["http://medium.com/post", "javascript:alert(1)", "https://medium.com", "https://user:pass@medium.com/post", "unfinished"]) assert.equal(validArticleUrl(url), false);
  assert.equal(validArticleUrl("https://medium.com/@owner/article"), true);
  assert.equal(validArticleUrl("https://writing.example.com/my-story"), true);
});

test("samples import once, retain coming-soon behavior, and do not reappear after unpublishing", async () => {
  const f = fixture();
  await f.login();
  const original = (await (await f.call("articles")).json()).articles;
  assert.equal(original.length, 3);
  assert.ok(original.every(a => a.isSample && !a.mediumUrl));
  await f.call("save", { ...original[0], action: "unpublish" });
  assert.equal((await (await f.call("articles")).json()).articles.length, 3);
  assert.equal((await (await f.call("articles")).json()).articles.length, 3);
  assert.equal((await (await f.call("public")).json()).articles.length, 2);
});

test("rejects disguised images, unsupported types, and oversize uploads", async () => {
  const f = fixture();
  await f.login();
  for (const [raw, type] of [[Buffer.from("<svg></svg>"), "image/svg+xml"], [Buffer.from("not a png"), "image/png"], [png, "image/jpeg"]]) {
    assert.equal((await f.call("upload", undefined, { raw, headers: { "Content-Type": type } })).status, 415);
  }
  assert.equal((await f.call("upload", undefined, { raw: Buffer.alloc(MAX_COVER_BYTES + 1), headers: { "Content-Type": "image/png" } })).status, 413);
});

test("failed save/replacement and stale edits preserve the saved article and cover", async () => {
  const f = fixture();
  await f.login();
  const key = await f.upload();
  const article = (await (await f.call("save", articleData(key, { action: "publish" }))).json()).article;
  f.store.fail = "upload";
  assert.equal((await f.call("upload", undefined, { raw: png, headers: { "Content-Type": "image/png" } })).status, 503);
  f.store.fail = null;
  const replacement = await f.upload();
  f.store.fail = "write:catalog";
  assert.equal((await f.call("save", { ...article, coverKey: replacement, title: "Failed edit", action: "publish" })).status, 503);
  f.store.fail = null;
  assert.equal((await (await f.call("articles")).json()).articles[0].coverKey, key);
  assert.equal((await f.call(`public-cover&id=${article.id}&key=${key}`)).status, 200);
  assert.equal((await f.call("save", { ...article, title: "Successful edit", action: "publish" })).status, 200);
  assert.equal((await f.call("save", { ...article, title: "Stale edit", action: "publish" })).status, 409);
  assert.equal((await (await f.call("articles")).json()).articles[0].title, "Successful edit");
});
