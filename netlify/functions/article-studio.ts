import type { Context } from "@netlify/functions";
import { createBlobStore } from "../lib/studio-store.ts";
import { createStudioService } from "../lib/studio-service.ts";

export default async function handler(request: Request, context: Context) {
  try {
    // Preview deployments must not edit the production article catalog.
    const deployContext = context.deploy.context;
    const storeName = deployContext === "production" ? "article-studio-v1" : `article-studio-v1-${deployContext || "dev"}`;
    const service = createStudioService(createBlobStore(storeName), { secureCookies: process.env.NETLIFY_DEV !== "true" });
    return await service(request, context.ip);
  } catch {
    return Response.json({ error: "Studio storage is unavailable. Please retry." }, {
      status: 503, headers: { "Cache-Control": "no-store", "Netlify-CDN-Cache-Control": "no-store" },
    });
  }
}
