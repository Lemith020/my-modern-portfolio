import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

export type PinVerifier = { salt: Buffer; hash: Buffer };

// Server only. Never import this module from the browser bundle.
export const productionVerifier: PinVerifier = {
  salt: Buffer.from("f2e19469a2df27bf03128208ef075a4f", "hex"),
  hash: Buffer.from("5723d723aac53a2c5b8c3b099d469aacf3221a8ef27bfb50d1fb78c93ab1795c", "hex"),
};

export const SCRYPT_OPTIONS = { N: 32768, r: 8, p: 3, maxmem: 96 * 1024 * 1024 };
export const SESSION_MS = 60 * 60 * 1000;
export const COOKIE_NAME = "article_studio_session";

export function derivePin(pin: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(pin, salt, 32, SCRYPT_OPTIONS, (error, key) => error ? reject(error) : resolve(key));
  });
}

export async function verifyPin(pin: string, verifier: PinVerifier): Promise<boolean> {
  const key = await derivePin(pin, verifier.salt);
  return verifier.hash.length === 32 && timingSafeEqual(key, verifier.hash);
}

export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
export const newToken = () => randomBytes(32).toString("hex");

export function readToken(request: Request): string | null {
  const value = request.headers.get("cookie")?.split(";")
    .map(part => part.trim()).find(part => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);
  return value && /^[a-f0-9]{64}$/.test(value) ? value : null;
}

export function sessionCookie(token: string, secure: boolean, maxAge = SESSION_MS / 1000): string {
  return `${COOKIE_NAME}=${token}; Path=/.netlify/functions/article-studio; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}
