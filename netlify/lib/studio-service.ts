import { randomUUID } from "node:crypto";
import { articles as samples } from "../../src/data/articles.ts";
import type { MediumArticle } from "../../src/data/articles.ts";
import { MAX_COVER_BYTES, STUDIO_ENDPOINT } from "../../src/lib/article-studio-types.ts";
import type { StudioArticle } from "../../src/lib/article-studio-types.ts";
import { digest, newToken, productionVerifier, readToken, SESSION_MS, sessionCookie, verifyPin } from "./studio-auth.ts";
import type { PinVerifier } from "./studio-auth.ts";
import type { StudioStore } from "./studio-store.ts";

type Catalog = { articles: StudioArticle[] };
type Session = { expiresAt: number };
type Cover = { type: string; size: number };
type Options = { verifier?: PinVerifier; now?: () => number; secureCookies?: boolean };
const RATE_WINDOW = 15 * 60 * 1000;
const ID = /^[a-zA-Z0-9-]{1,80}$/;
const COVER_KEY = /^[a-f0-9-]{36}\.(png|jpg|webp)$/;

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

const responseHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "Netlify-CDN-Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Vary": "Cookie",
};
function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...responseHeaders, "Content-Type": "application/json", ...headers } });
}

async function bytes(request: Request, limit: number): Promise<Uint8Array> {
  if (Number(request.headers.get("content-length")) > limit) throw new HttpError(413, "File or request is too large.");
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > limit) { await reader.cancel(); throw new HttpError(413, "File or request is too large."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result;
}

async function body(request: Request): Promise<Record<string, unknown>> {
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json") throw new HttpError(415, "Send JSON data.");
  try {
    const value: unknown = JSON.parse(new TextDecoder().decode(await bytes(request, 16 * 1024)));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, "Invalid request data.");
  }
}

export function initialCatalog(): Catalog {
  return { articles: samples.map(article => ({
    ...article, coverKey: "", status: "published", revision: "sample-v1", updatedAt: "",
  })) };
}

function publicArticle(article: StudioArticle): MediumArticle {
  return {
    id: article.id, title: article.title, category: article.category, description: article.description,
    mediumUrl: article.mediumUrl, isSample: article.isSample, imageAlt: article.title,
    image: article.coverKey
      ? `${STUDIO_ENDPOINT}?resource=public-cover&id=${encodeURIComponent(article.id)}&key=${encodeURIComponent(article.coverKey)}`
      : article.image,
  };
}

export function validArticleUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && url.hostname.includes(".") && url.pathname !== "/";
  } catch { return false; }
}

function imageType(data: Uint8Array): { mime: string; extension: string } | null {
  const b = Buffer.from(data);
  if (b.length >= 24 && b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) && b.toString("ascii", 12, 16) === "IHDR") return { mime: "image/png", extension: "png" };
  if (b.length >= 4 && b[0] === 255 && b[1] === 216 && b[2] === 255 && b[b.length - 2] === 255 && b[b.length - 1] === 217) return { mime: "image/jpeg", extension: "jpg" };
  if (b.length >= 20 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" && ["VP8 ", "VP8L", "VP8X"].includes(b.toString("ascii", 12, 16))) return { mime: "image/webp", extension: "webp" };
  return null;
}

export function createStudioService(store: StudioStore, options: Options = {}) {
  const now = options.now ?? Date.now;
  const verifier = options.verifier ?? productionVerifier;
  const secureCookies = options.secureCookies ?? true;

  async function requireSession(request: Request) {
    const token = readToken(request);
    if (!token) throw new HttpError(401, "Your session has expired. Unlock Studio again.");
    const key = `sessions/${digest(token)}`;
    const entry = await store.read<Session>(key);
    if (!entry || entry.data.expiresAt <= now()) throw new HttpError(401, "Your session has expired. Unlock Studio again.");
    return { key, expiresAt: entry.data.expiresAt };
  }

  async function claimAttempt(scope: string, count: number) {
    const window = Math.floor(now() / RATE_WINDOW);
    // Claim immutable slots atomically, rather than keeping an instance-local counter.
    for (let slot = 0; slot < count; slot++) {
      if (await store.write(`attempts/${window}/${scope}/${slot}`, { expiresAt: (window + 2) * RATE_WINDOW }, { onlyIfNew: true })) return;
    }
    throw new HttpError(429, "Too many unlock attempts. Please wait up to 15 minutes and retry.");
  }

  async function catalog() {
    const saved = await store.read<Catalog>("catalog");
    return { data: saved?.data ?? initialCatalog(), etag: saved?.etag };
  }

  return async function handle(request: Request, ip = "unknown"): Promise<Response> {
    try {
      const url = new URL(request.url);
      const resource = url.searchParams.get("resource") ?? "public";
      if (!["GET", "POST"].includes(request.method)) throw new HttpError(405, "Method not allowed.");
      if (request.method === "POST") {
        if (request.headers.get("origin") !== url.origin || request.headers.get("sec-fetch-site") === "cross-site") throw new HttpError(403, "Request origin is not allowed.");
      }

      if (resource === "login" && request.method === "POST") {
        const data = await body(request);
        if (typeof data.pin !== "string" || !data.pin || Buffer.byteLength(data.pin, "utf8") > 1024) throw new HttpError(400, "Enter PIN.");
        await claimAttempt(`ip-${digest(ip)}`, 5);
        await claimAttempt("global", 30);
        if (!await verifyPin(data.pin, verifier)) throw new HttpError(401, "Incorrect PIN");
        const token = newToken();
        const expiresAt = now() + SESSION_MS;
        if (!await store.write(`sessions/${digest(token)}`, { expiresAt }, { onlyIfNew: true })) throw new Error("Session could not be stored.");
        return json({ expiresAt }, 200, { "Set-Cookie": sessionCookie(token, secureCookies) });
      }

      if (resource === "public" && request.method === "GET") {
        const saved = await catalog();
        return json({ articles: saved.data.articles.filter(a => a.status === "published").map(publicArticle) });
      }

      if (resource === "public-cover" && request.method === "GET") {
        const key = url.searchParams.get("key") ?? "";
        const saved = await catalog();
        const published = saved.data.articles.find(a => a.id === url.searchParams.get("id") && a.status === "published" && a.coverKey === key);
        if (!COVER_KEY.test(key) || !published) throw new HttpError(404, "Cover not found.");
        return await coverResponse(key);
      }

      const session = await requireSession(request);
      if (resource === "session" && request.method === "GET") return json({ expiresAt: session.expiresAt });
      if (resource === "logout" && request.method === "POST") {
        await store.remove(session.key);
        return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", secureCookies, 0) });
      }
      if (resource === "articles" && request.method === "GET") return json((await catalog()).data);
      if (resource === "cover" && request.method === "GET") {
        const key = url.searchParams.get("key") ?? "";
        if (!COVER_KEY.test(key)) throw new HttpError(404, "Cover not found.");
        return await coverResponse(key);
      }
      if (resource === "upload" && request.method === "POST") {
        const data = await bytes(request, MAX_COVER_BYTES);
        const type = imageType(data);
        if (!type || request.headers.get("content-type") !== type.mime) throw new HttpError(415, "Choose a PNG, JPEG, or WebP image (up to 3 MB).");
        const key = `${randomUUID()}.${type.extension}`;
        // New keys keep the previously saved cover intact when a later save fails.
        await store.writeBytes(`images/${key}`, data.buffer as ArrayBuffer);
        await store.write(`covers/${key}`, { type: type.mime, size: data.length });
        return json({ key }, 201);
      }
      if (resource === "save" && request.method === "POST") {
        const data = await body(request);
        const saved = await catalog();
        const id = data.id;
        if (typeof id !== "string" || !ID.test(id)) throw new HttpError(400, "Invalid article ID.");
        const previous = saved.data.articles.find(a => a.id === id);
        if ((previous?.revision ?? null) !== (data.revision ?? null)) throw new HttpError(409, "This article changed in another session. Reopen it from My articles before saving.");
        if (!["draft", "publish", "unpublish"].includes(String(data.action))) throw new HttpError(400, "Invalid article action.");
        let article: StudioArticle;
        if (data.action === "unpublish") {
          if (!previous) throw new HttpError(404, "Article not found.");
          article = { ...previous, status: "draft" };
        } else {
          const limits = { title: 160, category: 80, description: 600, mediumUrl: 2048, coverKey: 80 };
          const fields: Record<string, string> = {};
          for (const [field, max] of Object.entries(limits)) {
            if (typeof data[field] !== "string" || (data[field] as string).length > max) throw new HttpError(400, `Check the ${field} field (maximum ${max} characters).`);
            fields[field] = (data[field] as string).trim();
          }
          if (fields.coverKey && (!COVER_KEY.test(fields.coverKey) || !await store.read(`covers/${fields.coverKey}`))) throw new HttpError(400, "Upload the cover again before saving.");
          const image = previous?.image ?? "";
          if (data.action === "publish" && (!fields.title || !fields.category || !fields.description || (!fields.coverKey && !image) || !validArticleUrl(fields.mediumUrl))) throw new HttpError(400, "To publish, add a title, category, summary, cover, and a valid HTTPS article link.");
          article = {
            id, title: fields.title, category: fields.category, description: fields.description,
            mediumUrl: fields.mediumUrl, coverKey: fields.coverKey, image,
            revision: "", updatedAt: "", status: data.action === "publish" ? "published" : "draft",
            isSample: previous?.isSample === true && !fields.mediumUrl,
          };
        }
        article.revision = randomUUID();
        article.updatedAt = new Date(now()).toISOString();
        const articles = previous ? saved.data.articles.map(a => a.id === id ? article : a) : [article, ...saved.data.articles];
        if (!await store.write("catalog", { articles }, saved.etag ? { onlyIfMatch: saved.etag } : { onlyIfNew: true })) throw new HttpError(409, "Another save happened at the same time. Your edits are still here; retry saving.");
        return json({ article });
      }
      throw new HttpError(404, "Operation not found.");
    } catch (error) {
      if (error instanceof HttpError) return json({ error: error.message }, error.status, error.status === 429 ? { "Retry-After": "900" } : {});
      // Do not log requests, credentials, tokens, or private article content.
      return json({ error: "Studio is temporarily unavailable. Please retry. Your previously saved article and cover are safe." }, 503);
    }
  };

  async function coverResponse(key: string) {
    const meta = await store.read<Cover>(`covers/${key}`);
    if (!meta) throw new HttpError(404, "Cover not found.");
    const data = await store.readBytes(`images/${key}`);
    if (!data) throw new HttpError(404, "Cover not found.");
    return new Response(data, { headers: { ...responseHeaders, "Content-Type": meta.data.type, "Content-Security-Policy": "default-src 'none'; sandbox" } });
  }
}
