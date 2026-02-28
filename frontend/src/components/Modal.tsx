"use client";

import { ReactNode, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { modalOverlay, modalContent } from "@/lib/motion";
import { X } from "lucide-react";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    maxWidth?: string;
}

export default function Modal({
    open,
    onClose,
    title,
    children,
    maxWidth = "max-w-lg",
}: ModalProps) {
    // Close on Escape
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        },
        [onClose]
    );

    useEffect(() => {
        if (open) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [open, handleKeyDown]);

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        variants={modalOverlay}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Content */}
                    <motion.div
                        variants={modalContent}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={`relative w-full ${maxWidth} rounded-2xl overflow-hidden`}
                        style={{
                            background: "rgba(15, 15, 26, 0.95)",
                            backdropFilter: "blur(24px)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            boxShadow: "0 24px 80px rgba(0, 0, 0, 0.6)",
                        }}
                    >
                        {/* Header */}
                        {title && (
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                                <h3 className="text-base font-semibold text-white">{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b6b80] hover:text-white hover:bg-white/[0.06] transition"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {/* Body */}
                        <div className="px-6 py-5">{children}</div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
