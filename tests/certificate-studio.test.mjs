import test from "node:test";
import assert from "node:assert/strict";
import { createStudioService } from "../netlify/lib/studio-service.ts";
import { CERTIFICATE_CATALOG_KEY } from "../netlify/lib/certificate-service.ts";
import { certificateSeeds } from "../netlify/lib/certificate-seeds.ts";
import { readFile } from "node:fs/promises";
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
  const list = async () => (await (await call("certificates-public", undefined, false)).json()).certificates;
  const save = async data => { const r = await call("certificates-save", data); assert.equal(r.status, 200, JSON.stringify(await r.clone().json())); return (await r.json()).certificate; };
  return { store, call, login, list, save, advance: ms => { time += ms; } };
}
const input = (extra = {}) => ({ id: "test-certificate", revision: null, title: "Cloud Engineering", issuer: "Test Academy", issueDate: "", description: "Practical cloud training", link: "", coverKey: "", action: "draft", ...extra });
const upload = async (f, raw = png, mime = "image/png") => f.call("certificates-upload", undefined, true, "https://portfolio.test", raw, mime);
const key = async f => { const response = await upload(f); assert.equal(response.status, 201); return (await response.json()).key; };

test("certificate routes share Studio authorization, wrong PIN, origin checks, expiry and logout", async () => {
  const f = fixture();
  for (const [resource, data] of [["certificates"], ["certificates-cover&key=secret"], ["certificates-migrate", {}], ["certificates-upload", {}], ...["draft", "publish", "unpublish"].map(action => ["certificates-save", input({ action })])]) assert.equal((await f.call(resource, data)).status, 401);
  assert.equal((await (await f.call("login", { pin: "wrong" })).json()).error, "Incorrect PIN");
  await f.login();
  for (const resource of ["articles", "projects", "certificates"]) assert.equal((await f.call(resource)).status, 200);
  assert.equal((await f.call("certificates-migrate", {}, true, "https://evil.test")).status, 403);
  await f.call("logout", {});
  assert.equal((await f.call("certificates")).status, 401);
  await f.login(); f.advance(SESSION_MS + 1);
  assert.equal((await upload(f)).status, 401);
  assert.equal((await f.call("certificates-save", input())).status, 401);
});

test("original images and dates are preserved; interrupted/concurrent import is repeatable and unpublishing has no fallback", async () => {
  const f = fixture();
  const original = await f.list();
  assert.deepEqual(original.map(c => c.issueDate), ["2026-02-25", "2026-02-28", "2026-03-05", "2024-12-04"]);
  assert.equal(original[3].issuer, "The Open University of Sri Lanka");
  for (const c of original) assert.equal(c.link, "");
  for (let i = 0; i < original.length; i++) {
    const response = await f.call(original[i].image.split("resource=")[1], undefined, false);
    assert.equal(response.status, 200);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), await readFile(`netlify/assets/certificates/${certificateSeeds[i].file}`));
  }
  assert.equal(f.store.entries.has(CERTIFICATE_CATALOG_KEY), false);
  await f.login();
  f.store.fail = `write:${CERTIFICATE_CATALOG_KEY}`;
  assert.equal((await f.call("certificates-migrate", {})).status, 503);
  assert.deepEqual(await f.list(), original);
  f.store.fail = null;
  await Promise.all([f.call("certificates-migrate", {}), f.call("certificates-migrate", {})]);
  let records = (await (await f.call("certificates")).json()).certificates;
  assert.equal(records.length, 4);
  for (const c of records) {
    const response = await f.call(`certificates-cover&key=${c.coverKey}`);
    assert.equal(response.status, 200);
    await f.save({ ...c, action: "unpublish" });
  }
  await f.call("certificates-migrate", {});
  assert.deepEqual(await f.list(), []);
  records = (await (await f.call("certificates")).json()).certificates;
  assert.equal(records.length, 4);
  assert.equal((await f.call(original[0].image.split("resource=")[1], undefined, false)).status, 404);
  f.store.fail = `read:${CERTIFICATE_CATALOG_KEY}`;
  assert.equal((await f.call("certificates-public", undefined, false)).status, 503);
});

test("incomplete drafts are private and publishing validates fields, real dates, URLs and image content", async () => {
  const f = fixture(); await f.login(); await f.call("certificates-migrate", {});
  const draft = await f.save(input({ title: "", issuer: "", description: "" }));
  assert.equal((await f.list()).length, 4);
  assert.equal((await f.call("certificates-save", { ...draft, action: "publish" })).status, 400);
  for (const issueDate of ["2026-02-29", "2024-02-30", "0000-01-01", "bad-date"]) assert.equal((await f.call("certificates-save", { ...draft, issueDate, action: "draft" })).status, 400);
  for (const link of ["javascript:alert(1)", "ftp://example.com", "https://user:pass@example.com"]) assert.equal((await f.call("certificates-save", { ...draft, link, action: "draft" })).status, 400);
  for (const [bytes, mime] of [[Buffer.from("bad"), "image/png"], [png, "image/jpeg"], [Buffer.from("<svg/>"), "image/svg+xml"]]) assert.equal((await upload(f, bytes, mime)).status, 415);
  assert.equal((await upload(f, Buffer.alloc(3 * 1024 * 1024 + 1))).status, 413);
  assert.equal((await f.call("certificates-save", { ...draft, coverKey: "../../secret", action: "draft" })).status, 400);
  const articleKey = (await (await f.call("upload", undefined, true, "https://portfolio.test", png, "image/png")).json()).key;
  assert.equal((await f.call("certificates-save", { ...draft, coverKey: articleKey, action: "draft" })).status, 400);
  const coverKey = await key(f);
  let certificate = await f.save({ ...draft, coverKey, action: "draft" });
  const publicRoute = `certificates-public-cover&id=${certificate.id}&key=${coverKey}`;
  assert.equal((await f.call(publicRoute, undefined, false)).status, 404);
  assert.equal((await f.call(`certificates-cover&key=${coverKey}`, undefined, false)).status, 401);
  certificate = await f.save({ ...certificate, title: "Cloud", issuer: "Academy", description: "Training", issueDate: "2024-02-29", link: "http://example.com/credential", action: "publish" });
  assert.equal((await f.list())[0].id, certificate.id);
  assert.equal("revision" in (await f.list())[0], false);
  assert.deepEqual(Buffer.from(await (await f.call(publicRoute, undefined, false)).arrayBuffer()), png);
});

test("failed replacements preserve data; cleanup waits for save and every reference, and retired images cannot be reattached", async () => {
  const f = fixture(); await f.login(); await f.call("certificates-migrate", {});
  const coverKey = await key(f);
  let a = await f.save(input({ coverKey, action: "publish" }));
  let b = await f.save(input({ id: "second", coverKey, action: "draft" }));
  f.store.fail = "upload"; assert.equal((await upload(f)).status, 503); f.store.fail = null;
  const replacement = await key(f);
  f.store.fail = `write:${CERTIFICATE_CATALOG_KEY}`;
  assert.equal((await f.call("certificates-save", { ...a, coverKey: replacement, action: "publish" })).status, 503);
  assert.equal(f.store.entries.has(`certificates/images/${coverKey}`), true);
  f.store.fail = null;
  a = await f.save({ ...a, coverKey: replacement, title: "Edited", action: "publish" });
  assert.equal(f.store.entries.has(`certificates/images/${coverKey}`), true, "draft still references old image");
  assert.equal((await f.call(`certificates-public-cover&id=${a.id}&key=${coverKey}`, undefined, false)).status, 404);
  b = await f.save({ ...b, coverKey: replacement, action: "draft" });
  assert.equal(f.store.entries.has(`certificates/images/${coverKey}`), false);
  assert.equal(f.store.entries.has(`certificates/covers/${coverKey}`), false);
  assert.equal((await f.call("certificates-save", { ...b, coverKey, action: "draft" })).status, 400);
  await f.save({ ...a, action: "unpublish" });
  assert.equal(f.store.entries.has(`certificates/images/${replacement}`), true);
  assert.equal((await f.call(`certificates-public-cover&id=${a.id}&key=${replacement}`, undefined, false)).status, 404);
});

test("stale and concurrent saves protect unrelated certificates; cleanup failure does not undo a committed save", async () => {
  const f = fixture(); await f.login(); await f.call("certificates-migrate", {});
  const records = (await (await f.call("certificates")).json()).certificates;
  const updates = records.slice(0, 2).map((c, i) => ({ ...c, title: `Changed ${i}`, action: "publish" }));
  const result = await Promise.all(updates.map(c => f.call("certificates-save", c)));
  assert.deepEqual(result.map(r => r.status).sort(), [200, 409]);
  await f.save(updates[result.findIndex(r => r.status === 409)]);
  assert.equal((await f.call("certificates-save", { ...records[0], action: "unpublish" })).status, 409);
  const listing = await f.list();
  assert.equal(listing[0].title, "Changed 0"); assert.equal(listing[1].title, "Changed 1");
  let c = (await (await f.call("certificates")).json()).certificates[0];
  const remove = f.store.remove.bind(f.store);
  f.store.remove = async () => { throw new Error("Cleanup unavailable"); };
  const oldKey = c.coverKey;
  c = await f.save({ ...c, coverKey: await key(f), action: "publish" });
  assert.equal((await f.call(`certificates-cover&key=${oldKey}`)).status, 404);
  f.store.remove = remove;
  await f.save({ ...c, action: "publish" });
  assert.equal(f.store.entries.has(`certificates/images/${oldKey}`), false);
});
