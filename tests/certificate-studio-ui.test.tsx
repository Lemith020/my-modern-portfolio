import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Certifications } from "../src/components/Certifications";
import { Projects } from "../src/components/Projects";
import { BlogArticles } from "../src/components/BlogArticles";
import { createStudioService } from "../netlify/lib/studio-service";
import { CERTIFICATE_CATALOG_KEY } from "../netlify/lib/certificate-service";
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
  render(<QueryClientProvider client={client}><Certifications /><Projects /><BlogArticles /></QueryClientProvider>);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
type User = ReturnType<typeof userEvent.setup>;
async function open(user: User, section = "certifications") {
  await user.click(within(document.getElementById(section)!).getByRole("button", { name: "Open Studio" }));
}
async function pin(user: User) {
  await waitFor(() => expect((screen.getByRole("button", { name: "Unlock" }) as HTMLButtonElement).disabled).toBe(false));
  await user.type(screen.getByLabelText("Enter PIN"), TEST_PIN);
  await user.click(screen.getByRole("button", { name: "Unlock" }));
}
async function prepare(user: User) {
  await open(user); await pin(user);
  await user.click(await screen.findByRole("button", { name: "Import existing certificates" }));
  await screen.findByText(/Existing certificates imported/);
}

test("certificate draft, image upload, publish, larger accessible preview, edit/replacement and unpublish", async () => {
  const user = userEvent.setup(); await prepare(user);
  await user.click(screen.getByRole("button", { name: "New certificate", exact: true }));
  await user.click(screen.getByRole("button", { name: "Publish certificate" }));
  await screen.findByText(/To publish, add a certificate name/);
  await user.type(screen.getByLabelText("Certificate name"), "Cloud Engineering");
  await user.click(screen.getByRole("button", { name: "Save draft" }));
  await screen.findByText("Draft saved. This certificate is private.");
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("heading", { name: "Cloud Engineering" })).toBeNull();
  await open(user);
  await user.click(await screen.findByRole("button", { name: "Edit Cloud Engineering" }));
  await user.type(screen.getByLabelText("Issuing organisation"), "Test Academy");
  await user.type(screen.getByLabelText("Short description"), "Practical cloud training.");
  const file = new File([new Uint8Array(png)], "certificate.png", { type: "image/png" });
  await user.upload(screen.getByLabelText("Certificate image"), file);
  expect(screen.getByAltText("Certificate image preview").getAttribute("src")).toBe("blob:project-preview");
  await user.type(screen.getByLabelText("Credential URL (optional)"), "https://example.com/credential");
  await user.click(screen.getByRole("button", { name: "Publish certificate" }));
  await screen.findByText("Published. Your certificate is now in Certifications.");
  await user.keyboard("{Escape}");
  const trigger = await screen.findByRole("button", { name: "View Cloud Engineering certificate" });
  expect(screen.getByRole("link", { name: "Verify Credential" }).getAttribute("href")).toBe("https://example.com/credential");
  await user.click(trigger);
  expect(screen.getByRole("dialog", { name: "Cloud Engineering" })).toBeTruthy();
  expect(screen.getByAltText("Cloud Engineering full certificate").className).toContain("object-contain");
  await user.keyboard("{Escape}");
  await waitFor(() => expect(document.activeElement).toBe(trigger));
  await open(user);
  await user.click(await screen.findByRole("button", { name: "Edit Cloud Engineering" }));
  const oldUrl = screen.getByAltText("Certificate image preview").getAttribute("src");
  await user.upload(screen.getByLabelText("Certificate image"), new File([new Uint8Array(png)], "replacement.png", { type: "image/png" }));
  await user.clear(screen.getByLabelText("Certificate name"));
  await user.type(screen.getByLabelText("Certificate name"), "Updated Cloud Training");
  store.fail = `write:${CERTIFICATE_CATALOG_KEY}`;
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  await screen.findByText(/Your form is still here/);
  expect((screen.getByLabelText("Certificate name") as HTMLInputElement).value).toBe("Updated Cloud Training");
  expect(screen.getByAltText("Certificate image preview").getAttribute("src")).not.toBe(oldUrl);
  store.fail = null;
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  await screen.findByText("Published. Your certificate is now in Certifications.");
  await user.click(screen.getByRole("button", { name: "Edit Updated Cloud Training" }));
  await user.click(screen.getByRole("button", { name: "Unpublish" }));
  await screen.findByText("Draft saved. This certificate is private.");
  await user.click(screen.getByRole("button", { name: "Lock Studio" }));
  await screen.findByLabelText("Enter PIN"); await user.keyboard("{Escape}");
  expect(screen.queryByRole("button", { name: "View Updated Cloud Training certificate" })).toBeNull();
});

test("incorrect PIN, existing article/project session access, shared locking, and expiry preserve certificate edits", async () => {
  const user = userEvent.setup(); await open(user);
  await waitFor(() => expect((screen.getByRole("button", { name: "Unlock" }) as HTMLButtonElement).disabled).toBe(false));
  await user.type(screen.getByLabelText("Enter PIN"), "wrong"); await user.keyboard("{Enter}");
  await screen.findByText("Incorrect PIN");
  await user.keyboard("{Escape}");
  await open(user, "blog"); await pin(user); await screen.findByRole("heading", { name: "My articles" });
  await user.keyboard("{Escape}"); await open(user);
  await screen.findByRole("heading", { name: "My certificates" });
  expect(screen.queryByLabelText("Enter PIN")).toBeNull();
  await user.click(await screen.findByRole("button", { name: "Import existing certificates" }));
  await screen.findByText(/Existing certificates imported/);
  await user.click(screen.getByRole("button", { name: "New certificate", exact: true }));
  await user.type(screen.getByLabelText("Certificate name"), "Keep my edits");
  time += SESSION_MS + 1;
  await user.click(screen.getByRole("button", { name: "Save draft" }));
  await screen.findByLabelText("Enter PIN"); await pin(user);
  await screen.findByRole("heading", { name: "New certificate" });
  expect((await screen.findByLabelText("Certificate name") as HTMLInputElement).value).toBe("Keep my edits");
  await user.click(screen.getByRole("button", { name: "Save draft" }));
  await screen.findByRole("button", { name: "Edit Keep my edits" });
  await user.keyboard("{Escape}"); await open(user, "projects");
  await screen.findByRole("heading", { name: "My projects" });
  await user.keyboard("{Escape}"); await open(user);
  await screen.findByRole("heading", { name: "My certificates" });
  await user.click(screen.getByRole("button", { name: "Lock Studio" }));
  await screen.findByLabelText("Enter PIN"); await user.keyboard("{Escape}");
  for (const section of ["blog", "projects"]) {
    await open(user, section); await screen.findByLabelText("Enter PIN"); await user.keyboard("{Escape}");
  }
});

test("original cards omit empty credentials, display full images, and failed uploads are retryable", async () => {
  const user = userEvent.setup();
  const section = within(document.getElementById("certifications")!);
  await section.findByRole("heading", { name: "Computer Literacy" });
  expect(section.queryByRole("link", { name: "Verify Credential" })).toBeNull();
  expect(section.getByAltText("Computer Literacy").className).toContain("object-contain");
  await prepare(user);
  await user.click(screen.getByRole("button", { name: "Edit Computer Literacy" }));
  expect((screen.getByLabelText("Issue date (optional)") as HTMLInputElement).value).toBe("2024-12-04");
  await user.upload(screen.getByLabelText("Certificate image"), new File([new Uint8Array(png)], "new.png", { type: "image/png" }));
  store.fail = "upload";
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  await screen.findByText(/Your form is still here/);
  expect(screen.getByAltText("Certificate image preview")).toBeTruthy();
  store.fail = null;
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  await screen.findByText("Published. Your certificate is now in Certifications.");
});

