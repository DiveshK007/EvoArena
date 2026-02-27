"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/hooks/useWallet";
import { usePoolState } from "@/hooks/useEvoPool";
import { EVOPOOL_ABI, ERC20_ABI, ADDRESSES, CURVE_MODES } from "@/lib/contracts";

export default function SwapPage() {
  const { signer, connected, connect } = useWallet();
  const { state, refetch } = usePoolState(5000);
  const [direction, setDirection] = useState<"0to1" | "1to0">("0to1");
  const [amountIn, setAmountIn] = useState("");
  const [slippage, setSlippage] = useState("1.0");
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const estimateOutput = () => {
    if (!state || !amountIn || isNaN(Number(amountIn))) return "0";
    const inWei = Number(amountIn);
    const r0 = Number(state.reserve0);
    const r1 = Number(state.reserve1);
    const reserveIn = direction === "0to1" ? r0 : r1;
    const reserveOut = direction === "0to1" ? r1 : r0;
    const fee = state.feeBps / 10000;
    const effectiveIn = inWei * (1 - fee);
    const out = (reserveOut * effectiveIn) / (reserveIn + effectiveIn);
    return out.toFixed(6);
  };

  const handleSwap = async () => {
    if (!signer || !connected) {
      await connect();
      return;
    }
    if (!amountIn || Number(amountIn) <= 0) return;

    setSubmitting(true);
    setTxStatus("Preparing swap…");
    setTxHash(null);

    try {
      const pool = new ethers.Contract(ADDRESSES.evoPool, EVOPOOL_ABI, signer);
      const tokenAddr = direction === "0to1" ? ADDRESSES.tokenA : ADDRESSES.tokenB;
      const token = new ethers.Contract(tokenAddr, ERC20_ABI, signer);

      const amountInWei = ethers.parseEther(amountIn);
      const estimatedOut = estimateOutput();
      const slippageFactor = 1 - Number(slippage) / 100;
      const minOut = ethers.parseEther((Number(estimatedOut) * slippageFactor).toFixed(18));

      // Approve token
      setTxStatus("Approving token…");
      const allowance = await token.allowance(await signer.getAddress(), ADDRESSES.evoPool);
      if (allowance < amountInWei) {
        const approveTx = await token.approve(ADDRESSES.evoPool, amountInWei);
        await approveTx.wait();
      }

      // Execute swap
      setTxStatus("Executing swap…");
      const zeroForOne = direction === "0to1";
      const tx = await pool.swap(zeroForOne, amountInWei, minOut);
      setTxHash(tx.hash);
      setTxStatus("Waiting for confirmation…");
      await tx.wait();

      setTxStatus("✅ Swap successful!");
      await refetch();
      setAmountIn("");
    } catch (err: any) {
      console.error("Swap error:", err);
      setTxStatus(`❌ ${err.reason || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-3xl font-bold">💱 Swap</h1>
      <p className="text-[var(--muted)]">Trade tokens on EvoPool with adaptive fees</p>

      {/* Pool info banner */}
      {state && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Current Fee</span>
            <span className="font-bold">{state.feeBps} bps ({(state.feeBps / 100).toFixed(2)}%)</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[var(--muted)]">Curve Mode</span>
            <span className={`font-bold ${state.curveMode === 0 ? "text-[var(--green)]" : state.curveMode === 1 ? "text-[var(--red)]" : "text-[var(--yellow)]"}`}>
              {state.curveModeName}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[var(--muted)]">Price</span>
            <span className="font-bold">{state.price} EVOA/EVOB</span>
          </div>
        </div>
      )}

      {/* Swap card */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-4">
        {/* Direction toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--muted)]">Direction</span>
          <button
            onClick={() => setDirection(direction === "0to1" ? "1to0" : "0to1")}
            className="px-3 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm hover:border-[var(--accent)] transition cursor-pointer"
          >
            {direction === "0to1" ? "EVOA → EVOB" : "EVOB → EVOA"} ⇄
          </button>
        </div>

        {/* Input */}
        <div>
          <label className="text-xs text-[var(--muted)] mb-1 block">
            You pay ({direction === "0to1" ? "EVOA" : "EVOB"})
          </label>
          <input
            type="number"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            placeholder="0.0"
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-3 text-lg font-bold focus:outline-none focus:border-[var(--accent)] transition"
          />
        </div>

        {/* Output estimate */}
        <div>
          <label className="text-xs text-[var(--muted)] mb-1 block">
            You receive ({direction === "0to1" ? "EVOB" : "EVOA"}) — estimated
          </label>
          <div className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-3 text-lg font-bold text-[var(--green)]">
            {estimateOutput()}
          </div>
        </div>

        {/* Slippage */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--muted)]">Slippage tolerance:</span>
          {["0.5", "1.0", "2.0"].map((s) => (
            <button
              key={s}
              onClick={() => setSlippage(s)}
              className={`px-2 py-1 rounded text-xs cursor-pointer ${slippage === s ? "bg-[var(--accent)] text-white" : "bg-[var(--bg)] text-[var(--muted)] border border-[var(--border)]"}`}
            >
              {s}%
            </button>
          ))}
        </div>

        {/* Swap button */}
        <button
          onClick={handleSwap}
          disabled={submitting || (!amountIn && connected)}
          className={`w-full py-3 rounded-lg font-semibold text-white transition cursor-pointer ${
            submitting
              ? "bg-gray-600 cursor-not-allowed"
              : connected
                ? "bg-[var(--accent)] hover:bg-indigo-500"
                : "bg-[var(--green)] hover:bg-green-600"
          }`}
        >
          {submitting ? "⏳ " + (txStatus || "Processing…") : connected ? "🔄 Swap" : "🔗 Connect Wallet to Swap"}
        </button>

        {/* Status */}
        {txStatus && !submitting && (
          <div className="text-sm text-center">
            <p>{txStatus}</p>
            {txHash && (
              <a
                href={`https://testnet.bscscan.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline text-xs"
              >
                View on BscScan ↗
              </a>
            )}
          </div>
        )}
      </div>

      {/* Price impact warning */}
      {state && amountIn && Number(amountIn) > 0 && (
        <div className="text-xs text-[var(--muted)] text-center">
          {state.curveMode === 1 && (
            <span className="text-[var(--yellow)]">
              ⚠️ Defensive mode active — large trades incur quadratic whale penalty
            </span>
          )}
          {state.curveMode === 2 && (
            <span className="text-[var(--yellow)]">
              ⚠️ VolatilityAdaptive mode — spreads widened proportionally to trade size
            </span>
          )}
        </div>
      )}
    </div>
  );
}
