"use client";

import { useAgents, useParameterHistory } from "@/hooks/useEvoPool";

export default function AgentsPage() {
  const { agents, loading } = useAgents();
  const paramHistory = useParameterHistory();

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
                <div className="grid grid-cols-3 gap-4 text-sm">
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
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* APS Leaderboard placeholder */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[var(--muted)] mb-3 uppercase tracking-wider">
          APS Leaderboard
        </h3>
        <p className="text-[var(--muted)] text-sm">
          Agent Performance Scores are computed off-chain each epoch and saved to{" "}
          <code className="text-[var(--accent)]">agent/state/aps.json</code>.
          Connect APS feed for live rankings.
        </p>
      </div>
    </div>
  );
}
