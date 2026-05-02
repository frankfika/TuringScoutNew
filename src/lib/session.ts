import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/validators";

const COOKIE_NAME = "ts_user";

export async function userToken(userId: string) {
  return `${userId}.${await sha256(`ts-user:${userId}:${process.env.AUTH_SECRET ?? "local-auth"}`)}`;
}

export async function setUserCookie(userId: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, await userToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearUserCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const [userId, signature] = token.split(".");
  if (!userId || !signature) return null;
  if (token !== (await userToken(userId))) return null;
  return prisma.publicUser.findUnique({ where: { id: userId }, include: { creator: true } });
}
