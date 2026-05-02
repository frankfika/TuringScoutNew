import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sha256 } from "@/lib/validators";
import { getEnv } from "@/lib/env";

const COOKIE_NAME = "ts_admin";

export function adminPassword() {
  return getEnv("ADMIN_PASSWORD");
}

export async function adminToken() {
  return sha256(`ts-admin:${adminPassword()}`);
}

export async function isAdmin() {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value === (await adminToken());
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function setAdminCookie() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, await adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
