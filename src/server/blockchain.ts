/**
 * Blockchain verification for x402 payments.
 * Supports Solana, EVM (Base/Ethereum), and HTX (Huobi Chain).
 */

import { Connection, PublicKey, type TransactionSignature } from "@solana/web3.js";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

// ── Platform receiving wallets (configured via env) ───────────────────

function getWallet(chain: string): string {
  switch (chain) {
    case "solana":
      return process.env.PLATFORM_WALLET_SOLANA || "";
    case "evm":
      return process.env.PLATFORM_WALLET_EVM || "";
    case "htx":
      return process.env.PLATFORM_WALLET_HTX || "";
    default:
      return "";
  }
}

// ── Solana ────────────────────────────────────────────────────────────

const solanaConnection = new Connection(
  process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com",
  "confirmed",
);

export async function verifySolanaPayment(
  txHash: string,
  expectedPayee: string,
  expectedAmountToken: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const sig = txHash as TransactionSignature;
    const tx = await solanaConnection.getTransaction(sig, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    if (!tx) return { ok: false, error: "Transaction not found" };
    if (tx.meta?.err) return { ok: false, error: "Transaction failed" };

    // For SPL-token transfers (USDC), check token balance changes
    // For native SOL, check lamport changes
    // Simplified: just verify the tx exists and succeeded
    // In production, parse pre/post token balances to verify amount + recipient

    const postTokenBalances = tx.meta?.postTokenBalances || [];
    const preTokenBalances = tx.meta?.preTokenBalances || [];

    // Find the receiver's USDC balance change
    const msg = tx.transaction.message;
    const accountKeys = "staticAccountKeys" in msg
      ? msg.staticAccountKeys.map((k) => k.toBase58())
      : (msg as { accountKeys: { pubkey: PublicKey }[] }).accountKeys.map((k) => k.pubkey.toBase58());
    const receiverIdx = accountKeys.findIndex((addr) => addr === expectedPayee);
    if (receiverIdx === -1) return { ok: false, error: "Payee not in transaction" };

    const pre = preTokenBalances.find((b) => b.accountIndex === receiverIdx);
    const post = postTokenBalances.find((b) => b.accountIndex === receiverIdx);
    if (!post) return { ok: false, error: "No token balance change for payee" };

    const preUi = pre ? Number(pre.uiTokenAmount.amount) : 0;
    const postUi = Number(post.uiTokenAmount.amount);
    const received = postUi - preUi;

    const expected = Number(expectedAmountToken);
    if (received < expected) {
      return { ok: false, error: `Insufficient amount: received ${received}, expected ${expected}` };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ── EVM / HTX ─────────────────────────────────────────────────────────

const evmClient = createPublicClient({
  chain: base,
  transport: http(process.env.EVM_RPC || "https://mainnet.base.org"),
});

const htxChain = {
  id: 128,
  name: "Huobi ECO Chain",
  nativeCurrency: { name: "HT", symbol: "HT", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.HTX_RPC || "https://http-mainnet.hecochain.com"] },
    public: { http: [process.env.HTX_RPC || "https://http-mainnet.hecochain.com"] },
  },
} as const;

const htxClient = createPublicClient({
  chain: htxChain,
  transport: http(process.env.HTX_RPC || "https://http-mainnet.hecochain.com"),
});

export async function verifyEvmPayment(
  txHash: string,
  expectedPayee: string,
  expectedAmountToken: string,
  chain: "evm" | "htx" = "evm",
): Promise<{ ok: boolean; error?: string }> {
  try {
    const client = chain === "htx" ? htxClient : evmClient;
    const tx = await client.getTransaction({ hash: txHash as `0x${string}` });
    if (!tx) return { ok: false, error: "Transaction not found" };

    const receipt = await client.getTransactionReceipt({ hash: tx.hash });
    if (!receipt || receipt.status !== "success") {
      return { ok: false, error: "Transaction failed or not confirmed" };
    }

    // For ERC-20 transfers, the 'to' field is the token contract; actual recipient is in logs
    // Simplified check: verify tx exists and succeeded; amount validation requires log parsing
    // In production, parse Transfer event logs to verify amount + recipient

    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ── Unified entry ─────────────────────────────────────────────────────

export async function verifyOnchainPayment(
  txHash: string,
  chain: string,
  expectedPayee: string,
  expectedAmountToken: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!expectedPayee) return { ok: false, error: "No platform wallet configured for chain" };
  switch (chain) {
    case "solana":
      return verifySolanaPayment(txHash, expectedPayee, expectedAmountToken);
    case "evm":
      return verifyEvmPayment(txHash, expectedPayee, expectedAmountToken, "evm");
    case "htx":
      return verifyEvmPayment(txHash, expectedPayee, expectedAmountToken, "htx");
    default:
      return { ok: false, error: `Unsupported chain: ${chain}` };
  }
}

export { getWallet };
