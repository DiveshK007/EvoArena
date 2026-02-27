"use client";

import { useState } from "react";
import { usePoolState } from "@/hooks/useEvoPool";

export default function DemoPage() {
  const { state, loading, refetch } = usePoolState(5000);
  const [demoLog, setDemoLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const runDemoEpoch = async () => {
    setRunning(true);
    setDemoLog((prev) => [...prev, `[${new Date().toISOString()}] Starting demo epoch...`]);

    try {
      const res = await fetch("/api/demo", { method: "POST" });
      const data = await res.json();

      if (data.error) {
        setDemoLog((prev) => [...prev, `❌ Error: ${data.error}`]);
      } else {
        setDemoLog((prev) => [
          ...prev,
          `✅ Agent ran epoch successfully`,
          `   Rule: ${data.ruleFired || "unknown"}`,
          `   Fee: ${data.feeBps || "?"} bps`,
          `   Mode: ${data.curveMode || "?"}`,
          `   TX: ${data.txHash || "dry-run"}`,
        ]);
      }

      await refetch();
    } catch (err: any) {
      setDemoLog((prev) => [...prev, `❌ Fetch error: ${err.message}`]);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">🎮 Demo Panel</h1>
      <p className="text-[var(--muted)]">
        Run a single agent epoch to see parameter updates in real-time
      </p>

      {/* Current state */}
      {state && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--muted)] mb-3 uppercase tracking-wider">
            Current Pool State
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-[var(--muted)]">Fee</div>
              <div className="text-xl font-bold">{state.feeBps} bps</div>
            </div>
            <div>
              <div className="text-[var(--muted)]">Beta</div>
              <div className="text-xl font-bold">{state.curveBeta}</div>
            </div>
            <div>
              <div className="text-[var(--muted)]">Mode</div>
              <div className="text-xl font-bold">{state.curveModeName}</div>
            </div>
            <div>
              <div className="text-[var(--muted)]">Trades</div>
              <div className="text-xl font-bold">{state.tradeCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* Run button */}
      <button
        onClick={runDemoEpoch}
        disabled={running}
        className={`px-6 py-3 rounded-lg font-semibold text-white transition ${
          running
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-[var(--accent)] hover:bg-indigo-500 cursor-pointer"
        }`}
      >
        {running ? "⏳ Running epoch..." : "⚡ Run Demo Epoch"}
      </button>

      <p className="text-xs text-[var(--muted)]">
        This calls the agent in <code>--once</code> mode via the backend API.
        The agent reads pool state, computes strategy, and submits a parameter update.
      </p>

      {/* Log */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[var(--muted)] mb-3 uppercase tracking-wider">
          Demo Log
        </h3>
        <div className="font-mono text-xs space-y-1 max-h-80 overflow-y-auto">
          {demoLog.length === 0 ? (
            <p className="text-[var(--muted)]">Click &quot;Run Demo Epoch&quot; to start</p>
          ) : (
            demoLog.map((line, i) => (
              <div key={i} className="text-[var(--text)]">{line}</div>
            ))
          )}
        </div>
      </div>

      {/* Comparison placeholder */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[var(--muted)] mb-3 uppercase tracking-wider">
          Static Baseline vs EvoPool Comparison
        </h3>
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div>
            <h4 className="font-bold mb-2 text-[var(--red)]">Static AMM</h4>
            <ul className="space-y-1 text-[var(--muted)]">
              <li>Fee: 30 bps (fixed)</li>
              <li>Curve: constant-product</li>
              <li>No whale defense</li>
              <li>No volatility adaptation</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-2 text-[var(--green)]">EvoPool (Agent-Controlled)</h4>
            <ul className="space-y-1 text-[var(--muted)]">
              <li>Fee: {state?.feeBps || "?"} bps (dynamic)</li>
              <li>Curve: {state?.curveModeName || "?"}</li>
              <li>Whale defense: {state?.curveMode === 1 ? "Active ✅" : "Standby"}</li>
              <li>Volatility adaptive: {state?.curveMode === 2 ? "Active ✅" : "Standby"}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
