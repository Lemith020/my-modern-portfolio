import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import emailjs from "@emailjs/browser";
import { Contact } from "../src/components/Contact";
import type { ReactNode } from "react";

vi.mock("@emailjs/browser", () => ({ default: { send: vi.fn() } }));
vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: { div: ({ children, className }: { children: ReactNode; className: string }) => <div className={className}>{children}</div> },
}));
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.clearAllMocks(); });

test("existing contact validation and EmailJS payload still work without sending real mail", async () => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.mocked(emailjs.send).mockResolvedValue({ status: 200, text: "Test only" });
  const user = userEvent.setup(); render(<Contact />);
  await user.click(screen.getByRole("button", { name: /Send Message/i }));
  await screen.findByText("Name must be at least 2 characters.");
  expect(emailjs.send).not.toHaveBeenCalled();
  await user.type(screen.getByLabelText("Name"), "Test Visitor");
  await user.type(screen.getByLabelText("Email"), "visitor@example.com");
  await user.type(screen.getByLabelText("Message"), "A local test message only.");
  await user.click(screen.getByRole("button", { name: /Send Message/i }));
  await waitFor(() => expect(emailjs.send).toHaveBeenCalledTimes(1));
  expect(vi.mocked(emailjs.send).mock.calls[0][2]).toEqual({ from_name: "Test Visitor", reply_to: "visitor@example.com", message: "A local test message only." });
  await screen.findByText(/Message Sent/i);
});
