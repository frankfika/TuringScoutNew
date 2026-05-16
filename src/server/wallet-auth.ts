/**
 * Blockchain wallet authentication for TuringScout
 * Supports Solana, EVM (Base/Ethereum), and HTX (Huobi Chain)
 */

import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import type { PrismaClient } from "@prisma/client";
import { PublicKey } from "@solana/web3.js";
import { hashMessage, recoverAddress } from "viem";
import nacl from "tweetnacl";
import bs58 from "bs58";

const SESSION_COOKIE = "ts_wallet_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const NONCE_TTL_MS = 1000 * 60 * 5; // 5 minutes

// ── Nonce generation ──────────────────────────────────────────────────

export function generateNonce(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function createToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ── Nonce storage & verification ──────────────────────────────────────

export async function storeNonce(
  prisma: PrismaClient,
  walletAddress: string,
  chain: string,
  nonce: string,
  message: string,
): Promise<void> {
  const expiresAt = new Date(Date.now() + NONCE_TTL_MS);
  await prisma.walletNonce.create({
    data: { walletAddress: walletAddress.toLowerCase(), chain, nonce, message, expiresAt },
  });
}

export async function verifyAndConsumeNonce(
  prisma: PrismaClient,
  walletAddress: string,
  chain: string,
  nonce: string,
): Promise<{ ok: boolean; error?: string }> {
  const record = await prisma.walletNonce.findUnique({ where: { nonce } });
  if (!record) {
    return { ok: false, error: "nonce_not_found" };
  }
  if (record.used) {
    return { ok: false, error: "nonce_already_used" };
  }
  if (record.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "nonce_expired" };
  }
  if (record.walletAddress !== walletAddress.toLowerCase() || record.chain !== chain) {
    return { ok: false, error: "nonce_wallet_mismatch" };
  }

  await prisma.walletNonce.update({ where: { id: record.id }, data: { used: true } });
  return { ok: true };
}

export async function cleanupExpiredNonces(prisma: PrismaClient): Promise<void> {
  const cutoff = new Date(Date.now() - NONCE_TTL_MS * 2);
  await prisma.walletNonce.deleteMany({
    where: { OR: [{ expiresAt: { lt: new Date() } }, { createdAt: { lt: cutoff } }] },
  });
}

// ── Signature verification ───────────────────────────────────────────

/**
 * Verify Solana wallet signature
 */
export function verifySolanaSignature(
  message: string,
  signature: string,
  publicKey: string,
): boolean {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = new PublicKey(publicKey).toBytes();
    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  } catch {
    return false;
  }
}

/**
 * Verify EVM/HTX wallet signature
 */
export async function verifyEvmSignature(
  message: string,
  signature: string,
  expectedAddress: string,
): Promise<boolean> {
  try {
    const hash = hashMessage(message);
    const recoveredAddress = await recoverAddress({
      hash,
      signature: signature as `0x${string}`,
    });
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch {
    return false;
  }
}

// ── Session management ────────────────────────────────────────────────

export async function createWalletSession(
  prisma: PrismaClient,
  walletAddress: string,
  chain: string,
): Promise<{ token: string; expiresAt: Date }> {
  const token = createToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.userSession.create({
    data: { walletAddress, chain, token, expiresAt },
  });

  return { token, expiresAt };
}

export async function getWalletSession(
  prisma: PrismaClient,
  token: string | undefined,
): Promise<{ walletAddress: string; chain: string } | null> {
  if (!token) return null;

  const session = await prisma.userSession.findUnique({ where: { token } });
  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.userSession.delete({ where: { token } }).catch(() => {});
    return null;
  }

  return { walletAddress: session.walletAddress, chain: session.chain };
}

export async function destroyWalletSession(
  prisma: PrismaClient,
  token: string | undefined,
): Promise<void> {
  if (!token) return;
  await prisma.userSession.deleteMany({ where: { token } });
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

// ── Middleware ────────────────────────────────────────────────────────

export function makeRequireWallet(prisma: PrismaClient) {
  return async function requireWallet(req: Request, res: Response, next: NextFunction) {
    const token = (req as Request & { cookies?: Record<string, string> }).cookies?.[SESSION_COOKIE];
    const session = await getWalletSession(prisma, token);

    if (!session) {
      res.status(401).json({ error: "wallet_not_connected" });
      return;
    }

    // Attach wallet info to request
    (req as any).wallet = session;
    next();
  };
}

export function makeOptionalWallet(prisma: PrismaClient) {
  return async function optionalWallet(req: Request, res: Response, next: NextFunction) {
    const token = (req as Request & { cookies?: Record<string, string> }).cookies?.[SESSION_COOKIE];
    const session = await getWalletSession(prisma, token);

    if (session) {
      (req as any).wallet = session;
    }

    next();
  };
}
