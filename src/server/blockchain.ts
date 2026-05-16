/**
 * Blockchain verification for x402 payments.
 * Supports Solana (native SOL) and EVM chains (Base, Ethereum, Polygon, BNB).
 */

import { Connection, PublicKey, type TransactionSignature } from "@solana/web3.js";
import { createPublicClient, http } from "viem";

// ── Chain Configurations ──────────────────────────────────────────────

const CHAIN_CONFIGS: Record<string, { rpc: string; usdc: `0x${string}`; name: string; id: number }> = {
  base: {
    rpc: process.env.EVM_RPC || "https://mainnet.base.org",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    name: "Base",
    id: 8453,
  },
  ethereum: {
    rpc: process.env.ETH_RPC || "https://eth.llamarpc.com",
    usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    name: "Ethereum",
    id: 1,
  },
  polygon: {
    rpc: process.env.POLYGON_RPC || "https://polygon.llamarpc.com",
    usdc: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    name: "Polygon",
    id: 137,
  },
  bnb: {
    rpc: process.env.BNB_RPC || "https://bsc-dataseed.binance.org",
    usdc: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    name: "BNB Chain",
    id: 56,
  },
};

function getChainConfig(chain: string) {
  // "evm" is a legacy alias for Base (matches existing .env / RPC defaults)
  if (chain === "evm") return CHAIN_CONFIGS.base;
  return CHAIN_CONFIGS[chain] || CHAIN_CONFIGS.base;
}

// ── Platform receiving wallets ────────────────────────────────────────

export function getWallet(chain: string): string {
  switch (chain) {
    case "solana":
      return process.env.PLATFORM_WALLET_SOLANA || "";
    case "evm":
    case "base":
    case "ethereum":
    case "polygon":
    case "bnb": {
      const specific = process.env[`PLATFORM_WALLET_${chain.toUpperCase()}`];
      return specific || process.env.PLATFORM_WALLET_EVM || "";
    }
    default:
      return "";
  }
}

// ── Solana (native SOL transfer) ──────────────────────────────────────

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

    // Verify native SOL transfer by checking lamport balance change
    const msg = tx.transaction.message;
    const accountKeys = "staticAccountKeys" in msg
      ? msg.staticAccountKeys.map((k) => k.toBase58())
      : (msg as { accountKeys: { pubkey: PublicKey }[] }).accountKeys.map((k) => k.pubkey.toBase58());

    const receiverIdx = accountKeys.findIndex((addr) => addr === expectedPayee);
    if (receiverIdx === -1) return { ok: false, error: "Payee not in transaction accounts" };

    const preBalance = tx.meta?.preBalances[receiverIdx] ?? 0;
    const postBalance = tx.meta?.postBalances[receiverIdx] ?? 0;
    const received = postBalance - preBalance;

    const expected = Number(expectedAmountToken);
    if (received < expected) {
      return { ok: false, error: `Insufficient amount: received ${received} lamports, expected ${expected}` };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ── EVM (ERC-20 USDC Transfer log parsing) ────────────────────────────

const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

function makeViemChain(config: (typeof CHAIN_CONFIGS)["base"]) {
  return {
    id: config.id,
    name: config.name,
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: { http: [config.rpc] },
      public: { http: [config.rpc] },
    },
  } as const;
}

export async function verifyEvmPayment(
  txHash: string,
  expectedPayee: string,
  expectedAmountToken: string,
  chain: string = "base",
): Promise<{ ok: boolean; error?: string }> {
  try {
    const config = getChainConfig(chain);
    const client = createPublicClient({
      chain: makeViemChain(config),
      transport: http(config.rpc),
    });

    const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` });
    if (!receipt) return { ok: false, error: "Transaction not found" };
    if (receipt.status !== "success") return { ok: false, error: "Transaction failed or not confirmed" };

    const expectedPayeeLower = expectedPayee.toLowerCase();
    const expectedAmount = BigInt(expectedAmountToken);
    const usdcLower = config.usdc.toLowerCase();

    for (const log of receipt.logs as any[]) {
      // Filter: must be from the USDC contract and match Transfer event signature
      if (log.address.toLowerCase() !== usdcLower) continue;
      if (log.topics[0]?.toLowerCase() !== TRANSFER_TOPIC) continue;

      // ERC-20 Transfer indexed args: topics[1] = from, topics[2] = to
      const toTopic = log.topics[2];
      if (!toTopic) continue;
      const toAddress = ("0x" + toTopic.slice(-40)).toLowerCase();

      if (toAddress === expectedPayeeLower) {
        const amount = BigInt(log.data);
        if (amount >= expectedAmount) {
          return { ok: true };
        }
      }
    }

    return {
      ok: false,
      error: `No valid USDC Transfer to ${expectedPayee} with amount >= ${expectedAmountToken} found on ${config.name}`,
    };
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
    case "base":
    case "ethereum":
    case "polygon":
    case "bnb":
      return verifyEvmPayment(txHash, expectedPayee, expectedAmountToken, chain);
    default:
      return { ok: false, error: `Unsupported chain: ${chain}` };
  }
}
