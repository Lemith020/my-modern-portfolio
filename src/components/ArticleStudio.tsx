import { useEffect, useRef, useState } from "react";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StudioDialog } from "@/components/StudioDialog";
import { StudioApiError, studioRequest } from "@/lib/article-studio-api";
import { MAX_COVER_BYTES, STUDIO_ENDPOINT } from "@/lib/article-studio-types";
import type { ArticleFields, StudioArticle } from "@/lib/article-studio-types";

const greenButton = "bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl min-h-11";
const errorText = (error: unknown) => error instanceof Error ? error.message : "Something went wrong. Please retry.";

export function ArticleStudio({ onChanged }: { onChanged: () => void }) {
  return <StudioDialog title="Article Studio" description="Manage the Medium articles shown in Field Notes.">
    {props => <StudioWorkspace onChanged={onChanged} {...props} />}
  </StudioDialog>;
}

function StudioWorkspace({ onChanged, onExpired, onLock, locking }: {
  onChanged: () => void; onExpired: () => void; onLock: () => Promise<void>; locking: boolean;
}) {
  const [articles, setArticles] = useState<StudioArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<StudioArticle | "new" | null>(null);
  const [retry, setRetry] = useState(0);
  const expireRef = useRef(onExpired);
  useEffect(() => { expireRef.current = onExpired; }, [onExpired]);

  useEffect(() => {
    let active = true;
    studioRequest<{ articles: StudioArticle[] }>("articles")
      .then(data => { if (active) { setArticles(data.articles); setError(""); } })
      .catch(err => {
        if (!active) return;
        if (err instanceof StudioApiError && err.status === 401) expireRef.current();
        else setError(errorText(err));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);

  function saved(article: StudioArticle) {
    setArticles(current => current.some(a => a.id === article.id) ? current.map(a => a.id === article.id ? article : a) : [article, ...current]);
    setEditing(null);
    setNotice(article.status === "published" ? "Published. Your card is now in Field Notes." : "Draft saved. This article is private.");
    onChanged();
  }

  if (editing) return <ArticleEditor key={editing === "new" ? "new" : editing.id} article={editing === "new" ? undefined : editing} onSaved={saved} onBack={() => setEditing(null)} onExpired={onExpired} />;

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="font-semibold text-lg">My articles</h3>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => { void onLock(); }} disabled={locking}>Lock Studio</Button>
        <Button className={greenButton} onClick={() => { setNotice(""); setEditing("new"); }} disabled={loading || locking}><Plus aria-hidden="true" />New article</Button>
      </div>
    </div>
    {notice && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">{notice}</p>}
    {loading && <p role="status" className="text-sm text-muted-foreground">Loading articles…</p>}
    {error && <div role="alert" className="space-y-2"><p className="text-sm text-red-600 dark:text-red-400">{error}</p><Button variant="outline" onClick={() => { setLoading(true); setRetry(n => n + 1); }}>Retry</Button></div>}
    {!loading && !error && !articles.length && <p className="text-sm text-muted-foreground">Your first article starts here.</p>}
    <ul className="space-y-3">
      {articles.map(article => <li key={article.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-4">
        <div className="min-w-0"><p className="font-medium break-words">{article.title || "Untitled article"}</p><p className="mt-1 text-xs text-muted-foreground">{article.status === "published" ? "Published" : "Draft"}{article.isSample ? " · Sample article" : ""}</p></div>
        <Button variant="outline" className="shrink-0" aria-label={`Edit ${article.title || "Untitled article"}`} onClick={() => { setNotice(""); setEditing(article); }} disabled={locking}>Edit</Button>
      </li>)}
    </ul>
  </div>;
}

function ArticleEditor({ article, onSaved, onBack, onExpired }: {
  article?: StudioArticle; onSaved: (article: StudioArticle) => void; onBack: () => void; onExpired: () => void;
}) {
  const [id] = useState(() => article?.id ?? crypto.randomUUID());
  const [fields, setFields] = useState<ArticleFields>(() => ({ title: article?.title ?? "", category: article?.category ?? "", description: article?.description ?? "", mediumUrl: article?.mediumUrl ?? "", coverKey: article?.coverKey ?? "" }));
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(() => article?.coverKey ? `${STUDIO_ENDPOINT}?resource=cover&key=${encodeURIComponent(article.coverKey)}` : article?.image ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const objectUrl = useRef<string | null>(null);
  const uploaded = useRef<{ file: File; key: string } | null>(null);
  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);

  function chooseFile(next?: File) {
    if (!next) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(next.type) || next.size > MAX_COVER_BYTES) { setError("Choose a PNG, JPEG, or WebP image (up to 3 MB)."); return; }
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(next);
    setFile(next);
    setPreview(objectUrl.current);
    setError("");
  }

  async function save(action: "draft" | "publish" | "unpublish") {
    setBusy(true);
    setError("");
    try {
      let coverKey = fields.coverKey;
      if (file && action !== "unpublish") {
        if (uploaded.current?.file !== file) {
          const result = await studioRequest<{ key: string }>("upload", undefined, file);
          uploaded.current = { file, key: result.key };
        }
        coverKey = uploaded.current.key;
      }
      const result = await studioRequest<{ article: StudioArticle }>("save", { ...fields, coverKey, id, revision: article?.revision ?? null, action });
      onSaved(result.article);
    } catch (err) {
      if (err instanceof StudioApiError && err.status === 401) onExpired();
      else setError(errorText(err));
    } finally { setBusy(false); }
  }

  const field = (name: keyof ArticleFields) => ({ value: fields[name], onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFields(current => ({ ...current, [name]: event.target.value })) });

  return <form className="space-y-5" onSubmit={event => { event.preventDefault(); void save("publish"); }}>
    <Button type="button" variant="ghost" className="px-0" onClick={onBack} disabled={busy}><ArrowLeft aria-hidden="true" />My articles</Button>
    <h3 className="text-lg font-semibold">{article ? "Edit article" : "New article"}</h3>
    <fieldset disabled={busy} className="space-y-4">
      <div className="space-y-2"><Label htmlFor="article-title">Title</Label><Input id="article-title" maxLength={160} {...field("title")} /></div>
      <div className="space-y-2"><Label htmlFor="article-category">Category</Label><Input id="article-category" maxLength={80} placeholder="e.g. Full-Stack Development" {...field("category")} /></div>
      <div className="space-y-2"><Label htmlFor="article-summary">Short summary</Label><Textarea id="article-summary" maxLength={600} rows={3} {...field("description")} /></div>
      <div className="space-y-2">
        <Label htmlFor="article-cover">Cover image</Label>
        <Input id="article-cover" type="file" accept="image/png,image/jpeg,image/webp" className="h-auto py-2" aria-describedby="cover-help" onChange={event => chooseFile(event.target.files?.[0])} />
        <p id="cover-help" className="text-xs text-muted-foreground">PNG, JPEG, or WebP · Up to 3 MB</p>
        {preview && <img src={preview} alt="Cover preview" className="aspect-video w-full max-h-48 rounded-xl border border-border object-cover" />}
      </div>
      <div className="space-y-2"><Label htmlFor="article-url">Medium article URL</Label><Input id="article-url" type="text" inputMode="url" maxLength={2048} placeholder="https://medium.com/@you/your-article" {...field("mediumUrl")} /><p className="text-xs text-muted-foreground">Paste the published HTTPS article link. Medium custom domains are supported.</p></div>
    </fieldset>
    {article?.status === "published" && <p className="text-xs text-muted-foreground">Publish updates the live card. Save draft or Unpublish removes it from Field Notes and keeps it here.</p>}
    {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error} Your form is still here; retry when ready.</p>}
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" disabled={busy} onClick={() => { void save("draft"); }}>Save draft</Button>
      <Button type="submit" className={greenButton} disabled={busy}>Publish</Button>
      {article?.status === "published" && <Button type="button" variant="outline" disabled={busy} onClick={() => { void save("unpublish"); }}>Unpublish</Button>}
      {busy && <span role="status" className="self-center text-sm text-muted-foreground">Saving…</span>}
    </div>
  </form>;
}
