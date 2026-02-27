"use client";

import { useState, useEffect } from "react";
import { useAgents, useParameterHistory } from "@/hooks/useEvoPool";
import { APSChart, APSDataPoint } from "@/components/Charts";

interface APSSnapshot {
  epoch: number;
  aps: number;
  lpReturnDelta: number;
  slippageReduction: number;
  volatilityCompression: number;
  feeRevenue: number;
  agentAddress: string;
  timestamp: string;
}

export default function AgentsPage() {
  const { agents, loading } = useAgents();
  const paramHistory = useParameterHistory();
  const [apsData, setApsData] = useState<APSSnapshot[]>([]);
  const [apsLoading, setApsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/aps");
        const json = await res.json();
        setApsData(json.snapshots || []);
      } catch (e) {
        console.error("Failed to load APS data:", e);
      } finally {
        setApsLoading(false);
      }
    })();
  }, []);

  // Aggregate APS by agent for leaderboard
  const leaderboard = apsData.reduce<Record<string, { total: number; count: number; latest: number; best: number }>>((acc, s) => {
    const addr = s.agentAddress;
    if (!acc[addr]) acc[addr] = { total: 0, count: 0, latest: 0, best: 0 };
    acc[addr].total += s.aps;
    acc[addr].count++;
    acc[addr].latest = s.aps;
    acc[addr].best = Math.max(acc[addr].best, s.aps);
    return acc;
  }, {});

  const sortedLeaderboard = Object.entries(leaderboard)
    .map(([addr, stats]) => ({
      address: addr,
      avgAps: stats.count > 0 ? stats.total / stats.count : 0,
      latestAps: stats.latest,
      bestAps: stats.best,
      epochs: stats.count,
    }))
    .sort((a, b) => b.avgAps - a.avgAps);

  // Chart data
  const apsChartData: APSDataPoint[] = apsData.map((s) => ({
    epoch: s.epoch,
    aps: s.aps,
    lpReturnDelta: s.lpReturnDelta,
    slippageReduction: s.slippageReduction,
    volatilityCompression: s.volatilityCompression,
    feeRevenue: s.feeRevenue,
    agentAddress: s.agentAddress,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">🤖 Agents</h1>
      <p className="text-[var(--muted)]">Registered AI agents controlling EvoPool parameters</p>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[var(--accent)] border-t-transparent"></div>
        </div>
      ) : agents.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 text-center">
          <p className="text-[var(--muted)]">No agents registered yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {agents.map((agent, i) => {
            const agentUpdates = paramHistory.filter(
              (e) => e.agent.toLowerCase() === agent.address.toLowerCase()
            );
            const agentAps = leaderboard[agent.address];
            return (
              <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`inline-block w-3 h-3 rounded-full ${agent.active ? "bg-[var(--green)]" : "bg-[var(--red)]"}`}></span>
                    <span className="font-mono text-sm">{agent.address}</span>
                  </div>
                  <span className="text-sm text-[var(--muted)]">
                    Bond: {agent.bondAmount} BNB
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <div className="text-[var(--muted)]">Registered</div>
                    <div>{new Date(agent.registeredAt * 1000).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[var(--muted)]">Last Update</div>
                    <div>
                      {agent.lastUpdateTime > 0
                        ? new Date(agent.lastUpdateTime * 1000).toLocaleString()
                        : "Never"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[var(--muted)]">Updates</div>
                    <div>{agentUpdates.length}</div>
                  </div>
                  <div>
                    <div className="text-[var(--muted)]">Avg APS</div>
                    <div className="text-[var(--accent)] font-bold">
                      {agentAps && agentAps.count > 0
                        ? (agentAps.total / agentAps.count).toFixed(4)
                        : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[var(--muted)]">Best APS</div>
                    <div className="text-[var(--green)] font-bold">
                      {agentAps && agentAps.best > 0 ? agentAps.best.toFixed(4) : "—"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* APS Leaderboard */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[var(--muted)] mb-3 uppercase tracking-wider">
          🏆 APS Leaderboard
        </h3>
        {sortedLeaderboard.length === 0 ? (
          <p className="text-[var(--muted)] text-sm">
            {apsLoading
              ? "Loading APS data…"
              : "No APS scores recorded yet. Run the agent to generate scores."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[var(--muted)] text-left">
                  <th className="pb-2">Rank</th>
                  <th className="pb-2">Agent</th>
                  <th className="pb-2">Avg APS</th>
                  <th className="pb-2">Best APS</th>
                  <th className="pb-2">Latest APS</th>
                  <th className="pb-2">Epochs</th>
                </tr>
              </thead>
              <tbody>
                {sortedLeaderboard.map((entry, i) => (
                  <tr key={entry.address} className="border-t border-[var(--border)]">
                    <td className="py-2">
                      <span className={`font-bold ${i === 0 ? "text-[var(--yellow)]" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-700" : ""}`}>
                        #{i + 1}
                      </span>
                    </td>
                    <td className="py-2 font-mono text-xs">{entry.address.slice(0, 10)}…{entry.address.slice(-6)}</td>
                    <td className="py-2 font-bold text-[var(--accent)]">{entry.avgAps.toFixed(4)}</td>
                    <td className="py-2 text-[var(--green)]">{entry.bestAps.toFixed(4)}</td>
                    <td className="py-2">{entry.latestAps.toFixed(4)}</td>
                    <td className="py-2">{entry.epochs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* APS Chart */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[var(--muted)] mb-3 uppercase tracking-wider">
          📊 APS Over Epochs
        </h3>
        <APSChart data={apsChartData} />
      </div>
    </div>
  );
}
