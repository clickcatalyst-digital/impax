const SESSION_COOKIE = "impax_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const SESSION_SECRET = process.env.AUTH_SECRET || "impax-local-session-secret-change-me";

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...Array.from(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

async function sign(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

export async function createSessionValue(username: string) {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = username + "." + expiresAt;
  return toBase64Url(encoder.encode(payload)) + "." + (await sign(payload));
}

export async function verifySessionValue(value: string | undefined) {
  if (!value) return null;

  try {
    const [encodedPayload, signature] = value.split(".");
    if (!encodedPayload || !signature) return null;

    const payload = new TextDecoder().decode(fromBase64Url(encodedPayload));
    const [username, expiresAtText] = payload.split(".");
    const expiresAt = Number(expiresAtText);
    if (!username || !Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;

    const expectedSignature = await sign(payload);
    if (signature !== expectedSignature) return null;

    return { username, expiresAt };
  } catch {
    return null;
  }
}

export { SESSION_COOKIE, SESSION_TTL_SECONDS };
