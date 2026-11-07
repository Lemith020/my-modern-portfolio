# Project Studio

Project Studio manages Featured Projects through the existing Article Studio Netlify Function and Netlify Blobs provider. Both studios use the same PIN verifier, HTTP-only cookie, one-hour server session, rate limits, origin checks, and logout. No new PIN, environment variables, services, or client-side credentials are needed. The Gmail/EmailJS contact integration is unchanged.

## One-time deployment and import

1. Deploy this feature to Netlify using your usual workflow. Deployment and production data changes are intentionally left to you.
2. Open Featured Projects → Open Studio on the deployed site. Enter your existing PIN, or use your already-valid Article Studio session.
3. Click **Import existing projects**. This atomically stores all seven original cards, with stable IDs, descriptions, categories, tags, pending status, links, and their original order. Placeholder `#` links become empty optional URLs and have no link button.
4. Edit an existing project or choose **New project**. Save incomplete work as a draft, or add a category, project name, and description and choose **Publish project**. URLs are optional, but supplied URLs must use HTTP or HTTPS.
5. Refresh the site in a signed-out window. A published Mobile Apps project appears under both **All** and **Mobile Apps**. Save changes or Unpublish updates the listing without a Git push, build, or redeployment.

Until import succeeds, the function serves the existing seed cards without writing data. Import uses an atomic create-only operation: retries cannot duplicate cards, reset edits, or republish hidden projects. After import, the stored catalog is authoritative, including when every project is unpublished. A storage failure returns an error and a Retry control; it does not substitute hardcoded cards.

## Storage and editing

- Project images are optional. Use **Project image** to upload a PNG, JPEG, or WebP file up to 3 MB, preview it, or replace/remove it. Save the project to apply the change. Published cards show the image above the title; cards without an image retain their existing layout.
- Images use `projects/images/` and `projects/covers/` in the same Blobs store, with the Article Studio upload validation and session checks. Draft previews require a session; public image requests require a matching published project. Replaced, removed, and unpublished images stop being served publicly. Failed uploads or saves preserve the previously saved image.
- Deploy the image feature once. Existing projects need no additional import or migration; subsequent image updates are stored without redeployment.
- Projects use the separate `projects/catalog-v1` namespace in the existing `article-studio-v1` Blobs store. Articles, covers, sessions, and project records cannot collide. The existing deployment-context suffix isolates preview/development storage from production.
- Both studios retain `/.netlify/functions/article-studio`, so the existing cookie path and credentials remain unchanged. Project resources are `projects-public` (public GET), `projects` (private GET), `projects-migrate` (private POST), and `projects-save` (private POST). Every private operation requires the existing server session.
- Stable IDs identify edits regardless of title or category. Record revisions and catalog ETags reject stale or simultaneous writes instead of losing someone else's changes. Retry simultaneous saves; for a stale project, copy your unsaved edits and reopen its latest version.
- New projects appear first; editing existing projects preserves their ordering. Unknown technologies receive readable text badges; existing technology icon/color mappings are preserved.
- Save changes keeps a published project public. Unpublish makes its saved version a private draft. The editor retains input when saves fail and while you unlock again after session expiry. Closing the dialog, navigating back, or explicitly locking discards unsaved edits.
- Lock Studio revokes the shared server token. Either studio requires unlocking again. No private data is stored in browser local storage.

## Local development and verification

Use `npm.cmd run dev:netlify` and visit `http://localhost:8888/#projects` on Windows (`npm` on other shells). Plain Vite serves the UI but does not provide Netlify Functions. Local imports edit local Blobs data only.

Checks:

```text
npm.cmd run typecheck:studio
npm.cmd run lint:studio
npm.cmd test
npm.cmd run test:ui
npm.cmd run build
npm.cmd run typecheck
npm.cmd run lint
```

The API tests cover unauthorized draft reads and mutations, shared sessions and expiry/logout, explicit repeatable migration, required fields and URL validation, draft/publish/edit/category-change/unpublish, failed saves, stale revisions, concurrent edits, and storage outages. The local Blobs integration test verifies project and article persistence across service restarts. UI tests exercise all five filters, shared PIN access in both directions, incorrect PIN feedback, form validation, retained edits after failure/expiry, and the Mobile Apps acceptance flow.

Verification completed: 22 Node tests and 10 UI tests pass, including project image upload/preview/removal, failed-upload/save retries, private image access, persistent image bytes, the existing Article Studio flows, and contact validation/payload with mocked EmailJS delivery. A local Edge browser check at 1280×960 and 390×844 verified layout, the real HTTP-only cookie flow, import, publishing a Mobile Apps project, logout, signed-out refresh, and filtering. Desktop and mobile screenshots were inspected; the mobile editor scrolls to its actions without horizontal overflow.

Studio-specific type checking and linting pass. Repository-wide checks currently fail in untouched code: animation typing in About/Education/Experience, missing dependencies for unused UI components, and existing React refresh/hooks lint violations. These do not block the production Vite build.

Production PIN verification, production Blobs access, and actual Gmail delivery require your deployed environment and are not exercised by isolated tests. Test fixtures use a test-only verifier; the production verifier is unchanged and server-only.
