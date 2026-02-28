"use client";

import { motion } from "framer-motion";
import { ActivityIcon, ShieldIcon } from "@/components/icons";
import HeroSection from "@/components/HeroSection";
import DynamicFeeChart from "@/components/DynamicFeeChart";
import SlippageCurveChart from "@/components/SlippageCurveChart";
import AgentTerminal from "@/components/AgentTerminal";
import { Logo } from "@/components/Logo";
import {
  bootSequence,
  staggerContainer,
  depthItem,
  sectionReveal,
  springs,
  DELAYS,
  TIMING,
} from "@/lib/motion";

export default function HomePage() {
  return (
    <motion.div
      variants={bootSequence}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      {/* ── Hero Section ─────────────────────────────────────── */}
      <HeroSection />

      {/* ── Arena Intelligence ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        {/* Section Header */}
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-2"
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(240,185,11,0.12) 0%, rgba(240,185,11,0.04) 100%)",
              border: "1px solid rgba(240,185,11,0.12)",
            }}
          >
            <ActivityIcon className="w-[18px] h-[18px] text-bnb-gold" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">
              Arena Intelligence
            </h2>
            <p className="text-xs text-[#6b6b80]">
              Polished graph graphics and refined text
            </p>
          </div>
        </motion.div>

        {/* Charts Grid — staggered depth assembly */}
        <motion.div
          variants={staggerContainer(DELAYS.cascade)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <motion.div variants={depthItem}>
            <DynamicFeeChart />
          </motion.div>
          <motion.div variants={depthItem}>
            <SlippageCurveChart />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Agent Terminal ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 space-y-6">
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-2"
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,212,255,0.12) 0%, rgba(0,212,255,0.04) 100%)",
              border: "1px solid rgba(0,212,255,0.1)",
            }}
          >
            <ShieldIcon className="w-[18px] h-[18px] text-neon-blue" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">
              Agent Command Feed
            </h2>
            <p className="text-xs text-[#6b6b80]">
              Live stream from the off-chain AI agent
            </p>
          </div>
        </motion.div>

        <AgentTerminal />
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.04] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm font-bold text-bnb-gold glow-text">
              <Logo className="w-[18px] h-[18px]" /> EvoArena
            </span>
            <span className="text-xs text-[#4a4a5e]">
              AI-Powered Adaptive AMM
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#4a4a5e]">
            <span>Built on BNB Chain</span>
            <span className="text-[#2a2a3e]">•</span>
            <span>Chapel Testnet</span>
            <span className="text-[#2a2a3e]">•</span>
            <a
              href="https://testnet.bscscan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-bnb-gold/50 hover:text-bnb-gold transition"
            >
              Explorer ↗
            </a>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
