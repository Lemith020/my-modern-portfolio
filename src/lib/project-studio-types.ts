export const PROJECT_CATEGORIES = ["Frontend", "Full Stack", "AI/ML", "Mobile Apps"] as const;
export type ProjectCategory = typeof PROJECT_CATEGORIES[number];
export type ProjectFields = {
  title: string;
  category: ProjectCategory | "";
  description: string;
  tech: string[];
  github: string;
  demo: string;
};
export type PublicProject = ProjectFields & { id: string; isPending?: boolean; image?: string };
export type StudioProject = PublicProject & {
  coverKey?: string;
  status: "draft" | "published";
  revision: string;
  updatedAt: string;
};
export type ProjectCatalog = { projects: StudioProject[]; migrated: boolean };

export function validProjectUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !!url.hostname && !url.username && !url.password;
  } catch { return false; }
}
