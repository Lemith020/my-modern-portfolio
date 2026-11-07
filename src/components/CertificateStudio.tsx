import { useEffect, useRef, useState } from "react";
import { ArrowLeft, LockKeyhole, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StudioDialog } from "@/components/StudioDialog";
import { StudioApiError, studioRequest } from "@/lib/article-studio-api";
import { MAX_COVER_BYTES, STUDIO_ENDPOINT } from "@/lib/article-studio-types";
import { validProjectUrl } from "@/lib/project-studio-types";
import { validIssueDate } from "@/lib/certificate-studio-types";
import type { CertificateCatalog, CertificateFields, StudioCertificate } from "@/lib/certificate-studio-types";

const greenButton = "bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl min-h-11";
const errorText = (error: unknown) => error instanceof Error ? error.message : "Something went wrong. Please retry.";

export function CertificateStudio({ onChanged }: { onChanged: () => void }) {
  return <StudioDialog title="Certificate Studio" description="Create, edit, and publish your certificates." ownerLabel="Owner access only. Create and manage your certificates.">
    {props => <CertificateWorkspace {...props} onChanged={onChanged} />}
  </StudioDialog>;
}

function CertificateWorkspace({ onChanged, onExpired, onLock, locking }: {
  onChanged: () => void; onExpired: () => void; onLock: () => Promise<void>; locking: boolean;
}) {
  const [catalog, setCatalog] = useState<CertificateCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<StudioCertificate | "new" | null>(null);
  const [retry, setRetry] = useState(0);
  const [saving, setSaving] = useState(false);
  const expireRef = useRef(onExpired);
  useEffect(() => { expireRef.current = onExpired; }, [onExpired]);
  useEffect(() => {
    let active = true;
    studioRequest<CertificateCatalog>("certificates")
      .then(data => { if (active) { setCatalog(data); setError(""); } })
      .catch(err => {
        if (!active) return;
        setError(errorText(err));
        if (err instanceof StudioApiError && err.status === 401) expireRef.current();
      }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);

  async function migrate() {
    setLoading(true);
    setError("");
    try {
      setCatalog(await studioRequest<CertificateCatalog>("certificates-migrate", {}));
      setNotice("Existing certificates imported. You can now edit and publish without redeploying.");
      onChanged();
    } catch (err) {
      setError(errorText(err));
      if (err instanceof StudioApiError && err.status === 401) onExpired();
    } finally { setLoading(false); }
  }

  function saved(certificate: StudioCertificate) {
    setCatalog(current => current && ({ ...current, certificates: current.certificates.some(p => p.id === certificate.id)
      ? current.certificates.map(p => p.id === certificate.id ? certificate : p) : [certificate, ...current.certificates] }));
    setEditing(null);
    setNotice(certificate.status === "published" ? "Published. Your certificate is now in Certifications." : "Draft saved. This certificate is private.");
    onChanged();
  }

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <div className="flex flex-wrap gap-2">
        <Button variant={editing ? "ghost" : "secondary"} disabled={saving || locking} onClick={() => setEditing(null)}>My certificates</Button>
        <Button variant={editing === "new" ? "secondary" : "ghost"} className="text-emerald-600 dark:text-emerald-400" disabled={loading || locking || saving || !catalog?.migrated} onClick={() => { setNotice(""); setEditing("new"); }}><Plus aria-hidden="true" />New certificate</Button>
      </div>
      <Button variant="outline" onClick={() => { void onLock(); }} disabled={locking || saving}><LockKeyhole aria-hidden="true" />Lock Studio</Button>
    </div>
    {notice && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">{notice}</p>}
    {editing ? <CertificateEditor key={editing === "new" ? "new" : editing.id} certificate={editing === "new" ? undefined : editing} onSaved={saved} onBack={() => setEditing(null)} onExpired={onExpired} onBusy={setSaving} locking={locking} /> : <>
      <h3 className="text-lg font-semibold">My certificates</h3>
      {loading && <p role="status" className="text-sm text-muted-foreground">Loading certificates...</p>}
      {error && <div role="alert" className="space-y-2"><p className="text-sm text-red-600 dark:text-red-400">{error}</p><Button variant="outline" disabled={loading} onClick={() => { setLoading(true); setRetry(n => n + 1); }}>Retry</Button></div>}
      {catalog && !catalog.migrated && <div className="space-y-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
        <p className="text-sm">Import your existing certificates once to start editing. Their content and order will be preserved. Repeating the import keeps later edits.</p>
        <Button className={greenButton} disabled={loading || locking} onClick={() => { void migrate(); }}>Import existing certificates</Button>
      </div>}
      {!loading && !error && catalog?.certificates.length === 0 && <p className="text-sm text-muted-foreground">Your first certificate starts here.</p>}
      <ul className="space-y-3">
        {catalog?.certificates.map(certificate => <li key={certificate.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-4">
          <div className="flex min-w-0 items-center gap-3">{certificate.coverKey && <img src={`${STUDIO_ENDPOINT}?resource=certificates-cover&key=${encodeURIComponent(certificate.coverKey)}`} alt="" className="h-16 w-20 shrink-0 rounded border border-border bg-muted object-contain" />}<div className="min-w-0"><p className="font-medium break-words">{certificate.title || "Untitled certificate"}</p><p className="mt-1 text-xs text-muted-foreground">{certificate.issuer || "No issuer"} · {certificate.status === "published" ? "Published" : "Draft"}</p></div></div>
          <Button variant="outline" className="shrink-0" aria-label={`Edit ${certificate.title || "Untitled certificate"}`} disabled={loading || locking || !catalog.migrated} onClick={() => { setNotice(""); setEditing(certificate); }}>Edit</Button>
        </li>)}
      </ul>
    </>}
  </div>;
}

function CertificateEditor({ certificate, onSaved, onBack, onExpired, onBusy, locking }: {
  certificate?: StudioCertificate; onSaved: (certificate: StudioCertificate) => void; onBack: () => void;
  onExpired: () => void; onBusy: (busy: boolean) => void; locking: boolean;
}) {
  const [id] = useState(() => certificate?.id ?? crypto.randomUUID());
  const [fields, setFields] = useState<CertificateFields>(() => ({ title: certificate?.title ?? "", issuer: certificate?.issuer ?? "", issueDate: certificate?.issueDate ?? "", description: certificate?.description ?? "", link: certificate?.link ?? "", coverKey: certificate?.coverKey ?? "" }));
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(() => certificate?.coverKey ? `${STUDIO_ENDPOINT}?resource=certificates-cover&key=${encodeURIComponent(certificate.coverKey)}` : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const imageInput = useRef<HTMLInputElement>(null);
  const objectUrl = useRef<string | null>(null);
  const uploaded = useRef<{ file: File; key: string } | null>(null);
  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);

  function chooseImage(next?: File) {
    if (!next) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(next.type) || next.size > MAX_COVER_BYTES) {
      setError("Choose a PNG, JPEG, or WebP image (up to 3 MB).");
      if (imageInput.current) imageInput.current.value = "";
      return;
    }
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(next);
    setFile(next); setPreview(objectUrl.current); setError("");
  }

  async function save(action: "draft" | "publish" | "unpublish") {
    setError("");
    if (action !== "unpublish") {
      if (action === "publish" && (!fields.title.trim() || !fields.issuer.trim() || !fields.description.trim() || (!fields.coverKey && !file))) { setError("To publish, add a certificate name, issuing organisation, description, and image."); return; }
      if (fields.link.trim() && !validProjectUrl(fields.link.trim())) { setError("Credential URL must be a valid HTTP or HTTPS URL."); return; }
      if (!validIssueDate(fields.issueDate)) { setError("Choose a valid issue date or leave it empty."); return; }
    }
    setBusy(true); onBusy(true);
    try {
      let coverKey = fields.coverKey;
      if (file && action !== "unpublish") {
        if (uploaded.current?.file !== file) {
          setProgress("Uploading image...");
          const result = await studioRequest<{ key: string }>("certificates-upload", undefined, file);
          uploaded.current = { file, key: result.key };
        }
        coverKey = uploaded.current.key;
      }
      setProgress("Saving...");
      const result = await studioRequest<{ certificate: StudioCertificate }>("certificates-save", { ...fields, coverKey, id, revision: certificate?.revision ?? null, action });
      onSaved(result.certificate);
    } catch (err) {
      setError(errorText(err));
      if (err instanceof StudioApiError && err.status === 401) onExpired();
    } finally { setBusy(false); onBusy(false); }
  }

  const field = (name: keyof CertificateFields) => ({ value: fields[name], onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFields(current => ({ ...current, [name]: event.target.value })) });
  return <form className="space-y-5" noValidate onSubmit={event => { event.preventDefault(); void save("publish"); }}>
    <h3 className="text-xl font-bold">{certificate ? "Edit certificate" : "New certificate"}</h3>
    <p className="text-xs text-muted-foreground">Name, organisation, description, and image are required to publish. You can save an incomplete draft.</p>
    <fieldset disabled={busy || locking} className="min-w-0 space-y-5">
      <div className="space-y-2"><Label htmlFor="certificate-title">Certificate name</Label><Input id="certificate-title" maxLength={160} placeholder="Enter certificate name" {...field("title")} /></div>
      <div className="space-y-2"><Label htmlFor="certificate-issuer">Issuing organisation</Label><Input id="certificate-issuer" maxLength={160} placeholder="Enter issuing organisation" {...field("issuer")} /></div>
      <div className="space-y-2"><Label htmlFor="certificate-date">Issue date (optional)</Label><Input id="certificate-date" type="date" {...field("issueDate")} /></div>
      <div className="space-y-2"><Label htmlFor="certificate-description">Short description</Label><Textarea id="certificate-description" rows={3} maxLength={2000} placeholder="Enter a brief description of the certificate" {...field("description")} /></div>
      <div className="space-y-2">
        <Label htmlFor="certificate-image">Certificate image</Label>
        <div className="space-y-3 rounded-2xl border border-dashed border-emerald-500/50 bg-emerald-500/5 p-4">
          {preview && <img src={preview} alt="Certificate image preview" className="mx-auto max-h-64 w-full rounded-lg object-contain" />}
          <Input ref={imageInput} id="certificate-image" type="file" accept="image/png,image/jpeg,image/webp" className="h-auto py-2" aria-describedby="certificate-image-help" onChange={event => chooseImage(event.target.files?.[0])} />
          {preview && <Button type="button" variant="outline" onClick={() => imageInput.current?.click()}>Change image</Button>}
          <p id="certificate-image-help" className="text-xs text-muted-foreground">PNG, JPG/JPEG, or WebP · Up to 3 MB. The full certificate is displayed without cropping.</p>
        </div>
      </div>
      <div className="space-y-2"><Label htmlFor="certificate-link">Credential URL (optional)</Label><Input id="certificate-link" inputMode="url" maxLength={2048} placeholder="https://" {...field("link")} /></div>
    </fieldset>
    {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error} Your form is still here; retry when ready.</p>}
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <Button type="button" variant="ghost" onClick={onBack} disabled={busy || locking}><ArrowLeft aria-hidden="true" />Back</Button>
      {certificate?.status !== "published" && <Button type="button" variant="outline" disabled={busy || locking} onClick={() => { void save("draft"); }}>Save draft</Button>}
      <Button type="submit" className={greenButton} disabled={busy || locking}>{certificate?.status === "published" ? "Save changes" : "Publish certificate"}</Button>
      {certificate?.status === "published" && <Button type="button" variant="outline" disabled={busy || locking} onClick={() => { void save("unpublish"); }}>Unpublish</Button>}
      {busy && <span role="status" className="text-sm text-muted-foreground">{progress || "Saving..."}</span>}
    </div>
  </form>;
}

