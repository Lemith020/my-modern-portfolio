import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StudioApiError, studioRequest } from "@/lib/article-studio-api";
const greenButton = "bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl min-h-11";
const errorText = (error: unknown) => error instanceof Error ? error.message : "Something went wrong. Please retry.";

export function StudioDialog({ title, description, ownerLabel, children }: {
  title: string; description: string; ownerLabel?: string;
  children: (props: { onExpired: () => void; onLock: () => Promise<void>; locking: boolean }) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [hasWorkspace, setHasWorkspace] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const generation = useRef(0);
  const pinInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!expiresAt) return;
    const timer = window.setTimeout(() => {
      setExpiresAt(null);
      setError("Your session has expired. Unlock Studio again.");
    }, Math.max(0, expiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [expiresAt]);

  useEffect(() => {
    const locked = () => { setExpiresAt(null); setHasWorkspace(false); };
    window.addEventListener("studio-locked", locked);
    return () => window.removeEventListener("studio-locked", locked);
  }, []);

  function expired() {
    setExpiresAt(null);
    setError("Your session has expired. Unlock Studio again.");
  }

  async function changeOpen(next: boolean) {
    generation.current += 1;
    const attempt = generation.current;
    setOpen(next);
    setError("");
    if (pinInput.current) pinInput.current.value = "";
    if (!next) { setBusy(false); return; }
    setBusy(true);
    try {
      const session = await studioRequest<{ expiresAt: number }>("session");
      if (attempt === generation.current) { setExpiresAt(session.expiresAt); setHasWorkspace(true); }
    } catch (err) {
      if (attempt === generation.current) {
        setExpiresAt(null);
        if (!(err instanceof StudioApiError && err.status === 401)) setError(errorText(err));
      }
    } finally { if (attempt === generation.current) setBusy(false); }
  }

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const attempt = generation.current;
    const pin = pinInput.current?.value ?? "";
    if (pinInput.current) pinInput.current.value = "";
    setBusy(true);
    setError("");
    try {
      const session = await studioRequest<{ expiresAt: number }>("login", { pin });
      if (attempt === generation.current) { setExpiresAt(session.expiresAt); setHasWorkspace(true); }
    } catch (err) {
      if (attempt === generation.current) { setError(errorText(err)); pinInput.current?.focus(); }
    } finally { if (attempt === generation.current) setBusy(false); }
  }

  async function lock() {
    setBusy(true);
    setError("");
    try {
      await studioRequest("logout", {});
      setExpiresAt(null);
      setHasWorkspace(false);
      window.dispatchEvent(new Event("studio-locked"));
    } catch (err) {
      if (err instanceof StudioApiError && err.status === 401) {
        setExpiresAt(null);
        setHasWorkspace(false);
        window.dispatchEvent(new Event("studio-locked"));
      }
      else setError(`Could not lock Studio. ${errorText(err)}`);
    } finally { setBusy(false); }
  }

  return (
    <Dialog open={open} onOpenChange={next => { void changeOpen(next); }}>
      <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-500/25 dark:bg-emerald-950/35">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"><LockKeyhole className="h-5 w-5" aria-hidden="true" /></span>
          <div><h3 className="font-bold text-base">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{ownerLabel ?? (title === "Project Studio" ? "Owner access to create, edit, and manage your portfolio projects." : "Owner access")}</p></div>
        </div>
        <DialogTrigger asChild><Button className={greenButton}>Open Studio</Button></DialogTrigger>
      </div>
      <DialogContent className={expiresAt ? "w-[calc(100%_-_2rem)] max-w-3xl max-h-[90dvh] overflow-y-auto rounded-2xl sm:rounded-2xl" : "w-[calc(100%_-_2rem)] max-w-sm rounded-2xl sm:rounded-2xl"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-emerald-600" aria-hidden="true" />{title}</DialogTitle>
          <DialogDescription>{expiresAt ? description : "Owner access"}</DialogDescription>
        </DialogHeader>
        {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {!expiresAt ? (
          <form onSubmit={unlock} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studio-pin">Enter PIN</Label>
              <Input ref={pinInput} id="studio-pin" name="pin" type="password" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} required maxLength={1024} aria-invalid={error === "Incorrect PIN"} className="h-11" />
            </div>
            <Button type="submit" className={`${greenButton} w-full`} disabled={busy}>{busy ? "Please wait…" : "Unlock"}</Button>
          </form>
        ) : null}
        {hasWorkspace && <div hidden={!expiresAt}>{children({ onExpired: expired, onLock: lock, locking: busy })}</div>}
      </DialogContent>
    </Dialog>
  );
}

