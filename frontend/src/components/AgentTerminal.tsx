"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    tableRow,
    sectionReveal,
    agentBreathing,
    springs,
    TIMING,
    DELAYS,
} from "@/lib/motion";

/* ── Log types ───────────────────────────────────────────── */
interface LogEntry {
    id: string;
    time: string;
    prefix: string;
    message: string;
    color: string;
}

const prefixColors: Record<string, string> = {
    SYSTEM: "#22c55e",
    AGENT: "#F0B90B",
    ORACLE: "#a855f7",
    CONTRACT: "#00d4ff",
    RISK: "#ef4444",
};

const mockLogs: Omit<LogEntry, "id" | "time">[] = [
    { prefix: "SYSTEM", message: "EvoArena Agent v2.1.0 initialized", color: prefixColors.SYSTEM },
    { prefix: "SYSTEM", message: "Connected to BNB Chapel Testnet (RPC: healthy)", color: prefixColors.SYSTEM },
    { prefix: "AGENT", message: "Monitoring pool 0x7a3f...c91d — polling every 8s", color: prefixColors.AGENT },
    { prefix: "ORACLE", message: "Price feed active: BNB/USD $612.45", color: prefixColors.ORACLE },
    { prefix: "AGENT", message: "Current volatility index: 0.23 (LOW)", color: prefixColors.AGENT },
    { prefix: "AGENT", message: "Fee optimizer running... optimal fee: 30 bps", color: prefixColors.AGENT },
    { prefix: "CONTRACT", message: "Parameters confirmed on-chain (block #41298736)", color: prefixColors.CONTRACT },
    { prefix: "AGENT", message: "Analyzing volatility trend... stable", color: prefixColors.AGENT },
    { prefix: "ORACLE", message: "Price update: BNB/USD $613.21 (+0.12%)", color: prefixColors.ORACLE },
    { prefix: "AGENT", message: "Slippage tolerance adjusted → 0.5%", color: prefixColors.AGENT },
    { prefix: "CONTRACT", message: "setSwapFee(30) → tx 0x8b4c...confirmed", color: prefixColors.CONTRACT },
    { prefix: "RISK", message: "Impermanent loss risk: LOW (0.02%)", color: prefixColors.RISK },
    { prefix: "AGENT", message: "Pool health: OPTIMAL — no action needed", color: prefixColors.AGENT },
    { prefix: "ORACLE", message: "Gas price: 3.2 gwei (network quiet)", color: prefixColors.ORACLE },
    { prefix: "AGENT", message: "Next optimization cycle in 8s...", color: prefixColors.AGENT },
];

/* ── Agent Status States ─────────────────────────────────── */
type AgentState = "idle" | "anticipating" | "acting" | "confident";

export default function AgentTerminal() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const logIndexRef = useRef(0);
    const [agentState, setAgentState] = useState<AgentState>("idle");

    useEffect(() => {
        // Initial batch
        const initialLogs = mockLogs.slice(0, 5).map((log, i) => ({
            ...log,
            id: `log-${i}`,
            time: new Date().toLocaleTimeString("en-US", { hour12: false }),
        }));
        setLogs(initialLogs);
        logIndexRef.current = 5;

        // Stream remaining
        const interval = setInterval(() => {
            const idx = logIndexRef.current % mockLogs.length;
            const log = mockLogs[idx];

            // Agent action sequence: anticipation → acting → confident
            if (log.prefix === "AGENT" && log.message.includes("optimizer")) {
                setAgentState("anticipating");
                setTimeout(() => setAgentState("acting"), DELAYS.anticipation * 1000);
                setTimeout(() => setAgentState("confident"), 1500);
                setTimeout(() => setAgentState("idle"), 3500);
            }

            const newLog: LogEntry = {
                ...log,
                id: `log-${Date.now()}-${idx}`,
                time: new Date().toLocaleTimeString("en-US", { hour12: false }),
            };

            setLogs((prev) => [...prev.slice(-25), newLog]);
            logIndexRef.current++;
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Auto-scroll with smooth behavior
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [logs]);

    return (
        <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="glass-card overflow-hidden"
            style={{
                // Confidence glow when agent succeeds
                boxShadow:
                    agentState === "confident"
                        ? "0 0 24px rgba(34,197,94,0.08), 0 8px 32px rgba(0,0,0,0.3)"
                        : "0 8px 32px rgba(0,0,0,0.3)",
                transition: "box-shadow 0.5s ease-out",
            }}
        >
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04]">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                    </div>
                    <span className="text-xs text-[#6b6b80] font-mono">
                        ❯_ AI AGENT COMMAND FEED
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Agent state badges — spring transitions */}
                    <AnimatePresence mode="wait">
                        {agentState === "anticipating" && (
                            <motion.span
                                key="anticipating"
                                initial={{ opacity: 0, scale: 0.9, filter: "blur(2px)" }}
                                animate={{ opacity: 0.7, scale: 0.99, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={springs.snappy}
                                className="text-[10px] font-mono text-yellow-400/80 px-2 py-0.5 rounded"
                                style={{ background: "rgba(240,185,11,0.06)" }}
                            >
                                ANALYZING…
                            </motion.span>
                        )}
                        {agentState === "acting" && (
                            <motion.span
                                key="acting"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{
                                    opacity: [1, 0.6, 1],
                                    scale: 1,
                                }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    opacity: { duration: 1, repeat: Infinity, ease: "easeInOut" },
                                    scale: springs.snappy,
                                }}
                                className="text-[10px] font-mono text-bnb-gold px-2 py-0.5 rounded"
                                style={{ background: "rgba(240,185,11,0.08)" }}
                            >
                                OPTIMIZING…
                            </motion.span>
                        )}
                        {agentState === "confident" && (
                            <motion.span
                                key="confident"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={springs.snappy}
                                className="text-[10px] font-mono text-green-400 px-2 py-0.5 rounded"
                                style={{
                                    background: "rgba(34,197,94,0.08)",
                                    boxShadow: "0 0 12px rgba(34,197,94,0.12)",
                                }}
                            >
                                ✓ OPTIMIZED
                            </motion.span>
                        )}
                    </AnimatePresence>

                    {/* Agent breathing indicator */}
                    <div className="flex items-center gap-1.5">
                        <motion.div
                            variants={agentBreathing}
                            animate="breathing"
                            className="w-1.5 h-1.5 rounded-full bg-green-400"
                        />
                        <span className="text-[10px] text-green-400 font-mono">
                            STREAMING
                        </span>
                    </div>
                </div>
            </div>

            {/* Terminal Log Body */}
            <div
                ref={scrollRef}
                className="p-5 h-[280px] overflow-y-auto font-mono text-[13px] leading-relaxed space-y-0.5 scanline-overlay"
            >
                <AnimatePresence initial={false}>
                    {logs.map((log) => (
                        <motion.div
                            key={log.id}
                            variants={tableRow}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            layout
                            className="flex gap-2"
                        >
                            <span className="text-[#4a4a5e] shrink-0 select-none">
                                {log.time}
                            </span>
                            <span
                                className="font-semibold shrink-0"
                                style={{ color: log.color }}
                            >
                                [{log.prefix}]
                            </span>
                            <span className="text-[#9898b0]">{log.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Blinking cursor */}
                <div className="flex items-center gap-1 mt-1">
                    <span className="text-[#6b6b80]">❯</span>
                    <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                        className="w-2 h-4 bg-bnb-gold/60 inline-block"
                    />
                </div>
            </div>
        </motion.div>
    );
}
