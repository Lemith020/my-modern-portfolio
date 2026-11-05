import type { Plugin } from "vite";

export const seo = {
  name: "Lemith Nanditha",
  siteUrl: "https://lemith-portfolio.netlify.app/",
  title: "Lemith Nanditha | Software Engineering Portfolio",
  description:
    "Lemith Nanditha is a Software Engineering undergraduate at the University of Kelaniya, Sri Lanka. Explore full-stack projects, AI/ML interests, and skills.",
  profiles: [
    "https://github.com/Lemith020",
    "https://www.linkedin.com/in/lemith-nanditha-b0a738381",
  ],
};

export function normalizeSiteUrl(value: string): string {
  if (!value.trim()) return "";
  const url = new URL(value.trim());
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    /^(localhost|127(?:\.\d+){3}|0\.0\.0\.0|\[::1\])$/i.test(url.hostname) ||
    /\.(localhost|local)$/i.test(url.hostname)
  ) {
    throw new Error("SITE_URL must be your public HTTPS portfolio address, not localhost.");
  }
  if (url.pathname !== "/" || url.search || url.hash) {
    throw new Error("SITE_URL must contain only the production origin, such as https://your-site.netlify.app.");
  }
  return url.origin + "/";
}

const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

export function createSeoPlugin(env: Record<string, string | undefined>): Plugin {
  const canonical = normalizeSiteUrl(env.SITE_URL || seo.siteUrl);
  const preview = env.CONTEXT === "deploy-preview" || env.CONTEXT === "branch-deploy";
  const verification = env.GOOGLE_SITE_VERIFICATION?.trim();
  const graph = [
    {
      "@type": "ProfilePage",
      ...(canonical ? { "@id": canonical + "#profile", url: canonical } : {}),
      name: seo.title,
      description: seo.description,
      mainEntity: {
        "@type": "Person",
        ...(canonical ? { "@id": canonical + "#person", url: canonical } : {}),
        name: seo.name,
        description: "Software Engineering undergraduate interested in AI, machine learning, and full-stack development.",
        affiliation: { "@type": "CollegeOrUniversity", name: "University of Kelaniya" },
        sameAs: seo.profiles,
      },
    },
    {
      "@type": "WebSite",
      name: seo.name + " Portfolio",
      ...(canonical ? { "@id": canonical + "#website", url: canonical } : {}),
    },
  ];

  return {
    name: "portfolio-seo",
    transformIndexHtml(html) {
      const meta = [
        `<title>${escape(seo.title)}</title>`,
        `<meta name="description" content="${escape(seo.description)}" />`,
        `<meta name="author" content="${seo.name}" />`,
        `<meta name="robots" content="${preview ? "noindex, nofollow" : "index, follow, max-image-preview:large"}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:site_name" content="${seo.name} Portfolio" />`,
        `<meta property="og:title" content="${escape(seo.title)}" />`,
        `<meta property="og:description" content="${escape(seo.description)}" />`,
        `<meta name="twitter:card" content="summary" />`,
        `<meta name="twitter:title" content="${escape(seo.title)}" />`,
        `<meta name="twitter:description" content="${escape(seo.description)}" />`,
        ...(canonical ? [
          `<link rel="canonical" href="${escape(canonical)}" />`,
          `<meta property="og:url" content="${escape(canonical)}" />`,
        ] : []),
        ...(verification ? [`<meta name="google-site-verification" content="${escape(verification)}" />`] : []),
        `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`,
      ].join("\n    ");
      return html.replace("<!-- portfolio-seo -->", meta);
    },
    generateBundle() {
      // Keep the sitemap limited to real pages, not homepage section anchors or Medium links.
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${canonical ? `\n  <url><loc>${escape(canonical)}</loc></url>` : ""}\n</urlset>\n` });
      this.emitFile({ type: "asset", fileName: "robots.txt", source: `User-agent: *\n${preview ? "Disallow: /" : "Allow: /"}\n${canonical && !preview ? `\nSitemap: ${canonical}sitemap.xml\n` : ""}` });
    },
  };
}
