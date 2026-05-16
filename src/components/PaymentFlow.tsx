import { useState } from "react";

type PaymentRequirements = {
  chain: string;
  token: string;
  amountUsd: number;
  amountToken: string;
  payee: string;
  expiresAt: string;
};

type PaymentFlowProps = {
  paymentId: string;
  requirements: PaymentRequirements;
  onSuccess: () => void;
  onCancel: () => void;
};

export function PaymentFlow({ paymentId, requirements, onSuccess, onCancel }: PaymentFlowProps) {
  const [paying, setPaying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string>("");

  async function handlePayNow() {
    setPaying(true);
    setError(null);

    try {
      if (requirements.chain === "solana") {
        await paySolana();
      } else if (requirements.chain === "evm" || requirements.chain === "base" || requirements.chain === "ethereum" || requirements.chain === "polygon" || requirements.chain === "bnb") {
        await payEVM();
      } else {
        throw new Error(`Unsupported chain: ${requirements.chain}`);
      }
    } catch (err: any) {
      setError(err.message || "Payment failed");
      setPaying(false);
    }
  }

  async function paySolana() {
    // @ts-ignore - Phantom wallet
    const { solana } = window;
    if (!solana?.isPhantom) {
      throw new Error("Please install Phantom wallet");
    }

    const { PublicKey, Transaction, SystemProgram, Connection } = await import("@solana/web3.js");
    const connection = new Connection("https://api.mainnet-beta.solana.com");

    // Get sender's public key
    const fromPubkey = solana.publicKey;
    if (!fromPubkey) {
      await solana.connect();
    }

    // Create transfer instruction
    const toPubkey = new PublicKey(requirements.payee);
    const lamports = Math.floor(parseFloat(requirements.amountToken));

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: solana.publicKey,
        toPubkey,
        lamports,
      })
    );

    // Get recent blockhash
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = solana.publicKey;

    // Sign and send
    const signed = await solana.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());

    // Wait for confirmation
    await connection.confirmTransaction(signature);

    // Verify payment
    await verifyPayment(signature);
  }

  async function payEVM() {
    // @ts-ignore - MetaMask
    const { ethereum } = window;
    if (!ethereum) {
      throw new Error("Please install MetaMask");
    }

    const usdcAddresses: Record<string, string> = {
      base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      polygon: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      bnb: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    };

    const chain = requirements.chain === "evm" ? "base" : requirements.chain;
    const usdcAddress = usdcAddresses[chain];
    if (!usdcAddress) {
      throw new Error(`Unsupported EVM chain: ${chain}`);
    }

    // Build ERC-20 transfer calldata: transfer(address,uint256)
    const selector = "a9059cbb";
    const payeeHex = requirements.payee.slice(2).padStart(64, "0");
    const amountHex = BigInt(requirements.amountToken).toString(16).padStart(64, "0");
    const data = `0x${selector}${payeeHex}${amountHex}`;

    const txHash = await ethereum.request({
      method: "eth_sendTransaction",
      params: [{
        from: ethereum.selectedAddress,
        to: usdcAddress,
        data,
      }],
    });

    await verifyPayment(txHash);
  }

  async function verifyPayment(hash: string) {
    setTxHash(hash);
    setPaying(false);
    setVerifying(true);

    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, txHash: hash }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Payment verification failed");
      }

      setVerifying(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Verification failed");
      setVerifying(false);
    }
  }

  async function handleManualVerify() {
    if (!txHash.trim()) {
      setError("Please enter transaction hash");
      return;
    }
    await verifyPayment(txHash.trim());
  }

  return (
    <div className="mt-4 border-2 border-orange-400 bg-orange-50 rounded-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-mono font-bold bg-orange-200 text-orange-800 px-2 py-1 border border-orange-400">
          402 PAYMENT REQUIRED
        </span>
        <span className="text-xs opacity-60 font-mono">
          This service requires payment
        </span>
      </div>

      <div className="bg-white border border-orange-300 rounded-sm p-4 mb-4">
        <div className="grid grid-cols-2 gap-3 text-sm font-mono">
          <div>
            <div className="text-xs opacity-60 mb-1">Amount</div>
            <div className="font-bold">
              ${requirements.amountUsd} {requirements.token}
            </div>
          </div>
          <div>
            <div className="text-xs opacity-60 mb-1">Chain</div>
            <div className="font-bold uppercase">{requirements.chain}</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs opacity-60 mb-1">Payee Address</div>
            <div className="font-bold text-xs break-all">{requirements.payee}</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs opacity-60 mb-1">Expires At</div>
            <div className="text-xs">{new Date(requirements.expiresAt).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 rounded-sm p-3 mb-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {verifying && (
        <div className="bg-blue-50 border border-blue-300 rounded-sm p-3 mb-4 text-sm text-blue-800 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Verifying payment on-chain...
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={handlePayNow}
          disabled={paying || verifying}
          className="bg-orange-600 text-white font-mono uppercase tracking-wider font-bold py-3 px-5 rounded-sm border-2 border-[#141414] shadow-[3px_3px_0_0_rgba(0,0,0,0.5)] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_0_rgba(0,0,0,0.5)] active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
        >
          {paying ? "Opening Wallet..." : verifying ? "Verifying..." : "Pay Now"}
        </button>

        <div className="text-xs opacity-60 text-center font-mono">OR</div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter transaction hash manually"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            disabled={verifying}
            className="flex-1 border border-[#141414] bg-white py-2 px-3 rounded-sm text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <button
            onClick={handleManualVerify}
            disabled={verifying || !txHash.trim()}
            className="bg-[#141414] text-white font-mono uppercase tracking-wider font-bold py-2 px-4 rounded-sm border border-[#141414] shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            Verify
          </button>
        </div>

        <button
          onClick={onCancel}
          disabled={paying || verifying}
          className="text-xs font-mono uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity py-2"
        >
          Cancel
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-orange-200">
        <div className="text-xs opacity-60 font-mono space-y-1">
          <div>💡 Payment ID: {paymentId}</div>
          <div>🔗 This payment is linked to your A2A task</div>
          <div>✅ Task will auto-complete after payment verification</div>
        </div>
      </div>
    </div>
  );
}
