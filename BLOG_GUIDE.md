# Field Notes and Article Studio

Field Notes remains on the homepage at `#blog`. Use **Open Studio** below the article grid to manage your Medium cards. After the initial feature deployment, adding articles and covers requires no code edits, GitHub push, or Netlify rebuild.

The original sample cards retain their **Sample article** label and **Article coming soon** behavior. They also appear in the Studio. Initialization uses stable IDs and a conditional write so subsequent visits and deploys cannot duplicate or restore edited/unpublished samples.

## Publish an article

1. Select **Open Studio**, enter your existing PIN exactly, and press Enter or **Unlock**. Escape closes the dialog.
2. Choose **New article**, or **Edit** beside an existing entry.
3. Add the title, category, short summary, cover image, and your actual published Medium article URL.
4. **Save draft** accepts incomplete entries. **Publish** requires all five fields and a valid HTTPS article link, including Medium custom domains.
5. **Publish** on an existing entry updates the same card. **Unpublish** keeps it as a private draft. **Save draft** on a published entry also removes its public card; the editor explains this before saving.
6. Return to **My articles** and select **Lock Studio** when finished. Closing the dialog alone does not end the session. Sessions expire after one hour.

Covers support PNG, JPEG, and WebP up to 3 MiB. The server checks size, MIME type, and file signature; SVG uploads are rejected. Each upload gets a new storage key. Failed uploads/saves preserve the previous saved article and cover, with editor fields retained for retry. Old/unused uploads stay private. No Medium links are invented.

## Run locally on Windows

Use Node.js 24. From this repository folder:

```powershell
npm.cmd install
npm.cmd run dev:netlify
```

Open **http://localhost:8888/#blog** and use your existing PIN. No `STUDIO_PIN` variable is needed. This command runs Netlify Dev offline with Vite, Functions, and isolated local Blobs. It needs no Netlify login and does not modify production data. Local articles persist under the ignored `.netlify` directory; they are not automatically published to your live site. Plain `npm run dev` serves only the frontend and cannot run the Studio API. Use `npm.cmd` in PowerShell if script policy blocks `npm.ps1`.

## One-time first deployment

Deploy these source changes through your existing Netlify Git build when ready. Nothing was deployed automatically.

- Keep the GitHub repository private if desired. Netlify needs its existing repository integration access.
- Set the Netlify base directory to this repository root, containing `package.json` and `netlify.toml`.
- The committed configuration uses Node 24, `npm run build`, publish directory `dist`, and Functions directory `netlify/functions`.
- Deploy the full source through a Netlify build, not only a drag-and-drop upload of `dist`; the Function must be included.
- Preserve the existing email environment variables. No new PIN, database, storage token, or account configuration is required for a normal Netlify Functions deployment.

Netlify provisions Blobs access for Functions automatically, and site-wide stores persist across deploys: [Netlify Blobs documentation](https://docs.netlify.com/build/data-and-storage/netlify-blobs/). The deployed site's account/Blobs availability has not been checked here. Unavailable storage produces a retry message, distinct from an incorrect PIN.

Production uses `article-studio-v1`. Other deploy contexts use separate suffixed stores, so preview deployments cannot edit the production catalog. Local development uses the isolated emulator. New covers and article records are never stored in Git, `public`, or the Function's temporary filesystem.

## Files and security

- `src/components/ArticleStudio.tsx`: accessible PIN dialog, article list, editor, upload preview, and retry messages using existing shared UI components.
- `src/components/BlogArticles.tsx`: runtime public listing and existing card design; `src/data/articles.ts` retains sample records as initial content.
- `src/lib/article-studio-api.ts` and `article-studio-types.ts`: browser requests and shared types.
- `netlify/functions/article-studio.ts`: same-origin API and storage isolation by deploy context.
- `netlify/lib/studio-auth.ts`: unchanged supplied verifier, asynchronous scrypt with the requested parameters, timing-safe comparison, and random session tokens.
- `netlify/lib/studio-service.ts`: shared rate limits, session checks, validation, public/private covers, and version-checked updates.
- `netlify/lib/studio-store.ts`: strongly consistent Blobs access with conditional writes. Its local-emulator compatibility path obtains stable ETags from LIST because local GET responses omit them; production requires GET ETags.
- `netlify.toml`, package files, `.gitignore`, `tsconfig.studio.json`, `vitest.studio.config.ts`, and `tests/article-studio*`: configuration, dependencies, and tests.

The PIN is sent only in a POST body and held transiently in the input/request. It is never logged, put in a URL, or saved in browser storage. Cookies are HttpOnly, SameSite=Strict, Secure outside local Netlify Dev, and expire after one hour. Only a token digest and expiry are stored server-side. Every private operation checks expiry; logout deletes the session. Cross-origin mutations are rejected. Atomic shared slot claims allow at most 5 PIN attempts per IP and 30 site-wide per fixed 15-minute window. Expired security records are ignored; Blobs does not automatically delete them.

Public listings return published entries only. Public cover requests recheck the article's current status and cover key, with browser/CDN `no-store` headers. Unpublishing revokes subsequent reads; previously downloaded public content cannot be recalled. ETags and article revisions reject conflicting edits. Failed replacements retain old cover data.

The contact component and email configuration, navigation, other portfolio sections, and shared UI components were not changed. No contact message was sent during testing. No mockup image was attached; the Studio follows the current typography, spacing, rounded corners, and green accents.

## Verification

```powershell
npm.cmd test
npm.cmd run test:ui
npm.cmd run typecheck:studio
npm.cmd run lint:studio
npm.cmd run build

# Repository-wide checks:
npm.cmd run typecheck
npm.cmd run lint
```

- **16 Node tests pass:** existing SEO tests plus PIN fidelity, unauthorized access, origin checks, expiry/logout, concurrent rate limits, draft/cover privacy, image validation, publish/edit/unpublish, safe initialization, failed saves, and stale edits.
- **Real Blobs integration passes:** the SDK and local emulator persist a card/cover across service instances, serve it to a signed-out reader, then remove public access after unpublishing without a build/deploy.
- **4 React DOM tests pass:** masked PIN, Enter/Escape and focus return, wrong-PIN feedback, network retry, upload preview, the complete editing/publishing flow, correct Medium link, logout, and form retention after a failed save. Success paths use a separate test-only verifier.
- **Feature TypeScript, feature lint, and production build pass.** The build emits a large-chunk advisory.
- **Real Netlify Dev smoke checks pass:** public listing 200, signed-out private/session requests 401, and an incorrect PIN 401 with **Incorrect PIN**.

Repository-wide lint still reports the same 12 pre-existing errors in shared UI/theme/hooks. The full TypeScript check still reports pre-existing animation typing errors and missing dependencies for unused UI components. These were detected before implementation and left outside this feature's scope.

Browser automation was unavailable, so visual/mobile inspection was not completed. The production PIN's success path and a live deployment were not exercised. Automated success tests use a separate test-only verifier; the production verifier has no environment override.

After deploying once, perform the live acceptance check: unlock with your PIN, upload a cover, publish your real Medium link, and open a signed-out/private browser to refresh Field Notes. Confirm the card/link, unpublish in Studio, and refresh the signed-out view to confirm removal.
