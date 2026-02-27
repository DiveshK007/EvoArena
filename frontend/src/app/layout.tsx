import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EvoArena — Adaptive Liquidity Dashboard",
  description: "AI-driven AMM parameter control on BNB Chain",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-[var(--accent)]">⚔️ EvoArena</span>
            <span className="text-sm text-[var(--muted)]">Adaptive Liquidity Dashboard</span>
          </div>
          <div className="flex gap-4 text-sm text-[var(--muted)]">
            <a href="/" className="hover:text-white transition">Pool</a>
            <a href="/agents" className="hover:text-white transition">Agents</a>
            <a href="/demo" className="hover:text-white transition">Demo</a>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
