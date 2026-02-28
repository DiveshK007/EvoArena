"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowUp,
    ArrowDown,
} from "lucide-react";
import { TVLIcon, APYIcon, AgentIcon } from "@/components/icons";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import {
    staggerContainer,
    depthItem,
    valueResolve,
    springs,
    TIMING,
    DELAYS,
} from "@/lib/motion";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { SkeletonCard } from "@/components/SkeletonLoader";

const ArenaOrb = dynamic(() => import("./ArenaOrb"), { ssr: false });

/* ── Stat card data ──────────────────────────────────────── */
const statConfigs: Array<{
    label: string;
    value: number;
    decimals: number;
    prefix: string;
    suffix: string;
    change?: number;
    changeText?: string;
    icon: React.ElementType;
}> = [
        {
            label: "TOTAL VALUE LOCKED",
            value: 2.47,
            decimals: 2,
            prefix: "$",
            suffix: "M",
            change: 12.4,
            icon: TVLIcon,
        },
        {
            label: "CURRENT POOL APY",
            value: 18.6,
            decimals: 1,
            prefix: "",
            suffix: "%",
            change: 3.2,
            icon: APYIcon,
        },
        {
            label: "ACTIVE AI AGENTS",
            value: 3,
            decimals: 0,
            prefix: "",
            suffix: "",
            change: 0,
            changeText: "Online",
            icon: AgentIcon,
        },
    ];

/* ── Animated Stat Card ──────────────────────────────────── */
function StatCard({
    label,
    value,
    decimals,
    prefix,
    suffix,
    change,
    changeText,
    icon: Icon,
}: (typeof statConfigs)[0] & { changeText?: string }) {
    const { formatted, direction, resolved, flashKey } = useAnimatedNumber(
        value,
        { duration: 800, decimals, prefix, suffix }
    );

    return (
        <motion.div
            variants={depthItem}
            whileHover={{
                y: -3,
                scale: 1.01,
                boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
            }}
            transition={springs.snappy}
            className="group relative rounded-2xl p-5 cursor-default"
            style={{
                background:
                    "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow:
                    "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
        >
            <div className="flex items-center justify-between">
                {/* Left: Data */}
                <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold tracking-[0.15em] text-[#6b6b80] uppercase">
                        {label}
                    </span>
                    <div className="flex items-baseline gap-2.5">
                        {/* Value resolves from blur */}
                        <motion.span
                            key={flashKey}
                            variants={valueResolve}
                            initial="hidden"
                            animate="visible"
                            className="text-2xl sm:text-3xl font-bold inline-block transition-colors duration-500"
                            style={{
                                color: resolved ? "#ffffff" : "rgba(255,255,255,0.7)",
                            }}
                        >
                            {formatted}
                        </motion.span>

                        {/* Direction arrow with micro-motion */}
                        {changeText ? (
                            <span className="text-xs font-semibold text-green-400">
                                {changeText}
                            </span>
                        ) : change !== undefined && change !== 0 ? (
                            <motion.span
                                key={`dir-${flashKey}`}
                                initial={{ opacity: 0, y: direction === "up" ? 4 : -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={springs.snappy}
                                className={`text-xs font-semibold flex items-center gap-0.5 ${change > 0 ? "text-green-400" : "text-red-400"
                                    }`}
                            >
                                {change > 0 ? (
                                    <ArrowUp size={10} />
                                ) : (
                                    <ArrowDown size={10} />
                                )}
                                {change > 0 ? "+" : ""}
                                {change}%
                            </motion.span>
                        ) : null}
                    </div>
                </div>

                {/* Right: Icon */}
                <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                        background:
                            "linear-gradient(135deg, rgba(240,185,11,0.12) 0%, rgba(240,185,11,0.04) 100%)",
                        border: "1px solid rgba(240,185,11,0.12)",
                    }}
                >
                    <Icon className="w-5 h-5 text-bnb-gold" />
                </div>
            </div>
        </motion.div>
    );
}

/* ── Hero Section ────────────────────────────────────────── */
export default function HeroSection() {
    const [booted, setBooted] = useState(false);

    // Simulates data loading / system boot
    useEffect(() => {
        const timer = setTimeout(() => setBooted(true), 700);
        return () => clearTimeout(timer);
    }, []);

    return (
        <section className="relative w-full max-w-7xl mx-auto px-6 pt-24 pb-12 min-h-[calc(100vh-4rem)] flex flex-col justify-center">
            {/* The Grid: Splits the screen exactly 50/50 on large screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center flex-1">

                {/* --- LEFT SIDE: TEXT --- */}
                <motion.div
                    initial={{ opacity: 0, x: -16, filter: "blur(4px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{
                        ...springs.gentle,
                        opacity: { duration: TIMING.normal },
                        filter: { duration: TIMING.slow },
                    }}
                    className="relative z-10 flex flex-col items-start justify-center"
                >
                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-4 leading-[1.05]">
                        The Arena
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 font-light max-w-md">
                        AI-driven adaptive liquidity protocol on BNB Chain
                    </p>
                </motion.div>

                {/* --- RIGHT SIDE: 3D ORB --- */}
                {/* Constrained Box: This forces the orb to stay on the right side and limits its height */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.88, filter: "blur(6px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{
                        ...springs.settle,
                        opacity: { duration: TIMING.slow, delay: 0.1 },
                        filter: { duration: TIMING.slow, delay: 0.15 },
                    }}
                    className="relative w-full h-[400px] lg:h-[600px] flex items-center justify-center z-0"
                >
                    {/* Your 3D Component */}
                    <Suspense fallback={
                        <div className="w-full h-full flex items-center justify-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                className="w-14 h-14 rounded-full border-2 border-bnb-gold/40 border-t-transparent"
                            />
                        </div>
                    }>
                        <ArenaOrb />
                    </Suspense>
                </motion.div>
            </div>

            {/* --- BOTTOM SIDE: STAT CARDS --- */}
            {/* This ensures the cards stay perfectly below the text and orb */}
            <div className="mt-12 relative z-20 w-full">
                <AnimatePresence mode="wait">
                    {!booted ? (
                        <motion.div
                            key="skeleton"
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0, filter: "blur(3px)" }}
                            transition={{ duration: TIMING.fast }}
                            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                        >
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            variants={staggerContainer(DELAYS.stagger, 0)}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                        >
                            {statConfigs.map((stat) => (
                                <StatCard key={stat.label} {...stat} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
