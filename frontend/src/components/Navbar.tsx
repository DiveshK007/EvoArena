"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { WalletButton } from "./WalletButton";
import { Logo } from "./Logo";

const navLinks = [
    { label: "Pool", href: "/" },
    { label: "Agents", href: "/agents" },
    { label: "Swap", href: "/swap" },
    { label: "Liquidity", href: "/liquidity" },
    { label: "Audit", href: "/audit" },
    { label: "Settings", href: "/settings" },
    { label: "Demo", href: "/demo" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header
            className="fixed top-0 left-0 right-0 h-[64px] z-50 w-full"
            style={{
                background: "rgba(20, 20, 30, 0.75)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderBottom: "1px solid rgba(240, 185, 11, 0.12)",
                boxShadow: "0 4px 30px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(255,255,255,0.04)"
            }}
        >
            <div className="w-full max-w-7xl mx-auto h-full px-4 sm:px-6">
                <nav className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center w-full h-full">
                    {/* Left Zone: Logo */}
                    <div className="flex justify-start items-center h-full sm:w-auto">
                        <Link href="/" className="flex items-center gap-2 pl-1 pr-4 shrink-0 h-full">
                            <Logo />
                            <span className="text-[15px] font-bold text-white tracking-tight shrink-0">
                                EvoArena
                            </span>
                        </Link>
                    </div>

                    {/* Center Zone: Desktop Nav Links — pill perfectly hugs each button */}
                    <div className="hidden md:flex items-center justify-center h-full px-2 shrink-0">
                        <div
                            className="flex items-center gap-0.5 p-1 rounded-full"
                            style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.06)",
                            }}
                        >
                            {navLinks.map((link) => {
                                const isActive = link.href === pathname;
                                return (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        /* 1. RELATIVE PARENT — padding creates the pill's physical space */
                                        className="relative px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors duration-200"
                                    >
                                        {/* 2. BACKGROUND PILL — inset-0 stretches it to exactly the padding edges */}
                                        {isActive && (
                                            <span
                                                className="absolute inset-0 rounded-full -z-10"
                                                style={{
                                                    background: "rgba(240,185,11,0.12)",
                                                    border: "1px solid rgba(240,185,11,0.2)",
                                                }}
                                            />
                                        )}
                                        {/* 3. TEXT — z-10 keeps it above the background */}
                                        <span
                                            className={`relative z-10 whitespace-nowrap ${isActive
                                                ? "text-[#F0B90B] font-semibold"
                                                : "text-[#8888a0] hover:text-white"
                                                }`}
                                        >
                                            {link.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Zone: Network + Wallet (Desktop) or Toggle (Mobile) */}
                    <div className="flex items-center justify-end gap-2 shrink-0 h-full pr-1 justify-self-end">
                        <div className="hidden md:flex items-center justify-end gap-2 h-full">
                            {/* Network Chip — only shown on very wide screens */}
                            <div
                                className="hidden xl:inline-flex items-center gap-2 px-3 h-[34px] rounded-full shrink-0"
                                style={{
                                    background: "rgba(240, 185, 11, 0.08)",
                                    border: "1px solid rgba(240, 185, 11, 0.15)",
                                }}
                            >
                                <div className="w-4 h-4 rounded-full flex items-center justify-center bg-bnb-gold/20 shrink-0">
                                    <span className="text-[9px] font-bold text-bnb-gold">B</span>
                                </div>
                                <span className="text-[11px] font-medium text-[#b0b0c0] shrink-0 whitespace-nowrap">
                                    BNB Chapel Testnet
                                </span>
                                <div className="flex items-center gap-0.5 shrink-0">
                                    <div className="w-[3px] h-[10px] rounded-full bg-bnb-gold/40" />
                                    <div className="w-[3px] h-[14px] rounded-full bg-bnb-gold/60" />
                                    <div className="w-[3px] h-[8px] rounded-full bg-bnb-gold/30" />
                                </div>
                            </div>

                            {/* Fixed width constraints are handled in WalletButton */}
                            <div className="inline-flex shrink-0">
                                <WalletButton />
                            </div>
                        </div>

                        {/* Mobile toggle */}
                        <button
                            className="md:hidden flex items-center justify-center w-10 h-10 text-[#8888a0] hover:text-white transition-colors shrink-0"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </nav>
                {/* Mobile dropdown */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className="md:hidden absolute top-[64px] left-0 right-0 px-4 pb-4 bg-[#030305]/95 backdrop-blur-3xl border-b border-[#f0b90b]/10 shadow-[0_20px_40px_rgba(0,0,0,0.8)] pointer-events-auto"
                            style={{ willChange: "transform, opacity" }}
                        >
                            <div className="flex flex-col gap-1 pt-2">
                                {navLinks.map((link) => {
                                    const isActive = link.href === pathname;
                                    return (
                                        <Link
                                            key={link.label}
                                            href={link.href}
                                            onClick={() => setMobileOpen(false)}
                                            className={`block px-4 py-3 rounded-xl text-[14px] transition ${isActive
                                                ? "text-white font-semibold bg-white/[0.06]"
                                                : "text-[#8888a0] hover:text-white"
                                                }`}
                                        >
                                            {link.label}
                                        </Link>
                                    );
                                })}

                                <div className="pt-4 mt-2 border-t border-white/5 mx-2">
                                    <div className="flex items-center justify-between px-2 pb-4">
                                        <span className="text-[12px] font-medium text-[#b0b0c0]">Network</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-[18px] h-[18px] rounded-full bg-[#f0b90b]/20 flex items-center justify-center">
                                                <span className="text-[10px] font-bold text-[#f0b90b]">B</span>
                                            </div>
                                            <span className="text-[12px] font-medium text-white/90">BNB Chapel</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}
