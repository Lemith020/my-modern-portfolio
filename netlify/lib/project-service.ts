import { randomUUID } from "node:crypto";
import { initialProjects } from "../../src/data/projects.ts";
import { PROJECT_CATEGORIES, validProjectUrl } from "../../src/lib/project-studio-types.ts";
import type { ProjectCategory, ProjectCatalog, StudioProject } from "../../src/lib/project-studio-types.ts";
import type { StudioStore } from "./studio-store.ts";
import { HttpError } from "./studio-http.ts";
import { STUDIO_ENDPOINT } from "../../src/lib/article-studio-types.ts";

export const PROJECT_CATALOG_KEY = "projects/catalog-v1";
export function initialProjectCatalog(): ProjectCatalog {
  return { migrated: false, projects: initialProjects.map(project => ({ ...project, status: "published", revision: "import-v1", updatedAt: "" })) };
}

export function createProjectService(store: StudioStore, now: () => number) {
  async function catalog() {
    const saved = await store.read<ProjectCatalog>(PROJECT_CATALOG_KEY);
    return { data: saved?.data ?? initialProjectCatalog(), etag: saved?.etag };
  }
  return {
    catalog: async () => (await catalog()).data,
    async publicProjects() {
      return { projects: (await catalog()).data.projects.filter(p => p.status === "published").map(p => ({
        id: p.id, title: p.title, category: p.category, description: p.description,
        tech: p.tech, github: p.github, demo: p.demo, ...(p.isPending ? { isPending: true } : {}),
        ...(p.coverKey ? { image: `${STUDIO_ENDPOINT}?resource=projects-public-cover&id=${encodeURIComponent(p.id)}&key=${encodeURIComponent(p.coverKey)}` } : {}),
      })) };
    },
    async migrate() {
      // Atomic creation imports all seeds in their original order, exactly once.
      // Repeating this operation never replaces owner edits or unpublished records.
      await store.write(PROJECT_CATALOG_KEY, { ...initialProjectCatalog(), migrated: true }, { onlyIfNew: true });
      return (await catalog()).data;
    },
    async save(data: Record<string, unknown>) {
      const saved = await catalog();
      if (!saved.etag || !saved.data.migrated) throw new HttpError(409, "Import existing projects before saving.");
      if (typeof data.id !== "string" || !/^[a-zA-Z0-9-]{1,80}$/.test(data.id)) throw new HttpError(400, "Invalid project ID.");
      const previous = saved.data.projects.find(p => p.id === data.id);
      if ((previous?.revision ?? null) !== (data.revision ?? null)) throw new HttpError(409, "This project changed in another session. Copy your edits, then reopen it from My projects before saving.");
      if (!["draft", "publish", "unpublish"].includes(String(data.action))) throw new HttpError(400, "Invalid project action.");
      let project: StudioProject;
      if (data.action === "unpublish") {
        if (!previous) throw new HttpError(404, "Project not found.");
        project = { ...previous, status: "draft" };
      } else {
        // Older clients and records can omit the optional cover without removing it.
        const coverKey = data.coverKey === undefined ? previous?.coverKey ?? "" : data.coverKey;
        if (typeof coverKey !== "string" || (coverKey && (!/^[a-f0-9-]{36}\.(png|jpg|webp)$/.test(coverKey) || !await store.read(`projects/covers/${coverKey}`)))) throw new HttpError(400, "Upload the project image again before saving.");
        const fields: Record<string, string> = {};
        for (const [field, max] of Object.entries({ title: 160, description: 2000, category: 40, github: 2048, demo: 2048 })) {
          if (typeof data[field] !== "string" || data[field].length > max) throw new HttpError(400, `Check the ${field} field (maximum ${max} characters).`);
          fields[field] = data[field].trim();
        }
        if (fields.category && !PROJECT_CATEGORIES.includes(fields.category as ProjectCategory)) throw new HttpError(400, "Choose Frontend, Full Stack, AI/ML, or Mobile Apps.");
        if (!Array.isArray(data.tech) || data.tech.length > 30 || data.tech.some(t => typeof t !== "string" || t.length > 50)) throw new HttpError(400, "Use up to 30 technologies, each up to 50 characters.");
        for (const field of ["github", "demo"]) {
          if (fields[field] && !validProjectUrl(fields[field])) throw new HttpError(400, `${field === "github" ? "GitHub" : "Live demo"} URL must be a valid HTTP or HTTPS URL.`);
        }
        if (data.action === "publish" && (!fields.category || !fields.title || !fields.description)) throw new HttpError(400, "To publish, choose a category and add a project name and description.");
        project = {
          id: data.id, title: fields.title, description: fields.description, category: fields.category as ProjectCategory | "",
          tech: [...new Set((data.tech as string[]).map(t => t.trim()).filter(Boolean))], github: fields.github, demo: fields.demo,
          status: data.action === "publish" ? "published" : "draft", revision: "", updatedAt: "",
          coverKey,
          ...(previous?.isPending ? { isPending: true } : {}),
        };
      }
      project.revision = randomUUID();
      project.updatedAt = new Date(now()).toISOString();
      const projects = previous ? saved.data.projects.map(p => p.id === project.id ? project : p) : [project, ...saved.data.projects];
      // Compare-and-swap prevents stale catalog writes from dropping unrelated edits.
      if (!await store.write(PROJECT_CATALOG_KEY, { projects, migrated: true }, { onlyIfMatch: saved.etag })) throw new HttpError(409, "Another save happened at the same time. Your edits are still here; retry saving.");
      return { project };
    },
  };
}
