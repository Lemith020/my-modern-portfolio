import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createSeoPlugin, normalizeSiteUrl, seo } from "../scripts/seo.ts";

const template = readFileSync(new URL("../index.html", import.meta.url), "utf8");

function render(env = {}) {
  const plugin = createSeoPlugin(env);
  const files = {};
  plugin.generateBundle.call({ emitFile: file => { files[file.fileName] = file.source; } });
  return { html: plugin.transformIndexHtml(template), files };
}

test("homepage includes name, public canonical, metadata, and readable initial content", () => {
  const { html } = render();
  assert.match(html, /<title>Lemith Nanditha \| Software Engineering Portfolio<\/title>/);
  assert.match(html, /<h1>Lemith Nanditha<\/h1>/);
  assert.match(html, /name="description" content="Lemith Nanditha/);
  assert.match(html, /rel="canonical" href="https:\/\/lemith-portfolio.netlify.app\/"/);
  assert.match(html, /property="og:url" content="https:\/\/lemith-portfolio.netlify.app\/"/);
  assert.doesNotMatch(html, /noindex|portfolio-seo/);
  const json = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1];
  const graph = JSON.parse(json)["@graph"];
  assert.equal(graph[0].mainEntity.name, "Lemith Nanditha");
  assert.deepEqual(graph[0].mainEntity.sameAs, seo.profiles);
});

test("sitemap lists only the real homepage and robots points to it", () => {
  const { files } = render();
  assert.match(files["sitemap.xml"], /<loc>https:\/\/lemith-portfolio.netlify.app\/<\/loc>/);
  assert.equal((files["sitemap.xml"].match(/<loc>/g) || []).length, 1);
  assert.doesNotMatch(files["sitemap.xml"], /#|\/blog|localhost|example.com/);
  assert.match(files["robots.txt"], /Allow: \/\n/);
  assert.match(files["robots.txt"], /Sitemap: https:\/\/lemith-portfolio.netlify.app\/sitemap.xml/);
});

test("custom production domain updates every absolute SEO URL", () => {
  const { html, files } = render({ SITE_URL: "https://portfolio.example" });
  assert.match(html, /rel="canonical" href="https:\/\/portfolio.example\/"/);
  assert.match(files["sitemap.xml"], /https:\/\/portfolio.example\//);
  assert.match(files["robots.txt"], /https:\/\/portfolio.example\/sitemap.xml/);
  assert.doesNotMatch(html, /lemith-portfolio.netlify.app/);
});

test("Netlify previews are excluded while retaining the public canonical", () => {
  for (const context of ["deploy-preview", "branch-deploy"]) {
    const { html, files } = render({ CONTEXT: context });
    assert.match(html, /name="robots" content="noindex, nofollow"/);
    assert.match(html, /rel="canonical" href="https:\/\/lemith-portfolio.netlify.app\/"/);
    assert.match(files["robots.txt"], /Disallow: \/\n/);
    assert.doesNotMatch(files["robots.txt"], /Sitemap:/);
  }
});

test("verification tokens are opt-in and escaped; invalid public origins are rejected", () => {
  assert.doesNotMatch(render().html, /google-site-verification/);
  assert.match(render({ GOOGLE_SITE_VERIFICATION: 'token"<test>' }).html, /content="token&quot;&lt;test&gt;"/);
  assert.equal(normalizeSiteUrl(" https://lemith-portfolio.netlify.app/ "), seo.siteUrl);
  for (const url of ["http://portfolio.example", "https://localhost", "https://127.0.0.1", "https://user:pass@example.com", "https://portfolio.example/#home", "https://portfolio.example/blog"]) {
    assert.throws(() => normalizeSiteUrl(url));
  }
});
