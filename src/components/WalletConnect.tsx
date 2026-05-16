import { useState, useEffect } from "react";
import bs58 from "bs58";

type Chain = "solana" | "evm";

type WalletSession = {
  authenticated: boolean;
  walletAddress?: string;
  chain?: Chain;
};

export function WalletConnect() {
  const [session, setSession] = useState<WalletSession>({ authenticated: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await fetch("/api/wallet/me");
      const data = await res.json();
      setSession(data);
    } catch (err) {
      console.error("Failed to check wallet session:", err);
    }
  }

  async function connectSolana() {
    setLoading(true);
    setError(null);
    try {
      // @ts-ignore - Phantom wallet
      const { solana } = window;
      if (!solana?.isPhantom) {
        throw new Error("Please install Phantom wallet");
      }

      const resp = await solana.connect();
      const walletAddress = resp.publicKey.toString();

      // Get nonce
      const nonceRes = await fetch("/api/wallet/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, chain: "solana" }),
      });
      const { message } = await nonceRes.json();

      // Sign message
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await solana.signMessage(encodedMessage, "utf8");
      const signature = bs58.encode(signedMessage.signature);

      // Login
      const loginRes = await fetch("/api/wallet/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, chain: "solana", signature, message }),
      });

      if (!loginRes.ok) {
        throw new Error("Login failed");
      }

      await checkSession();
    } catch (err: any) {
      setError(err.message || "Failed to connect Solana wallet");
    } finally {
      setLoading(false);
    }
  }

  async function connectEVM() {
    setLoading(true);
    setError(null);
    try {
      // @ts-ignore - MetaMask
      const { ethereum } = window;
      if (!ethereum) {
        throw new Error("Please install MetaMask");
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];

      // Get nonce
      const nonceRes = await fetch("/api/wallet/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, chain: "evm" }),
      });
      const { message } = await nonceRes.json();

      // Sign message
      const signature = await ethereum.request({
        method: "personal_sign",
        params: [message, walletAddress],
      });

      // Login
      const loginRes = await fetch("/api/wallet/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, chain: "evm", signature, message }),
      });

      if (!loginRes.ok) {
        throw new Error("Login failed");
      }

      await checkSession();
    } catch (err: any) {
      setError(err.message || "Failed to connect EVM wallet");
    } finally {
      setLoading(false);
    }
  }

  async function disconnect() {
    try {
      await fetch("/api/wallet/logout", { method: "POST" });
      setSession({ authenticated: false });
    } catch (err) {
      console.error("Failed to disconnect:", err);
    }
  }

  if (session.authenticated) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-[#141414] px-3 py-1.5 rounded-sm shadow-[2px_2px_0_0_#141414]">
          <span className={`w-2 h-2 rounded-full ${
            session.chain === "solana" ? "bg-purple-500" :
            session.chain === "evm" ? "bg-blue-500" :
            "bg-orange-500"
          }`} />
          <span className="text-xs font-mono">
            {session.walletAddress?.slice(0, 6)}...{session.walletAddress?.slice(-4)}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="text-xs font-mono uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <div className="text-xs text-red-600 font-mono mr-2">{error}</div>
      )}
      <button
        onClick={connectSolana}
        disabled={loading}
        className="bg-purple-600 text-white font-mono uppercase tracking-wider text-xs px-3 py-1.5 rounded-sm border border-[#141414] shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.5)] active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? "Connecting..." : "Solana"}
      </button>
      <button
        onClick={connectEVM}
        disabled={loading}
        className="bg-blue-600 text-white font-mono uppercase tracking-wider text-xs px-3 py-1.5 rounded-sm border border-[#141414] shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.5)] active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? "Connecting..." : "EVM"}
      </button>
    </div>
  );
}
