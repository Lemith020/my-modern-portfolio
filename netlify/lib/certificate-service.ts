import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { certificateSeeds } from "./certificate-seeds.ts";
import { STUDIO_ENDPOINT } from "../../src/lib/article-studio-types.ts";
import { validProjectUrl } from "../../src/lib/project-studio-types.ts";
import { validIssueDate } from "../../src/lib/certificate-studio-types.ts";
import type { CertificateCatalog, StudioCertificate } from "../../src/lib/certificate-studio-types.ts";
import type { StudioStore } from "./studio-store.ts";
import { HttpError } from "./studio-http.ts";

export const CERTIFICATE_CATALOG_KEY = "certificates/catalog-v1";
type Catalog = CertificateCatalog & { retiredKeys: string[] };
type Cover = { type: string; size: number };
const seedKey = (id: string) => `seed-${id}.png`;
const validKey = (key: string) => /^[a-f0-9-]{36}\.(png|jpg|webp)$/.test(key) || certificateSeeds.some(s => seedKey(s.id) === key);
export function initialCertificateCatalog(): Catalog {
  return { migrated: false, retiredKeys: [], certificates: certificateSeeds.map(seed => ({
    id: seed.id, title: seed.title, issuer: seed.issuer, issueDate: seed.issueDate, description: seed.description, link: seed.link,
    coverKey: seedKey(seed.id), status: "published", revision: "import-v1", updatedAt: "",
  })) };
}
async function originalImage(key: string): Promise<ArrayBuffer> {
  const seed = certificateSeeds.find(s => seedKey(s.id) === key);
  if (!seed) throw new HttpError(404, "Certificate image not found.");
  const data = await readFile(path.join(process.cwd(), "netlify/assets/certificates", seed.file));
  return Uint8Array.from(data).buffer;
}

export function createCertificateService(store: StudioStore, now: () => number) {
  async function catalog() {
    const saved = await store.read<Catalog>(CERTIFICATE_CATALOG_KEY);
    return { data: saved?.data ?? initialCertificateCatalog(), etag: saved?.etag };
  }
  async function cleanup(retiredKeys: string[]) {
    // Retirement is committed with the catalog. Future saves cannot reattach these
    // keys, so deletion cannot race a new reference or affect another certificate.
    for (const key of retiredKeys) {
      try { await store.remove(`certificates/images/${key}`); await store.remove(`certificates/covers/${key}`); }
      catch { /* A later save retries cleanup without undoing the successful edit. */ }
    }
  }
  return {
    async catalog(): Promise<CertificateCatalog> { const { data } = await catalog(); return { certificates: data.certificates, migrated: data.migrated }; },
    async publicCertificates() {
      return { certificates: (await catalog()).data.certificates.filter(c => c.status === "published").map(c => ({
        id: c.id, title: c.title, issuer: c.issuer, issueDate: c.issueDate, description: c.description, link: c.link,
        image: `${STUDIO_ENDPOINT}?resource=certificates-public-cover&id=${encodeURIComponent(c.id)}&key=${encodeURIComponent(c.coverKey)}`,
      })) };
    },
    async image(key: string, id: string | null, publicAccess: boolean) {
      const { data } = await catalog();
      if (!validKey(key) || data.retiredKeys.includes(key)) throw new HttpError(404, "Certificate image not found.");
      if (publicAccess && !data.certificates.some(c => c.id === id && c.status === "published" && c.coverKey === key)) throw new HttpError(404, "Certificate image not found.");
      if (!data.migrated && certificateSeeds.some(s => seedKey(s.id) === key)) return { data: await originalImage(key), type: "image/png" };
      const meta = await store.read<Cover>(`certificates/covers/${key}`);
      const bytes = meta && await store.readBytes(`certificates/images/${key}`);
      if (!meta || !bytes) throw new HttpError(404, "Certificate image not found.");
      return { data: bytes, type: meta.data.type };
    },
    async migrate(): Promise<CertificateCatalog> {
      const saved = await catalog();
      if (saved.data.migrated) return { certificates: saved.data.certificates, migrated: true };
      for (const seed of certificateSeeds) {
        const key = seedKey(seed.id);
        const bytes = await originalImage(key);
        if (!await store.readBytes(`certificates/images/${key}`)) {
          try { await store.writeBytes(`certificates/images/${key}`, bytes); }
          catch (error) { if (!await store.readBytes(`certificates/images/${key}`)) throw error; }
        }
        await store.write(`certificates/covers/${key}`, { type: "image/png", size: bytes.byteLength }, { onlyIfNew: true });
      }
      await store.write(CERTIFICATE_CATALOG_KEY, { ...initialCertificateCatalog(), migrated: true }, { onlyIfNew: true });
      const { data } = await catalog();
      return { certificates: data.certificates, migrated: data.migrated };
    },
    async save(input: Record<string, unknown>) {
      const saved = await catalog();
      if (!saved.etag || !saved.data.migrated) throw new HttpError(409, "Import existing certificates before saving.");
      if (typeof input.id !== "string" || !/^[a-zA-Z0-9-]{1,80}$/.test(input.id)) throw new HttpError(400, "Invalid certificate ID.");
      const previous = saved.data.certificates.find(c => c.id === input.id);
      if ((previous?.revision ?? null) !== (input.revision ?? null)) throw new HttpError(409, "This certificate changed in another session. Copy your edits, then reopen it from My certificates.");
      if (!["draft", "publish", "unpublish"].includes(String(input.action))) throw new HttpError(400, "Invalid certificate action.");
      let certificate: StudioCertificate;
      if (input.action === "unpublish") {
        if (!previous) throw new HttpError(404, "Certificate not found.");
        certificate = { ...previous, status: "draft" };
      } else {
        const fields: Record<string, string> = {};
        for (const [field, max] of Object.entries({ title: 160, issuer: 160, description: 2000, issueDate: 10, link: 2048, coverKey: 100 })) {
          if (typeof input[field] !== "string" || input[field].length > max) throw new HttpError(400, `Check the ${field} field (maximum ${max} characters).`);
          fields[field] = input[field].trim();
        }
        if (!validIssueDate(fields.issueDate)) throw new HttpError(400, "Choose a valid issue date or leave it empty.");
        if (fields.link && !validProjectUrl(fields.link)) throw new HttpError(400, "Credential URL must be a valid HTTP or HTTPS URL.");
        if (fields.coverKey && (!validKey(fields.coverKey) || saved.data.retiredKeys.includes(fields.coverKey) || !await store.read(`certificates/covers/${fields.coverKey}`))) throw new HttpError(400, "Upload the certificate image again before saving.");
        if (input.action === "publish" && (!fields.title || !fields.issuer || !fields.description || !fields.coverKey)) throw new HttpError(400, "To publish, add a certificate name, issuing organisation, description, and image.");
        certificate = { id: input.id, title: fields.title, issuer: fields.issuer, issueDate: fields.issueDate, description: fields.description, link: fields.link, coverKey: fields.coverKey, status: input.action === "publish" ? "published" : "draft", revision: "", updatedAt: "" };
      }
      certificate.revision = randomUUID(); certificate.updatedAt = new Date(now()).toISOString();
      const certificates = previous ? saved.data.certificates.map(c => c.id === certificate.id ? certificate : c) : [certificate, ...saved.data.certificates];
      const retiredKeys = [...saved.data.retiredKeys];
      if (previous?.coverKey && previous.coverKey !== certificate.coverKey && !certificates.some(c => c.coverKey === previous.coverKey)) retiredKeys.push(previous.coverKey);
      if (!await store.write(CERTIFICATE_CATALOG_KEY, { certificates, retiredKeys, migrated: true }, { onlyIfMatch: saved.etag })) throw new HttpError(409, "Another save happened at the same time. Your edits are still here; retry saving.");
      await cleanup(retiredKeys);
      return { certificate };
    },
  };
}
