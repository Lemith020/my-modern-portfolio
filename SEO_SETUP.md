# Google Search setup for Lemith Nanditha

Production homepage: **https://lemith-portfolio.netlify.app/**

The project now generates the full-name page title, description, canonical URL, social metadata, and Person/ProfilePage structured data in the initial HTML. The visible homepage heading also includes **Lemith Nanditha**. The initial HTML contains the same name and a short profile before React loads; JavaScript replaces that fallback with the normal portfolio.

The build generates `dist/robots.txt` and `dist/sitemap.xml`. The sitemap includes the homepage only: portfolio sections are anchors on that same page, and Medium articles live on Medium. Netlify deploy previews and branch deploys get `noindex` metadata and a restrictive robots file. The normal production site remains indexable.

## 1. Deploy the changes when you are ready

Run `npm.cmd run build` and publish through your existing Netlify workflow. Keep all existing EmailJS environment variables. No new hosting service is required. These code changes do not affect Google's view of the live website until you deploy them.

Check these live URLs after deploying:

- https://lemith-portfolio.netlify.app/
- https://lemith-portfolio.netlify.app/robots.txt
- https://lemith-portfolio.netlify.app/sitemap.xml

View Source on the homepage and confirm its title, description, canonical URL, and JSON-LD name. The robots file should allow crawling and reference the sitemap. The sitemap should contain the exact homepage URL.

## 2. Verify ownership in Search Console

1. Open [Google Search Console](https://search.google.com/search-console/).
2. Choose **Add property → URL prefix** and enter `https://lemith-portfolio.netlify.app/`. For a Netlify subdomain, use URL-prefix verification because you do not control the DNS for `netlify.app`.
3. Choose the **HTML tag** verification method. Copy only the `content` value from Google's `google-site-verification` meta tag.
4. In Netlify's environment variables, add `GOOGLE_SITE_VERIFICATION` with that value and make it available to the build. This is a public verification token, not a password. Deploy again so the tag is included in the homepage HTML.
5. Return to Search Console and click **Verify**. Keep the token in the configuration afterward so Google can recheck ownership.

Alternatively, if Search Console offers an HTML verification file, put the exact downloaded file in `public/`, deploy, and verify using that method. You do not need both methods.

## 3. Submit the sitemap and homepage

1. In Search Console's **Sitemaps** area, submit `https://lemith-portfolio.netlify.app/sitemap.xml` (or `sitemap.xml` if the form already displays the origin).
2. In **URL Inspection**, enter `https://lemith-portfolio.netlify.app/`.
3. Test the live URL, check that indexing is allowed, and use **Request indexing**.
4. Monitor the Page Indexing and Performance reports. A `site:lemith-portfolio.netlify.app` search can be a quick check, but Search Console is the better place to investigate indexing problems.

Google decides whether and when to index or rank the site. These changes do not guarantee a first-page result, a particular position, or an autocomplete suggestion. A crawl request can take days or weeks and is not a guarantee of inclusion.

## 4. Keep your public identity consistent

Use **Lemith Nanditha** consistently in your portfolio and public professional profiles. Add the portfolio homepage to your existing GitHub, LinkedIn, and Medium profiles when you choose to update those accounts. Replace the mock article cards with your actual Medium work. Useful original projects and writing give visitors more substance than repeating search keywords.

## If the domain changes

The default production URL is in `scripts/seo.ts`. Set the optional build variable `SITE_URL` to a new public HTTPS origin if you move to a custom domain. The canonical, structured data, robots file, and sitemap all use that same value after rebuilding. Do not put a localhost, article path, or preview URL in `SITE_URL`.

For local verification, add variables to your existing `.env` without replacing the EmailJS values. `.env.example` lists the available settings. Do not edit generated `dist/` files; the next build regenerates them.

## Checks

- `npm.cmd run build`
- `node --test tests/seo.test.mjs` (Node 24)

The automated checks cover the actual production origin, metadata, JSON-LD, sitemap contents, preview exclusions, custom domains, verification escaping, and rejection of invalid origins. They do not deploy the site, verify your Google account, or submit anything to Google.

References: [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [Search Console ownership verification](https://support.google.com/webmasters/answer/9008080), [requesting a recrawl](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).
