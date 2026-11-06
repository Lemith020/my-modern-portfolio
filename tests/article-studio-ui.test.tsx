import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BlogArticles } from "../src/components/BlogArticles";
import { createStudioService } from "../netlify/lib/studio-service";
import { MemoryStore, TEST_PIN, testVerifier, png } from "./helpers/studio-fixture.mjs";
import type { ReactNode } from "react";

vi.mock("framer-motion", () => ({
  useReducedMotion: () => true,
  motion: { article: ({ children, className }: { children: ReactNode; className: string }) => <article className={className}>{children}</article> },
}));

let store: MemoryStore;
let unavailable = false;

beforeEach(() => {
  store = new MemoryStore();
  unavailable = false;
  const service = createStudioService(store, { verifier: testVerifier, secureCookies: false });
  let cookie = "";
  vi.stubGlobal("fetch", async (input: string, init: RequestInit = {}) => {
    if (unavailable) throw new TypeError("Simulated network failure");
    let body = init.body;
    if (body instanceof File) {
      body = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(body as File);
      });
    }
    const response = await service(new Request(`https://portfolio.test${input}`, {
      method: init.method, body,
      headers: { ...init.headers, Origin: "https://portfolio.test", Cookie: cookie },
    }), "ui-test-ip");
    if (response.headers.has("set-cookie")) cookie = response.headers.get("set-cookie")!.split(";")[0];
    return response;
  });
  vi.stubGlobal("URL", class extends URL {
    static createObjectURL() { return "blob:test-preview"; }
    static revokeObjectURL() {}
  });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(<QueryClientProvider client={client}><BlogArticles /></QueryClientProvider>);
});

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

async function openStudio(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Open Studio" }));
  await waitFor(() => expect((screen.getByRole("button", { name: "Unlock" }) as HTMLButtonElement).disabled).toBe(false));
}

async function unlock(user: ReturnType<typeof userEvent.setup>) {
  await openStudio(user);
  await user.type(screen.getByLabelText("Enter PIN"), TEST_PIN);
  await user.keyboard("{Enter}");
  await screen.findByRole("heading", { name: "My articles" });
  await screen.findByRole("button", { name: "Edit From an Idea to a Working App" });
}

test("masked PIN, inline wrong-PIN feedback, Enter submission, Escape close, and logout", async () => {
  const user = userEvent.setup();
  await screen.findAllByText("Article coming soon");
  await openStudio(user);
  expect(screen.getByLabelText("Enter PIN").getAttribute("type")).toBe("password");
  await user.type(screen.getByLabelText("Enter PIN"), "wrong-test-pin");
  await user.keyboard("{Enter}");
  await screen.findByText("Incorrect PIN");
  expect((screen.getByLabelText("Enter PIN") as HTMLInputElement).value).toBe("");
  await user.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open Studio" }));
  await unlock(user);
  await user.click(screen.getByRole("button", { name: "Lock Studio" }));
  await screen.findByLabelText("Enter PIN");
  expect(screen.queryByRole("heading", { name: "My articles" })).toBeNull();
});

test("upload, save draft, publish, edit, and unpublish flow updates Field Notes", async () => {
  const user = userEvent.setup();
  await unlock(user);
  await user.click(screen.getByRole("button", { name: "New article" }));
  await user.type(screen.getByLabelText("Title"), "My integration article");
  await user.type(screen.getByLabelText("Category"), "Development");
  await user.type(screen.getByLabelText("Short summary"), "A summary from the editor.");
  await user.upload(screen.getByLabelText("Cover image"), new File([new Uint8Array(png)], "cover.png", { type: "image/png" }));
  expect(screen.getByAltText("Cover preview").getAttribute("src")).toBe("blob:test-preview");
  await user.type(screen.getByLabelText("Medium article URL"), "https://medium.com/@test/integration-article");
  await user.click(screen.getByRole("button", { name: "Save draft" }));
  await screen.findByText("Draft saved. This article is private.");
  await user.click(screen.getByRole("button", { name: "Edit My integration article" }));
  await user.click(screen.getByRole("button", { name: "Publish", exact: true }));
  await screen.findByText("Published. Your card is now in Field Notes.");
  await user.keyboard("{Escape}");
  const link = await screen.findByRole("link", { name: "Read on Medium", exact: true });
  expect(link.getAttribute("href")).toBe("https://medium.com/@test/integration-article");
  expect(link.getAttribute("target")).toBe("_blank");
  await user.click(screen.getByRole("button", { name: "Open Studio" }));
  await user.click(await screen.findByRole("button", { name: "Edit My integration article" }));
  await user.clear(screen.getByLabelText("Title"));
  await user.type(screen.getByLabelText("Title"), "Updated integration article");
  await user.click(screen.getByRole("button", { name: "Publish", exact: true }));
  await user.click(await screen.findByRole("button", { name: "Edit Updated integration article" }));
  await user.click(screen.getByRole("button", { name: "Unpublish" }));
  await screen.findByText("Draft saved. This article is private.");
  await user.click(screen.getByRole("button", { name: "Lock Studio" }));
  await screen.findByLabelText("Enter PIN");
  await user.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("link", { name: "Read on Medium", exact: true })).toBeNull());
  expect(screen.getAllByText("Article coming soon")).toHaveLength(3);
});

test("network errors are distinct from an incorrect PIN and allow retry", async () => {
  const user = userEvent.setup();
  await openStudio(user);
  unavailable = true;
  await user.type(screen.getByLabelText("Enter PIN"), TEST_PIN);
  await user.keyboard("{Enter}");
  await screen.findByText(/Could not reach Studio/);
  expect(screen.queryByText("Incorrect PIN")).toBeNull();
  unavailable = false;
  await user.type(screen.getByLabelText("Enter PIN"), TEST_PIN);
  await user.click(screen.getByRole("button", { name: "Unlock" }));
  await screen.findByRole("heading", { name: "My articles" });
});

test("failed save retains editor fields and selected cover for retry", async () => {
  const user = userEvent.setup();
  await unlock(user);
  await user.click(screen.getByRole("button", { name: "New article" }));
  await user.type(screen.getByLabelText("Title"), "Keep these edits");
  await user.upload(screen.getByLabelText("Cover image"), new File([new Uint8Array(png)], "cover.png", { type: "image/png" }));
  store.fail = "write:catalog";
  await user.click(screen.getByRole("button", { name: "Save draft" }));
  await screen.findByText(/Your form is still here/);
  expect((screen.getByLabelText("Title") as HTMLInputElement).value).toBe("Keep these edits");
  expect(screen.getByAltText("Cover preview")).toBeTruthy();
  store.fail = null;
  await user.click(screen.getByRole("button", { name: "Save draft" }));
  await screen.findByRole("button", { name: "Edit Keep these edits" });
});
