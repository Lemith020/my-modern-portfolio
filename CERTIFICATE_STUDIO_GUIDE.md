# Certificate Studio

Certificate Studio uses the same PIN, server-only verifier, HTTP-only cookie, one-hour session, origin checks, rate limits, Netlify Function, and Netlify Blobs store as Article Studio and Project Studio. A valid session opens any studio. Lock Studio revokes access to all three. No new environment settings are needed.

## One-time setup after deployment

1. Deploy the updated repository using the normal Netlify build. Production deployment and production data changes are left to you.
2. Open **Certifications → Open Studio** and unlock with your existing PIN.
3. Click **Import existing certificates** once. The import stores the four existing records and their original image bytes in Netlify Blobs, preserving order and stable IDs. Interrupted or repeated imports never duplicate records or overwrite subsequent edits.
4. Use **New certificate** or **Edit**. Save incomplete work as a draft, or add the name, issuing organisation, description, and image and choose **Publish certificate**. Dates and credential URLs are optional; supplied URLs must be HTTP or HTTPS.
5. Refresh a signed-out window to check the public card and its larger image preview. Subsequent edits, uploads, publication, and unpublication need no Git push or redeployment.

The original cards remain available through the API before import. Once imported, stored records are authoritative, even if all certificates are unpublished. Storage failures show Retry and never bring back a hardcoded listing.

## Images and original content

- Upload PNG, JPG/JPEG, or WebP, up to 3 MB. The server uses the existing Studios' content-signature, MIME-type, and size validation. The editor previews the selected image; **Change image** replaces it when the record is saved.
- Cards, editor thumbnails, and the larger preview preserve the full image without cropping. The preview supports keyboard activation, focus trapping, Escape to close, and focus restoration.
- Draft records and uploaded draft images require a valid session. Public image requests must match a currently published certificate and its current image key. Old URLs stop working after replacement or unpublishing.
- Original images were moved unchanged from `public/certificates/` into `netlify/assets/certificates/`. They are included in the server function bundle via `included_files`, not shipped as public static files. This lets unpublishing hide even an imported original image. The initial migration copies those original bytes to persistent storage.
- Dates were read from the original images: Cloud Practitioner **2026-02-25**, Networking Basics **2026-02-28**, Well-Architected **2026-03-05**, and Computer Literacy **2024-12-04**. Computer Literacy's issuer was corrected to **The Open University of Sri Lanka**, as printed on the original certificate. Existing titles/descriptions and ordering are retained. Placeholder `#` links become empty; no credential URL is invented.
- The mockup supplies layout guidance only; its generated certificate text, dates, and images are not used.

Netlify's [function configuration documentation](https://docs.netlify.com/build/functions/configuration/) describes the `included_files` bundling setting. Keep that setting and the server asset directory when deploying this feature.

## Persistence, conflicts, and cleanup

Certificates use `certificates/catalog-v1`, `certificates/images/`, and `certificates/covers/` in the existing deployment-scoped Blobs store. Article/project records and images remain separate. All requests use the existing `/.netlify/functions/article-studio` endpoint, retaining the cookie path.

Public resources: `certificates-public` and `certificates-public-cover`. Private resources: `certificates`, `certificates-cover`, `certificates-upload`, `certificates-migrate`, and `certificates-save`. Every private request checks the shared session server-side.

Stable IDs, record revisions, and catalog ETags protect saved data and unrelated records. Failed requests retain editor input and the selected image. A successfully uploaded image is reused on save retry. Session expiry hides the editor and lets you unlock again without losing its input. Explicit locking, closing the editor, or navigating away discards unsaved changes.

Replaced images are retired atomically with the successful catalog update, only when no certificate (including drafts) references them. Retired keys cannot be reattached by a racing save. Blob deletion follows that commit. A cleanup failure does not undo the saved certificate; a later save retries deletion. Images referenced by unpublished drafts are retained. Abandoned uploads that were never saved are retained rather than risking deletion of an active editor's upload.

## Verification

Use `npm.cmd run dev:netlify` and visit `http://localhost:8888/#certifications` for local editing on Windows. Local imports affect local storage only.

```text
npm.cmd run typecheck:studio
npm.cmd run lint:studio
npm.cmd test
npm.cmd run test:ui
npm.cmd run build
npm.cmd run typecheck
npm.cmd run lint
```

Tests cover shared access, wrong PIN, session expiry/logout, unauthorized requests, real source-image preservation, interrupted/repeated migration, required fields, dates/URLs, upload validation, private drafts/images, publish/edit/replace/unpublish, conflicts, cleanup references/failures, and retained input. The local Netlify Blobs integration checks persistence across service restarts for all three studios. Existing Article/Project UI flows and mocked contact-form delivery are included.

Verified locally: 27 Node tests and 13 UI tests pass; Studio type/lint checks and the production Vite build pass. The local Netlify function ZIP contains all four original image assets. An Edge browser check at desktop and mobile widths passed import, upload, draft, publish, logout, signed-out refresh, and the full portrait preview with Escape/focus restoration. Screenshots were inspected. Tests allow extra time for the real scrypt verifier under CPU contention; generated test/browser artifacts are excluded from lint.

Repository-wide type/lint checks have existing failures outside the Studio feature (animation typing, missing dependencies for unused UI components, and React hooks/refresh lint rules). Production PIN/Blobs behavior and actual Gmail delivery still require your deployed environment. Automated tests use a test-only verifier and do not send real email.
