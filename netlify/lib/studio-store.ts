import { getStore } from "@netlify/blobs";

export type Stored<T> = { data: T; etag: string };
export type Condition = { onlyIfNew: true } | { onlyIfMatch: string };
export interface StudioStore {
  read<T>(key: string): Promise<Stored<T> | null>;
  write(key: string, value: unknown, condition?: Condition): Promise<boolean>;
  readBytes(key: string): Promise<ArrayBuffer | null>;
  writeBytes(key: string, value: ArrayBuffer): Promise<void>;
  remove(key: string): Promise<void>;
}

export function createBlobStore(name = "article-studio-v1", localDevelopment = process.env.NETLIFY_DEV === "true"): StudioStore {
  const store = getStore({ name, consistency: "strong" });
  return {
    async read<T>(key: string) {
      const entry = await store.getWithMetadata(key, { type: "json", consistency: "strong" });
      if (!entry) return null;
      if (entry.etag) return { data: entry.data as T, etag: entry.etag };
      // The local Blobs emulator omits ETags on GET, but provides them on LIST.
      // Bracket a fresh read with version checks; never silently drop the CAS guard.
      if (localDevelopment) {
        for (let attempt = 0; attempt < 3; attempt++) {
          const before = (await store.list({ prefix: key })).blobs.find(blob => blob.key === key)?.etag;
          const data = await store.get(key, { type: "json", consistency: "strong" });
          const after = (await store.list({ prefix: key })).blobs.find(blob => blob.key === key)?.etag;
          if (before && before === after && data !== null) return { data: data as T, etag: before };
        }
      }
      throw new Error("Storage did not return a stable version identifier.");
    },
    async write(key, value, condition) {
      const result = await store.setJSON(key, value, condition);
      return result.modified;
    },
    readBytes: key => store.get(key, { type: "arrayBuffer", consistency: "strong" }),
    async writeBytes(key, value) {
      const result = await store.set(key, value, { onlyIfNew: true });
      if (!result.modified) throw new Error("Upload key already exists.");
    },
    remove: key => store.delete(key),
  };
}
