import { randomBytes } from "node:crypto";
import { derivePin } from "../../netlify/lib/studio-auth.ts";

// This credential is exclusively for isolated automated tests, never for the deployed function.
export const TEST_PIN = " Test-Only_aA!29# ";
const salt = randomBytes(16);
export const testVerifier = { salt, hash: await derivePin(TEST_PIN, salt) };

export class MemoryStore {
  entries = new Map();
  sequence = 0;
  fail = null;
  async read(key) {
    if (this.fail === `read:${key}`) throw new Error("Simulated storage outage");
    return structuredClone(this.entries.get(key) ?? null);
  }
  async write(key, data, condition) {
    if (this.fail === `write:${key}`) throw new Error("Simulated storage outage");
    const current = this.entries.get(key);
    if (condition?.onlyIfNew && current) return false;
    if (condition?.onlyIfMatch && current?.etag !== condition.onlyIfMatch) return false;
    this.entries.set(key, { data: structuredClone(data), etag: String(++this.sequence) });
    return true;
  }
  async writeBytes(key, data) {
    if (this.fail === "upload") throw new Error("Simulated upload failure");
    this.entries.set(key, { data: data.slice(0), etag: String(++this.sequence) });
  }
  async readBytes(key) { return this.entries.get(key)?.data.slice(0) ?? null; }
  async remove(key) { this.entries.delete(key); }
}

export const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64");
