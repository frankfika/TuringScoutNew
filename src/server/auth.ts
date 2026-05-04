import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import type { PrismaClient } from "@prisma/client";

const SESSION_COOKIE = "ts_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export function createToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function timingSafeCompare(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export async function createSession(prisma: PrismaClient): Promise<{ token: string; expiresAt: Date }> {
  const token = createToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.adminSession.create({ data: { token, expiresAt } });
  return { token, expiresAt };
}

export async function destroySession(prisma: PrismaClient, token: string | undefined): Promise<void> {
  if (!token) return;
  await prisma.adminSession.deleteMany({ where: { token } });
}

export async function isValidSession(prisma: PrismaClient, token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const session = await prisma.adminSession.findUnique({ where: { token } });
  if (!session) return false;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.adminSession.delete({ where: { token } }).catch(() => {});
    return false;
  }
  return true;
}

export function makeSessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  };
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

export function makeRequireAdmin(prisma: PrismaClient) {
  return async function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const token = (req as Request & { cookies?: Record<string, string> }).cookies?.[SESSION_COOKIE];
    const ok = await isValidSession(prisma, token);
    if (!ok) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    next();
  };
}
