import test from "node:test";
import assert from "node:assert/strict";
import { createStudioService } from "../netlify/lib/studio-service.ts";
import { PROJECT_CATALOG_KEY } from "../netlify/lib/project-service.ts";
import { initialProjects } from "../src/data/projects.ts";
import { SESSION_MS } from "../netlify/lib/studio-auth.ts";
import { MemoryStore, TEST_PIN, testVerifier, png } from "./helpers/studio-fixture.mjs";

function fixture() {
  const store = new MemoryStore();
  let time = Date.now();
  const service = createStudioService(store, { verifier: testVerifier, now: () => time });
  let cookie = "";
  const call = (resource, data, signedIn = true, origin = "https://portfolio.test", raw, mime = "image/png") => service(new Request(`https://portfolio.test/.netlify/functions/article-studio?resource=${resource}`, {
    method: data === undefined && raw === undefined ? "GET" : "POST", headers: { Cookie: signedIn ? cookie : "", Origin: origin, "Content-Type": raw === undefined ? "application/json" : mime }, body: raw ?? (data === undefined ? undefined : JSON.stringify(data)),
  }));
  const login = async () => { const r = await call("login", { pin: TEST_PIN }); assert.equal(r.status, 200); cookie = r.headers.get("set-cookie").split(";")[0]; };
  const list = async () => (await (await call("projects-public", undefined, false)).json()).projects;
  const save = async data => { const r = await call("projects-save", data); assert.equal(r.status, 200, JSON.stringify(await r.clone().json())); return (await r.json()).project; };
  return { store, call, login, list, save, advance: ms => { time += ms; } };
}
const input = (extra = {}) => ({ id: "my-money", revision: null, title: "My Money", description: "Track spending and budgets.", category: "Mobile Apps", tech: ["Java", "XML", "SQLite"], github: "", demo: "", action: "draft", ...extra });

test("project images remain private until published; failed replacements, removal, and unpublish preserve access rules", async () => {
  const f = fixture();
  const upload = (resource = "projects-upload", raw = png, mime = "image/png", signedIn = true) => f.call(resource, undefined, signedIn, "https://portfolio.test", raw, mime);
  assert.equal((await upload()).status, 401);
  assert.equal((await f.call("projects-cover&key=secret")).status, 401);
  await f.login(); await f.call("projects-migrate", {});
  for (const [data, mime] of [[Buffer.from("not an image"), "image/png"], [png, "image/jpeg"], [Buffer.from("<svg/>"), "image/svg+xml"]]) assert.equal((await upload("projects-upload", data, mime)).status, 415);
  assert.equal((await upload("projects-upload", Buffer.alloc(3 * 1024 * 1024 + 1))).status, 413);
  const articleKey = (await (await upload("upload")).json()).key;
  assert.equal((await f.call("projects-save", input({ coverKey: articleKey }))).status, 400);
  assert.equal((await f.call("projects-save", input({ coverKey: "../covers/secret" }))).status, 400);
  const first = await upload(); assert.equal(first.status, 201);
  const { key } = await first.json();
  assert.equal(f.store.entries.has(`projects/images/${key}`), true);
  assert.equal((await f.call(`cover&key=${key}`)).status, 404);
  assert.equal((await f.call(`projects-cover&key=${key}`, undefined, false)).status, 401);
  assert.equal((await f.call(`projects-cover&key=${key}`)).status, 200);
  const url = `projects-public-cover&id=my-money&key=${key}`;
  let project = await f.save(input({ coverKey: key }));
  assert.equal((await f.call(url, undefined, false)).status, 404);
  project = await f.save({ ...project, action: "publish" });
  assert.match((await f.list())[0].image, /resource=projects-public-cover/);
  assert.equal("coverKey" in (await f.list())[0], false);
  const image = await f.call(url, undefined, false);
  assert.equal(image.status, 200);
  assert.equal(image.headers.get("content-type"), "image/png");
  assert.match(image.headers.get("cache-control"), /no-store/);
  assert.deepEqual(Buffer.from(await image.arrayBuffer()), png);
  f.store.fail = "upload";
  assert.equal((await upload()).status, 503);
  f.store.fail = null;
  const replacement = (await (await upload()).json()).key;
  f.store.fail = `write:${PROJECT_CATALOG_KEY}`;
  assert.equal((await f.call("projects-save", { ...project, coverKey: replacement, action: "publish" })).status, 503);
  assert.equal((await f.call(url, undefined, false)).status, 200);
  f.store.fail = null;
  project = await f.save({ ...project, coverKey: replacement, action: "publish" });
  assert.equal((await f.call(url, undefined, false)).status, 404);
  const replacementUrl = `projects-public-cover&id=my-money&key=${replacement}`;
  assert.equal((await f.call(replacementUrl, undefined, false)).status, 200);
  project = await f.save({ ...project, coverKey: undefined, title: "Old client edit", action: "publish" });
  assert.equal(project.coverKey, replacement);
  project = await f.save({ ...project, action: "unpublish" });
  assert.equal((await f.call(replacementUrl, undefined, false)).status, 404);
  assert.equal((await f.call(`projects-cover&key=${replacement}`)).status, 200);
  project = await f.save({ ...project, coverKey: "", action: "publish" });
  assert.equal(project.coverKey, "");
  assert.equal("image" in (await f.list())[0], false);
  assert.equal((await f.call(replacementUrl, undefined, false)).status, 404);
  await f.call("logout", {});
  assert.equal((await f.call(`projects-cover&key=${replacement}`)).status, 401);
});

test("shared session protects every project operation, expires, and is revoked for both studios", async () => {
  const f = fixture();
  for (const [route, data] of [["projects"], ["projects-migrate", {}], ...["draft", "publish", "unpublish"].map(action => ["projects-save", input({ action })])]) assert.equal((await f.call(route, data)).status, 401);
  assert.equal((await f.call("login", { pin: "wrong" })).status, 401);
  await f.login();
  assert.equal((await f.call("articles")).status, 200);
  assert.equal((await f.call("projects")).status, 200);
  assert.equal((await f.call("projects-migrate", {}, true, "https://evil.test")).status, 403);
  await f.call("logout", {});
  assert.equal((await f.call("articles")).status, 401);
  assert.equal((await f.call("projects")).status, 401);
  await f.login();
  f.advance(SESSION_MS + 1);
  assert.equal((await f.call("projects")).status, 401);
  assert.equal((await f.call("projects-save", input())).status, 401);
});

test("migration is explicit, atomic, repeatable, preserves all seeds and never resurrects unpublished projects", async () => {
  const f = fixture();
  assert.deepEqual(await f.list(), initialProjects);
  assert.equal(f.store.entries.has(PROJECT_CATALOG_KEY), false);
  await f.login();
  assert.equal((await f.call("projects-save", input())).status, 409);
  f.store.fail = `write:${PROJECT_CATALOG_KEY}`;
  assert.equal((await f.call("projects-migrate", {})).status, 503);
  assert.deepEqual(await f.list(), initialProjects);
  f.store.fail = null;
  await Promise.all([f.call("projects-migrate", {}), f.call("projects-migrate", {})]);
  const original = (await (await f.call("projects")).json()).projects;
  assert.equal(original.length, initialProjects.length);
  assert.deepEqual(await f.list(), initialProjects);
  for (const project of original) await f.save({ ...project, action: "unpublish" });
  await f.call("projects-migrate", {});
  assert.deepEqual(await f.list(), []);
  assert.equal((await (await f.call("projects")).json()).projects.length, original.length);
});

test("draft, publish, category edit and unpublish use the same ID and signed-out visitors see only published fields", async () => {
  const f = fixture(); await f.login(); await f.call("projects-migrate", {});
  let project = await f.save(input());
  assert.equal((await f.list()).length, initialProjects.length);
  project = await f.save({ ...project, action: "publish" });
  let listing = await f.list();
  assert.equal(listing[0].category, "Mobile Apps");
  assert.deepEqual(listing[0].tech, ["Java", "XML", "SQLite"]);
  assert.equal("revision" in listing[0], false);
  project = await f.save({ ...project, category: "Frontend", title: "Money Web", action: "publish" });
  listing = await f.list();
  assert.equal(listing.filter(p => p.id === "my-money").length, 1);
  assert.equal(listing[0].category, "Frontend");
  assert.equal(listing[0].title, "Money Web");
  await f.save({ ...project, action: "unpublish" });
  assert.equal((await f.list()).some(p => p.id === "my-money"), false);
});

test("allows incomplete drafts; validates category, required publishing fields, tags, and optional links server-side", async () => {
  const f = fixture(); await f.login(); await f.call("projects-migrate", {});
  const draft = await f.save(input({ title: "", category: "", description: "" }));
  assert.equal((await f.call("projects-save", { ...draft, action: "publish" })).status, 400);
  for (const category of ["All", "Other"]) assert.equal((await f.call("projects-save", { ...draft, category, action: "draft" })).status, 400);
  for (const github of ["javascript:alert(1)", "ftp://example.com", "https://user:pass@example.com", "not-a-url"]) assert.equal((await f.call("projects-save", { ...draft, github, action: "draft" })).status, 400);
  assert.equal((await f.call("projects-save", { ...draft, tech: [4], action: "draft" })).status, 400);
  assert.equal((await f.call("projects-save", { ...draft, tech: Array(31).fill("tag"), action: "draft" })).status, 400);
  await f.save({ ...draft, title: "Money", category: "Mobile Apps", description: "Summary", github: "https://github.com/example/repo", demo: "http://example.com", action: "publish" });
});

test("outages, stale revisions, and concurrent catalog writes preserve saved and unrelated records", async () => {
  const f = fixture(); await f.login(); await f.call("projects-migrate", {});
  const project = await f.save(input({ action: "publish" }));
  const before = await f.list();
  f.store.fail = `write:${PROJECT_CATALOG_KEY}`;
  assert.equal((await f.call("projects-save", { ...project, title: "Failed edit", action: "publish" })).status, 503);
  f.store.fail = null;
  assert.deepEqual(await f.list(), before);
  const changed = await f.save({ ...project, title: "Saved edit", action: "publish" });
  assert.equal((await f.call("projects-save", { ...project, action: "unpublish" })).status, 409);
  const other = (await (await f.call("projects")).json()).projects[1];
  const changes = [{ ...changed, description: "New description", action: "publish" }, { ...other, title: "Updated existing", action: "publish" }];
  const results = await Promise.all(changes.map(p => f.call("projects-save", p)));
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
  await f.save(changes[results.findIndex(r => r.status === 409)]);
  const after = await f.list();
  assert.equal(after.find(p => p.id === changed.id).description, "New description");
  assert.equal(after.find(p => p.id === other.id).title, "Updated existing");
  f.store.fail = `read:${PROJECT_CATALOG_KEY}`;
  const unavailable = await f.call("projects-public", undefined, false);
  assert.equal(unavailable.status, 503);
  assert.equal("projects" in await unavailable.json(), false);
});
