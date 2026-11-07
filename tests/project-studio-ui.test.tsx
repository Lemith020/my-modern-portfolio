import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Projects } from "../src/components/Projects";
import { BlogArticles } from "../src/components/BlogArticles";
import { createStudioService } from "../netlify/lib/studio-service";
import { PROJECT_CATALOG_KEY } from "../netlify/lib/project-service";
import { SESSION_MS } from "../netlify/lib/studio-auth";
import { MemoryStore, TEST_PIN, testVerifier, png } from "./helpers/studio-fixture.mjs";
import type { ReactNode } from "react";

vi.mock("framer-motion", () => ({
  useReducedMotion: () => true,
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, className }: { children: ReactNode; className: string }) => <div className={className}>{children}</div>,
    span: ({ className }: { className: string }) => <span className={className} />,
    article: ({ children, className }: { children: ReactNode; className: string }) => <article className={className}>{children}</article>,
  },
}));
let store: MemoryStore;
let time: number;
let unavailable = false;
beforeEach(() => {
  store = new MemoryStore(); time = Date.now(); unavailable = false;
  const service = createStudioService(store, { verifier: testVerifier, secureCookies: false, now: () => time });
  let cookie = "";
  vi.stubGlobal("fetch", async (input: string, init: RequestInit = {}) => {
    if (unavailable) throw new TypeError("Offline");
    let body = init.body;
    if (body instanceof File) {
      body = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(body as File);
      });
    }
    const response = await service(new Request(`https://portfolio.test${input}`, { method: init.method, body, headers: { ...init.headers, Origin: "https://portfolio.test", Cookie: cookie } }), "project-ui-test");
    if (response.headers.has("set-cookie")) cookie = response.headers.get("set-cookie")!.split(";")[0];
    return response;
  });
  vi.stubGlobal("URL", class extends URL {
    static createObjectURL() { return "blob:project-preview"; }
    static revokeObjectURL() {}
  });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(<QueryClientProvider client={client}><Projects /><BlogArticles /></QueryClientProvider>);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
type User = ReturnType<typeof userEvent.setup>;
async function open(user: User, section = "projects") {
  await user.click(within(document.getElementById(section)!).getByRole("button", { name: "Open Studio" }));
}
async function pin(user: User) {
  await waitFor(() => expect((screen.getByRole("button", { name: "Unlock" }) as HTMLButtonElement).disabled).toBe(false));
  await user.type(screen.getByLabelText("Enter PIN"), TEST_PIN);
  await user.click(screen.getByRole("button", { name: "Unlock" }));
}
async function prepare(user: User) {
  await open(user); await pin(user);
  await user.click(await screen.findByRole("button", { name: "Import existing projects" }));
  await screen.findByText(/Existing projects imported/);
}

test("project image preview, failed upload/save retries, public card and image removal", async () => {
  const user = userEvent.setup(); await prepare(user);
  await user.click(screen.getByRole("button", { name: "Edit Task Management System" }));
  const image = new File([new Uint8Array(png)], "project.png", { type: "image/png" });
  await user.upload(screen.getByLabelText("Project image (optional)"), image);
  expect(screen.getByAltText("Project image preview").getAttribute("src")).toBe("blob:project-preview");
  store.fail = "upload";
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  await screen.findByText(/Your form is still here/);
  expect(screen.getByAltText("Project image preview")).toBeTruthy();
  store.fail = `write:${PROJECT_CATALOG_KEY}`;
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  await screen.findByText(/Your form is still here/);
  await waitFor(() => expect((screen.getByRole("button", { name: "Save changes" }) as HTMLButtonElement).disabled).toBe(false));
  expect([...store.entries.keys()].filter(key => key.startsWith("projects/images/"))).toHaveLength(1);
  store.fail = null;
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  await screen.findByText("Published. Your project is now in Featured Projects.");
  expect([...store.entries.keys()].filter(key => key.startsWith("projects/images/"))).toHaveLength(1);
  await user.keyboard("{Escape}");
  const cardImage = await screen.findByAltText("Task Management System preview");
  expect(cardImage.getAttribute("src")).toContain("resource=projects-public-cover");
  await open(user);
  await user.click(await screen.findByRole("button", { name: "Edit Task Management System" }));
  expect(screen.getByAltText("Project image preview").getAttribute("src")).toContain("resource=projects-cover");
  await user.click(screen.getByRole("button", { name: "Remove image" }));
  expect(screen.queryByAltText("Project image preview")).toBeNull();
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  await screen.findByText("Published. Your project is now in Featured Projects.");
  await user.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByAltText("Task Management System preview")).toBeNull());
});

test("Mobile Apps acceptance flow: draft, tags, publish, public filters, category edit and unpublish", async () => {
  const user = userEvent.setup(); await prepare(user);
  await user.click(screen.getByRole("button", { name: "New project", exact: true }));
  expect(screen.queryByRole("radio", { name: "All", exact: true })).toBeNull();
  await user.click(screen.getByRole("radio", { name: "Mobile Apps", exact: true }));
  await user.type(screen.getByLabelText("Project name"), "My Money");
  await user.type(screen.getByLabelText("Description"), "Track spending and budgets.");
  for (const tag of ["Java", "XML", "SQLite"]) {
    await user.type(screen.getByLabelText("Technologies"), tag);
    await user.click(screen.getByRole("button", { name: "Add tag" }));
  }
  await user.click(screen.getByRole("button", { name: "Save draft" }));
  await screen.findByText("Draft saved. This project is private.");
  await user.click(screen.getByRole("button", { name: "Edit My Money" }));
  await user.click(screen.getByRole("button", { name: "Publish project" }));
  await screen.findByText("Published. Your project is now in Featured Projects.");
  await user.keyboard("{Escape}");
  await screen.findByRole("heading", { name: "My Money" });
  const publicSection = within(document.getElementById("projects")!);
  for (const category of ["All", "Frontend", "Full Stack", "AI/ML", "Mobile Apps"]) {
    await user.click(publicSection.getByRole("button", { name: category, exact: true }));
    expect(!!publicSection.queryByRole("heading", { name: "My Money" })).toBe(["All", "Mobile Apps"].includes(category));
  }
  expect(publicSection.queryByRole("link")).toBeNull();
  expect(publicSection.getByText("SQLite")).toBeTruthy();
  await open(user);
  await user.click(await screen.findByRole("button", { name: "Edit My Money" }));
  await user.click(screen.getByRole("radio", { name: "Frontend", exact: true }));
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  await screen.findByText("Published. Your project is now in Featured Projects.");
  await user.keyboard("{Escape}");
  expect(publicSection.queryByRole("heading", { name: "My Money" })).toBeNull();
  await user.click(publicSection.getByRole("button", { name: "Frontend", exact: true }));
  expect(publicSection.getAllByRole("heading", { name: "My Money" })).toHaveLength(1);
  await open(user);
  await user.click(await screen.findByRole("button", { name: "Edit My Money" }));
  await user.click(screen.getByRole("button", { name: "Unpublish" }));
  await screen.findByText("Draft saved. This project is private.");
  await user.click(screen.getByRole("button", { name: "Lock Studio" }));
  await screen.findByLabelText("Enter PIN");
  await user.keyboard("{Escape}");
  expect(publicSection.queryByRole("heading", { name: "My Money" })).toBeNull();
});

test("wrong PIN and shared Article/Project access; locking either studio revokes access to both", async () => {
  const user = userEvent.setup(); await open(user);
  await waitFor(() => expect((screen.getByRole("button", { name: "Unlock" }) as HTMLButtonElement).disabled).toBe(false));
  await user.type(screen.getByLabelText("Enter PIN"), "wrong"); await user.keyboard("{Enter}");
  await screen.findByText("Incorrect PIN");
  await pin(user); await screen.findByRole("heading", { name: "My projects" });
  await user.keyboard("{Escape}"); await open(user, "blog");
  await screen.findByRole("heading", { name: "My articles" });
  expect(screen.queryByLabelText("Enter PIN")).toBeNull();
  await user.click(screen.getByRole("button", { name: "Lock Studio" }));
  await screen.findByLabelText("Enter PIN");
  await user.keyboard("{Escape}"); await open(user);
  await screen.findByLabelText("Enter PIN");
  await user.keyboard("{Escape}"); await open(user, "blog"); await pin(user);
  await screen.findByRole("heading", { name: "My articles" });
  await user.keyboard("{Escape}"); await open(user);
  await screen.findByRole("heading", { name: "My projects" });
  expect(screen.queryByLabelText("Enter PIN")).toBeNull();
  await user.click(screen.getByRole("button", { name: "Lock Studio" }));
  await screen.findByLabelText("Enter PIN");
  await user.keyboard("{Escape}"); await open(user, "blog");
  await screen.findByLabelText("Enter PIN");
});

test("validation, failed saves and expired sessions retain unsaved form data for retry", async () => {
  const user = userEvent.setup(); await prepare(user);
  await user.click(screen.getByRole("button", { name: "New project", exact: true }));
  await user.click(screen.getByRole("button", { name: "Publish project" }));
  await screen.findByText(/To publish, choose a category/);
  await user.type(screen.getByLabelText("Project name"), "Keep my input");
  await user.type(screen.getByLabelText("GitHub URL (optional)"), "javascript:alert(1)");
  await user.click(screen.getByRole("button", { name: "Save draft" }));
  await screen.findByText(/Use valid HTTP or HTTPS URLs/);
  await user.clear(screen.getByLabelText("GitHub URL (optional)"));
  store.fail = `write:${PROJECT_CATALOG_KEY}`;
  await user.click(screen.getByRole("button", { name: "Save draft" }));
  await screen.findByText(/Studio is temporarily unavailable/);
  expect((screen.getByLabelText("Project name") as HTMLInputElement).value).toBe("Keep my input");
  store.fail = null;
  time += SESSION_MS + 1;
  await user.click(screen.getByRole("button", { name: "Save draft" }));
  await screen.findByLabelText("Enter PIN");
  await pin(user);
  await screen.findByRole("heading", { name: "New project" });
  expect((screen.getByLabelText("Project name") as HTMLInputElement).value).toBe("Keep my input");
  await user.click(screen.getByRole("button", { name: "Save draft" }));
  await screen.findByRole("button", { name: "Edit Keep my input" });
});

test("public filters preserve seed categories and failures offer retry without a hardcoded fallback", async () => {
  const user = userEvent.setup();
  await screen.findByRole("heading", { name: "Task Management System" });
  const section = within(document.getElementById("projects")!);
  for (const [category, count] of [["All", 7], ["Frontend", 4], ["Full Stack", 2], ["AI/ML", 1], ["Mobile Apps", 0]] as const) {
    await user.click(section.getByRole("button", { name: category, exact: true }));
    expect(section.getAllByRole("heading", { level: 3 })).toHaveLength(count + 1);
  }
  await open(user); unavailable = true;
  await pin(user); await screen.findByText(/Could not reach Studio/);
  expect(screen.queryByText("Incorrect PIN")).toBeNull();
  unavailable = false;
  await pin(user); await screen.findByRole("heading", { name: "My projects" });
});
