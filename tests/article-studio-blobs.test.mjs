import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp } from "node:fs/promises";
import path from "node:path";
import { BlobsServer } from "@netlify/blobs/server";
import { setEnvironmentContext } from "@netlify/blobs";
import { createBlobStore } from "../netlify/lib/studio-store.ts";
import { createStudioService } from "../netlify/lib/studio-service.ts";
import { TEST_PIN, testVerifier, png } from "./helpers/studio-fixture.mjs";

test("Netlify Blobs adapter persists cards/covers across service restarts and rejects stale writes", async () => {
  // Entirely local, in an ignored test directory; no Netlify account or production data.
  const root = path.resolve(".studio-test");
  await mkdir(root, { recursive: true });
  const directory = await mkdtemp(path.join(root, "blobs-"));
  const server = new BlobsServer({ directory, logger: () => {} });
  const address = await server.start();
  setEnvironmentContext({ siteID: "studio-test-site", token: "test-only-local-token", edgeURL: `http://127.0.0.1:${address.port}`, uncachedEdgeURL: `http://127.0.0.1:${address.port}` });
  try {
    const store = createBlobStore("studio-integration-test", true);
    assert.equal(await store.write("cas-check", { value: 1 }, { onlyIfNew: true }), true);
    assert.equal(await store.write("cas-check", { value: 2 }, { onlyIfNew: true }), false);
    const saved = await store.read("cas-check");
    assert.ok(saved.etag);
    assert.equal(await store.write("cas-check", { value: 3 }, { onlyIfMatch: "wrong-etag" }), false);
    assert.equal(await store.write("cas-check", { value: 4 }, { onlyIfMatch: saved.etag }), true);
    let service = createStudioService(store, { verifier: testVerifier });
    let cookie = "";
    const call = (resource, data, raw) => service(new Request(`https://portfolio.test/.netlify/functions/article-studio?resource=${resource}`, {
      method: data || raw ? "POST" : "GET",
      headers: { Origin: "https://portfolio.test", Cookie: cookie, "Content-Type": raw ? "image/png" : "application/json" },
      body: raw ?? (data ? JSON.stringify(data) : undefined),
    }), "blobs-test-ip");
    const login = await call("login", { pin: TEST_PIN });
    assert.equal(login.status, 200);
    cookie = login.headers.get("set-cookie").split(";")[0];
    const upload = await call("upload", undefined, png);
    assert.equal(upload.status, 201);
    const { key } = await upload.json();
    const input = { id: "persisted-article", revision: null, title: "Persisted card", category: "Test", description: "Local Blobs integration test", mediumUrl: "https://medium.com/@test/persisted-card", coverKey: key, action: "publish" };
    const published = await call("save", input);
    assert.equal(published.status, 200);
    const { article } = await published.json();
    assert.equal((await call("projects-migrate", {})).status, 200);
    const projectUpload = await call("projects-upload", undefined, png);
    assert.equal(projectUpload.status, 201);
    const projectKey = (await projectUpload.json()).key;
    const projectResponse = await call("projects-save", { id: "persisted-project", revision: null, coverKey: projectKey, title: "My Money", description: "Persistent mobile app", category: "Mobile Apps", tech: ["Java", "XML", "SQLite"], github: "", demo: "", action: "publish" });
    assert.equal(projectResponse.status, 200);
    const { project } = await projectResponse.json();
    assert.equal((await call("certificates-migrate", {})).status, 200);
    const certificateUpload = await call("certificates-upload", undefined, png);
    const certificateKey = (await certificateUpload.json()).key;
    const certificateResponse = await call("certificates-save", { id: "persisted-certificate", revision: null, title: "Cloud Training", issuer: "Academy", issueDate: "", description: "Persistent certificate", coverKey: certificateKey, link: "", action: "publish" });
    assert.equal(certificateResponse.status, 200);
    const { certificate } = await certificateResponse.json();
    service = createStudioService(createBlobStore("studio-integration-test", true), { verifier: testVerifier });
    const signedInCookie = cookie;
    cookie = "";
    assert.equal((await (await call("public")).json()).articles[0].title, "Persisted card");
    assert.equal((await (await call("projects-public")).json()).projects[0].title, "My Money");
    assert.equal((await call("projects")).status, 401);
    const projectCover = await call(`projects-public-cover&id=${project.id}&key=${projectKey}`);
    assert.equal(projectCover.status, 200);
    assert.deepEqual(Buffer.from(await projectCover.arrayBuffer()), png);
    assert.equal((await (await call("certificates-public")).json()).certificates[0].title, "Cloud Training");
    const certificateCover = await call(`certificates-public-cover&id=${certificate.id}&key=${certificateKey}`);
    assert.equal(certificateCover.status, 200);
    assert.deepEqual(Buffer.from(await certificateCover.arrayBuffer()), png);
    const cover = await call(`public-cover&id=${article.id}&key=${key}`);
    assert.equal(cover.status, 200);
    assert.deepEqual(Buffer.from(await cover.arrayBuffer()), png);
    cookie = signedInCookie;
    assert.equal((await call("save", { id: article.id, revision: article.revision, action: "unpublish" })).status, 200);
    cookie = "";
    assert.equal((await (await call("public")).json()).articles.length, 3);
    assert.equal((await call(`public-cover&id=${article.id}&key=${key}`)).status, 404);
    cookie = signedInCookie;
    assert.equal((await call("projects-save", { ...project, action: "unpublish" })).status, 200);
    assert.equal((await call(`projects-public-cover&id=${project.id}&key=${projectKey}`)).status, 404);
    assert.equal((await call("projects-migrate", {})).status, 200);
    assert.equal((await (await call("projects-public")).json()).projects.some(p => p.id === project.id), false);
    assert.equal((await call("projects-save", { ...project, action: "publish" })).status, 409);
    assert.equal((await call("certificates-save", { ...certificate, action: "unpublish" })).status, 200);
    assert.equal((await call(`certificates-public-cover&id=${certificate.id}&key=${certificateKey}`)).status, 404);
    assert.equal((await call("logout", {})).status, 200);
    assert.equal((await call("articles")).status, 401);
  } finally {
    await server.stop();
  }
});
