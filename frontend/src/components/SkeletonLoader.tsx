"use client";

import { motion } from "framer-motion";

/* ── Skeleton Card ───────────────────────────────────────── */
export function SkeletonCard({ className = "" }: { className?: string }) {
    return (
        <div
            className={`rounded-2xl p-5 ${className}`}
            style={{
                background:
                    "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
            }}
        >
            <div className="space-y-3">
                <div className="skeleton-shimmer h-3 w-24 rounded" />
                <div className="skeleton-shimmer h-7 w-32 rounded" />
                <div className="skeleton-shimmer h-3 w-16 rounded" />
            </div>
        </div>
    );
}

/* ── Skeleton Chart ──────────────────────────────────────── */
export function SkeletonChart({ className = "" }: { className?: string }) {
    return (
        <div
            className={`glass-card p-6 ${className}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                    <div className="skeleton-shimmer h-3 w-36 rounded" />
                    <div className="skeleton-shimmer h-2.5 w-48 rounded" />
                </div>
                <div className="skeleton-shimmer h-7 w-16 rounded-lg" />
            </div>

            {/* Chart area */}
            <div className="h-[260px] flex items-end gap-1 pt-8">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="skeleton-shimmer flex-1 rounded-t"
                        style={{
                            height: `${30 + Math.sin(i * 0.5) * 40 + Math.random() * 20}%`,
                            animationDelay: `${i * 50}ms`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

/* ── Skeleton Table ──────────────────────────────────────── */
export function SkeletonTable({
    rows = 5,
    className = "",
}: {
    rows?: number;
    className?: string;
}) {
    return (
        <div className={`space-y-2 ${className}`}>
            {/* Header */}
            <div className="flex gap-4 py-2">
                {[80, 60, 60, 70, 50].map((w, i) => (
                    <div
                        key={i}
                        className="skeleton-shimmer h-3 rounded"
                        style={{ width: `${w}px` }}
                    />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className="flex gap-4 py-3 border-t border-white/[0.04]"
                    style={{ animationDelay: `${i * 60}ms` }}
                >
                    {[80, 60, 60, 70, 50].map((w, j) => (
                        <div
                            key={j}
                            className="skeleton-shimmer h-3 rounded"
                            style={{
                                width: `${w + Math.random() * 20}px`,
                                animationDelay: `${(i * 5 + j) * 40}ms`,
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

/* ── Skeleton → Content Transition Wrapper ───────────────── */
export function SkeletonToContent({
    loading,
    skeleton,
    children,
}: {
    loading: boolean;
    skeleton: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <motion.div
            key={loading ? "skeleton" : "content"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
        >
            {loading ? skeleton : children}
        </motion.div>
    );
}
