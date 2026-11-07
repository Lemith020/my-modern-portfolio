import { STUDIO_ENDPOINT } from "./article-studio-types";

export class StudioApiError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}

export async function studioRequest<T>(resource: string, data?: unknown, image?: File): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${STUDIO_ENDPOINT}?resource=${resource}`, {
      method: data !== undefined || image ? "POST" : "GET",
      credentials: "same-origin", cache: "no-store",
      headers: image ? { "Content-Type": image.type } : data !== undefined ? { "Content-Type": "application/json" } : {},
      body: image ?? (data !== undefined ? JSON.stringify(data) : undefined),
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    throw new StudioApiError("Could not reach Studio. Check your connection and retry. Your saved content is safe.", 0);
  }
  const value = await response.json().catch(() => null);
  if (!response.ok || !value) {
    throw new StudioApiError(value?.error ?? "Studio is unavailable. Please retry. For local editing, run Netlify Dev on port 8888.", response.status);
  }
  return value as T;
}
