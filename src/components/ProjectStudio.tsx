import { useEffect, useRef, useState } from "react";
import { ArrowLeft, LockKeyhole, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StudioDialog } from "@/components/StudioDialog";
import { StudioApiError, studioRequest } from "@/lib/article-studio-api";
import { PROJECT_CATEGORIES, validProjectUrl } from "@/lib/project-studio-types";
import type { ProjectCatalog, ProjectFields, StudioProject } from "@/lib/project-studio-types";

const greenButton = "bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl min-h-11";
const errorText = (error: unknown) => error instanceof Error ? error.message : "Something went wrong. Please retry.";

export function ProjectStudio({ onChanged }: { onChanged: () => void }) {
  return <StudioDialog title="Project Studio" description="Create, edit, and publish your Featured Projects.">
    {props => <ProjectWorkspace {...props} onChanged={onChanged} />}
  </StudioDialog>;
}

function ProjectWorkspace({ onChanged, onExpired, onLock, locking }: {
  onChanged: () => void; onExpired: () => void; onLock: () => Promise<void>; locking: boolean;
}) {
  const [catalog, setCatalog] = useState<ProjectCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<StudioProject | "new" | null>(null);
  const [retry, setRetry] = useState(0);
  const [saving, setSaving] = useState(false);
  const expireRef = useRef(onExpired);
  useEffect(() => { expireRef.current = onExpired; }, [onExpired]);
  useEffect(() => {
    let active = true;
    studioRequest<ProjectCatalog>("projects")
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
      setCatalog(await studioRequest<ProjectCatalog>("projects-migrate", {}));
      setNotice("Existing projects imported. You can now edit and publish without redeploying.");
      onChanged();
    } catch (err) {
      setError(errorText(err));
      if (err instanceof StudioApiError && err.status === 401) onExpired();
    } finally { setLoading(false); }
  }

  function saved(project: StudioProject) {
    setCatalog(current => current && ({ ...current, projects: current.projects.some(p => p.id === project.id)
      ? current.projects.map(p => p.id === project.id ? project : p) : [project, ...current.projects] }));
    setEditing(null);
    setNotice(project.status === "published" ? "Published. Your project is now in Featured Projects." : "Draft saved. This project is private.");
    onChanged();
  }

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <div className="flex flex-wrap gap-2">
        <Button variant={editing ? "ghost" : "secondary"} disabled={saving || locking} onClick={() => setEditing(null)}>My projects</Button>
        <Button variant={editing === "new" ? "secondary" : "ghost"} className="text-emerald-600 dark:text-emerald-400" disabled={loading || locking || saving || !catalog?.migrated} onClick={() => { setNotice(""); setEditing("new"); }}><Plus aria-hidden="true" />New project</Button>
      </div>
      <Button variant="outline" onClick={() => { void onLock(); }} disabled={locking || saving}><LockKeyhole aria-hidden="true" />Lock Studio</Button>
    </div>
    {notice && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">{notice}</p>}
    {editing ? <ProjectEditor key={editing === "new" ? "new" : editing.id} project={editing === "new" ? undefined : editing} onSaved={saved} onBack={() => setEditing(null)} onExpired={onExpired} onBusy={setSaving} locking={locking} /> : <>
      <h3 className="text-lg font-semibold">My projects</h3>
      {loading && <p role="status" className="text-sm text-muted-foreground">Loading projects...</p>}
      {error && <div role="alert" className="space-y-2"><p className="text-sm text-red-600 dark:text-red-400">{error}</p><Button variant="outline" disabled={loading} onClick={() => { setLoading(true); setRetry(n => n + 1); }}>Retry</Button></div>}
      {catalog && !catalog.migrated && <div className="space-y-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
        <p className="text-sm">Import your existing projects once to start editing. Their content and order will be preserved. Repeating the import keeps later edits.</p>
        <Button className={greenButton} disabled={loading || locking} onClick={() => { void migrate(); }}>Import existing projects</Button>
      </div>}
      {!loading && !error && catalog?.projects.length === 0 && <p className="text-sm text-muted-foreground">Your first project starts here.</p>}
      <ul className="space-y-3">
        {catalog?.projects.map(project => <li key={project.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-4">
          <div className="min-w-0"><p className="font-medium break-words">{project.title || "Untitled project"}</p><p className="mt-1 text-xs text-muted-foreground">{project.category || "No category"} · {project.status === "published" ? "Published" : "Draft"}</p></div>
          <Button variant="outline" className="shrink-0" aria-label={`Edit ${project.title || "Untitled project"}`} disabled={loading || locking || !catalog.migrated} onClick={() => { setNotice(""); setEditing(project); }}>Edit</Button>
        </li>)}
      </ul>
    </>}
  </div>;
}

function ProjectEditor({ project, onSaved, onBack, onExpired, onBusy, locking }: {
  project?: StudioProject; onSaved: (project: StudioProject) => void; onBack: () => void;
  onExpired: () => void; onBusy: (busy: boolean) => void; locking: boolean;
}) {
  const [id] = useState(() => project?.id ?? crypto.randomUUID());
  const [fields, setFields] = useState<ProjectFields>(() => ({ title: project?.title ?? "", description: project?.description ?? "", category: project?.category ?? "", tech: project?.tech ?? [], github: project?.github ?? "", demo: project?.demo ?? "" }));
  const [tag, setTag] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function addTag() {
    const value = tag.trim();
    if (!value) return;
    if (fields.tech.length >= 30) { setError("Use up to 30 technologies."); return; }
    setFields(current => ({ ...current, tech: [...new Set([...current.tech, value])] }));
    setTag("");
  }

  async function save(action: "draft" | "publish" | "unpublish") {
    setError("");
    const tech = [...new Set([...fields.tech, tag.trim()].filter(Boolean))];
    if (action !== "unpublish") {
      if (action === "publish" && (!fields.category || !fields.title.trim() || !fields.description.trim())) { setError("To publish, choose a category and add a project name and description."); return; }
      if ([fields.github, fields.demo].some(url => url.trim() && !validProjectUrl(url.trim()))) { setError("Use valid HTTP or HTTPS URLs, or leave optional links empty."); return; }
    }
    setBusy(true);
    onBusy(true);
    try {
      const result = await studioRequest<{ project: StudioProject }>("projects-save", { ...fields, tech, id, revision: project?.revision ?? null, action });
      onSaved(result.project);
    } catch (err) {
      setError(errorText(err));
      if (err instanceof StudioApiError && err.status === 401) onExpired();
    } finally { setBusy(false); onBusy(false); }
  }

  const field = (name: "title" | "description" | "github" | "demo") => ({ value: fields[name], onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFields(current => ({ ...current, [name]: event.target.value })) });
  return <form className="space-y-5" onSubmit={event => { event.preventDefault(); void save("publish"); }}>
    <h3 className="text-xl font-bold">{project ? "Edit project" : "New project"}</h3>
    <fieldset disabled={busy || locking} className="min-w-0 space-y-5">
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">Category <span className="text-muted-foreground">(required to publish)</span></legend>
        <div className="flex flex-wrap gap-2">
          {PROJECT_CATEGORIES.map(category => <label key={category} className={`relative cursor-pointer rounded-xl border px-4 py-2 text-sm font-medium focus-within:ring-2 focus-within:ring-primary ${fields.category === category ? "border-emerald-600 bg-emerald-600 text-white" : "border-border bg-background text-muted-foreground"}`}>
            <input className="sr-only" type="radio" name="project-category" value={category} checked={fields.category === category} onChange={() => setFields(current => ({ ...current, category }))} />{category}
          </label>)}
        </div>
        <p className="text-xs text-muted-foreground">{fields.category ? `Appears under ${fields.category} and All in your Featured Projects.` : "Choose one category when you are ready to publish."}</p>
      </fieldset>
      <div className="space-y-2"><Label htmlFor="project-title">Project name</Label><Input id="project-title" maxLength={160} {...field("title")} /></div>
      <div className="space-y-2"><Label htmlFor="project-description">Description</Label><Textarea id="project-description" rows={4} maxLength={2000} {...field("description")} /></div>
      <div className="space-y-2">
        <Label htmlFor="project-tech">Technologies</Label>
        <div className="flex flex-wrap gap-2 rounded-xl border border-border p-3">
          {fields.tech.map(technology => <span key={technology} className="inline-flex max-w-full items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-sm"><span className="break-all">{technology}</span><button type="button" className="rounded p-1 hover:bg-background focus-visible:outline-2 focus-visible:outline-primary" aria-label={`Remove ${technology}`} onClick={() => setFields(current => ({ ...current, tech: current.tech.filter(t => t !== technology) }))}><X className="h-3.5 w-3.5" /></button></span>)}
          <div className="flex w-full gap-2"><Input id="project-tech" className="min-w-0" maxLength={50} placeholder="e.g. Java, XML, SQLite" value={tag} onChange={event => setTag(event.target.value)} onKeyDown={event => { if (event.key === "Enter" || event.key === ",") { event.preventDefault(); addTag(); } }} /><Button type="button" variant="outline" onClick={addTag}>Add tag</Button></div>
        </div>
        <p className="text-xs text-muted-foreground">Enter one technology, then press Enter or Add tag. Remove a tag to replace it.</p>
      </div>
      <div className="space-y-2"><Label htmlFor="project-github">GitHub URL (optional)</Label><Input id="project-github" inputMode="url" maxLength={2048} placeholder="https://github.com/username/project" {...field("github")} /></div>
      <div className="space-y-2"><Label htmlFor="project-demo">Live demo URL (optional)</Label><Input id="project-demo" inputMode="url" maxLength={2048} placeholder="https://" {...field("demo")} /></div>
    </fieldset>
    {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error} Your form is still here; retry when ready.</p>}
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <Button type="button" variant="ghost" onClick={onBack} disabled={busy || locking}><ArrowLeft aria-hidden="true" />Back</Button>
      {project?.status !== "published" && <Button type="button" variant="outline" disabled={busy || locking} onClick={() => { void save("draft"); }}>Save draft</Button>}
      <Button type="submit" className={greenButton} disabled={busy || locking}>{project?.status === "published" ? "Save changes" : "Publish project"}</Button>
      {project?.status === "published" && <Button type="button" variant="outline" disabled={busy || locking} onClick={() => { void save("unpublish"); }}>Unpublish</Button>}
      {busy && <span role="status" className="text-sm text-muted-foreground">Saving...</span>}
    </div>
  </form>;
}
