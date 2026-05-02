export function isValidHttpUrl(input: string) {
  try {
    const url = new URL(input);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function optionalValidHttpUrl(input?: string | null) {
  if (!input) return true;
  return isValidHttpUrl(input);
}

export function isValidEmail(input?: string | null) {
  if (!input) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

export async function sha256(input: string) {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
