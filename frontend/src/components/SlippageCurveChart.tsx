"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    AreaChart,
    Area,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { sectionReveal, scaleIn, springs, TIMING } from "@/lib/motion";
import { SkeletonChart } from "@/components/SkeletonLoader";

/* ── Mock data ───────────────────────────────────────────── */
function generateSlippageData() {
    const data = [];
    for (let i = 0; i <= 24; i++) {
        const t = i * 5;
        const hours = Math.floor(t / 60).toString().padStart(2, "0");
        const mins = (t % 60).toString().padStart(2, "0");
        const base = 0.5 + Math.sin(i * 0.3) * 0.2 + (Math.random() - 0.5) * 0.1;
        const upper = base + 0.3 + Math.random() * 0.15;
        const lower = Math.max(0.05, base - 0.3 - Math.random() * 0.1);
        data.push({
            time: `${hours}:${mins}`,
            optimal: parseFloat(base.toFixed(3)),
            upper: parseFloat(upper.toFixed(3)),
            lower: parseFloat(lower.toFixed(3)),
        });
    }
    return data;
}

/* ── Tooltip — spring snap ───────────────────────────────── */
function SlippageTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="rounded-xl px-4 py-3"
            style={{
                background: "rgba(20, 20, 30, 0.92)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
            }}
        >
            <p className="text-xs text-[#6b6b80] mb-1.5">{label}</p>
            {payload.map((p: any) => (
                <div key={p.dataKey} className="flex items-center gap-2 text-xs">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: p.stroke || p.fill }}
                    />
                    <span className="text-[#8888a0] capitalize">{p.dataKey}:</span>
                    <span className="font-semibold text-white">
                        {(p.value * 100).toFixed(1)}%
                    </span>
                </div>
            ))}
        </motion.div>
    );
}

/* ── Chart ───────────────────────────────────────────────── */
export default function SlippageCurveChart() {
    const [data, setData] = useState<ReturnType<typeof generateSlippageData> | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setData(generateSlippageData()), 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
        >
            <AnimatePresence mode="wait">
                {!data ? (
                    <motion.div
                        key="skeleton"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, filter: "blur(3px)" }}
                        transition={{ duration: TIMING.fast }}
                    >
                        <SkeletonChart />
                    </motion.div>
                ) : (
                    <motion.div
                        key="chart"
                        initial={{ opacity: 0, filter: "blur(4px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        transition={{
                            opacity: { duration: TIMING.normal },
                            filter: { duration: TIMING.slow },
                        }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="section-title-glow">SLIPPAGE TOLERANCE CURVE</h3>
                                <p className="text-xs text-[#6b6b80] mt-1">
                                    Optimal slippage band adjusted by AI
                                </p>
                            </div>
                            <div
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                                style={{
                                    background: "rgba(0, 212, 255, 0.06)",
                                    border: "1px solid rgba(0, 212, 255, 0.12)",
                                }}
                            >
                                <span className="text-xs font-medium text-neon-blue">
                                    OPTIMIZED
                                </span>
                            </div>
                        </div>

                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="slippageFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="rgba(0, 212, 255, 0.2)" />
                                        <stop offset="100%" stopColor="rgba(0, 212, 255, 0)" />
                                    </linearGradient>
                                    <filter id="areaGlow">
                                        <feGaussianBlur stdDeviation="2" result="blur" />
                                        <feMerge>
                                            <feMergeNode in="blur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <XAxis
                                    dataKey="time"
                                    tick={{ fill: "#4a4a5e", fontSize: 10 }}
                                    axisLine={{ stroke: "rgba(255,255,255,0.04)" }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: "#4a4a5e", fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                                    width={40}
                                />
                                <Tooltip
                                    content={<SlippageTooltip />}
                                    cursor={{ stroke: "rgba(0,212,255,0.1)", strokeWidth: 1 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="upper"
                                    stroke="rgba(139, 92, 246, 0.4)"
                                    strokeWidth={1}
                                    strokeDasharray="4 4"
                                    dot={false}
                                    activeDot={false}
                                    animationDuration={1400}
                                    animationEasing="ease-out"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="lower"
                                    stroke="rgba(139, 92, 246, 0.4)"
                                    strokeWidth={1}
                                    strokeDasharray="4 4"
                                    dot={false}
                                    activeDot={false}
                                    animationDuration={1400}
                                    animationEasing="ease-out"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="optimal"
                                    stroke="#00D4FF"
                                    strokeWidth={2}
                                    fill="url(#slippageFill)"
                                    filter="url(#areaGlow)"
                                    animationDuration={1400}
                                    animationEasing="ease-out"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
