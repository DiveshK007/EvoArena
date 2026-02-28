"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { sectionReveal, scaleIn, springs, TIMING } from "@/lib/motion";
import { SkeletonChart } from "@/components/SkeletonLoader";

/* ── Mock data ───────────────────────────────────────────── */
function generateFeeData() {
    const data = [];
    let fee = 30;
    for (let i = 0; i <= 42; i++) {
        const t = i * 5;
        const hours = Math.floor(t / 60).toString().padStart(2, "0");
        const mins = (t % 60).toString().padStart(2, "0");
        fee += (Math.random() - 0.45) * 4;
        fee = Math.max(20, Math.min(65, fee));
        data.push({
            time: `${hours}:${mins}`,
            fee: parseFloat((fee / 100).toFixed(3)),
        });
    }
    return data;
}

/* ── Tooltip — snaps magnetically ────────────────────────── */
function FeeTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    const value = payload[0].value;
    const status =
        value > 0.45 ? "High Volatility" : value < 0.35 ? "AI Stable" : "Normal";
    const statusColor =
        value > 0.45
            ? "text-red-400"
            : value < 0.35
                ? "text-green-400"
                : "text-bnb-gold";

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
            <p className="text-xs text-[#6b6b80] mb-1">{label}</p>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-bnb-gold" />
                <span className="text-sm font-semibold text-white">
                    {(value * 100).toFixed(1)}%
                </span>
                <span className="text-xs text-[#6b6b80]">Fee</span>
            </div>
            <p className={`text-[10px] font-medium mt-1 ${statusColor}`}>
                {status}
            </p>
        </motion.div>
    );
}

/* ── Chart Component ─────────────────────────────────────── */
export default function DynamicFeeChart() {
    const [data, setData] = useState<ReturnType<typeof generateFeeData> | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setData(generateFeeData()), 800);
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
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="section-title-glow">DYNAMIC FEE ADJUSTMENTS</h3>
                                <p className="text-xs text-[#6b6b80] mt-1">
                                    AI agent fee modulation over time
                                </p>
                            </div>
                            <div
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                                style={{
                                    background: "rgba(240, 185, 11, 0.06)",
                                    border: "1px solid rgba(240, 185, 11, 0.12)",
                                }}
                            >
                                <motion.div
                                    animate={{
                                        scale: [1, 1.3, 1],
                                        opacity: [0.7, 1, 0.7],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="w-2 h-2 rounded-full bg-bnb-gold"
                                />
                                <span className="text-xs font-medium text-[#8888a0]">LIVE</span>
                            </div>
                        </div>

                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={data}>
                                <defs>
                                    <filter id="lineGlow">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
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
                                    domain={["auto", "auto"]}
                                    width={40}
                                />
                                <Tooltip
                                    content={<FeeTooltip />}
                                    cursor={{
                                        stroke: "rgba(240, 185, 11, 0.15)",
                                        strokeWidth: 1,
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="fee"
                                    stroke="#F0B90B"
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{
                                        r: 5,
                                        fill: "#F0B90B",
                                        stroke: "rgba(240, 185, 11, 0.3)",
                                        strokeWidth: 6,
                                    }}
                                    filter="url(#lineGlow)"
                                    animationDuration={1400}
                                    animationEasing="ease-out"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
