import { Variants, type Spring } from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   EVOARENA MOTION IDENTITY
   Spring-based, physics-driven, intelligence-first.
   Every animation communicates state, never decorates.
   ══════════════════════════════════════════════════════════════ */

/* ── SPRING TOKENS ───────────────────────────────────────────
   Named after their feel, not their numbers.
   All springs settle within 500ms.                            */

export const springs = {
    /** Micro-interactions: buttons, toggles (120–180ms feel) */
    snappy: { type: "spring", stiffness: 500, damping: 30, mass: 0.8 } as Spring,

    /** Standard structural motion (280–350ms feel) */
    smooth: { type: "spring", stiffness: 260, damping: 26, mass: 0.9 } as Spring,

    /** Dashboard boot, section reveals (350–420ms feel) */
    gentle: { type: "spring", stiffness: 180, damping: 22, mass: 1.0 } as Spring,

    /** Settling into rest — micro-oscillation (400–500ms feel) */
    settle: { type: "spring", stiffness: 140, damping: 18, mass: 1.1 } as Spring,

    /** Depth transitions — scale + shadow modulation */
    depth: { type: "spring", stiffness: 220, damping: 24, mass: 0.9 } as Spring,
} as const;

/* ── TIMING CONSTANTS ────────────────────────────────────────
   For non-spring transitions (opacity, color)                */

export const TIMING = {
    micro: 0.12,    // Color shifts, opacity
    fast: 0.18,     // Tooltip appear
    normal: 0.28,   // Section fade
    slow: 0.42,     // Boot sequence steps
} as const;

/* ── ORCHESTRATION DELAYS ────────────────────────────────────
   Micro-delays for sequential reveals                        */

export const DELAYS = {
    stagger: 0.06,    // Between sibling items (60ms)
    cascade: 0.08,    // Between sections (80ms)
    anticipation: 0.08, // Pause before agent action
} as const;

/* ── 1. PAGE BOOT SEQUENCE ───────────────────────────────────
   Cinematic: depth assembly → spring settle → stable.
   Triggers once per session.                                  */

export const bootSequence: Variants = {
    hidden: {
        opacity: 0,
        y: 16,
        scale: 0.98,
        filter: "blur(4px)",
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: {
            ...springs.gentle,
            opacity: { duration: TIMING.normal },
            filter: { duration: TIMING.slow },
        },
    },
};

/* ── 2. STAGGER CONTAINER ────────────────────────────────────
   Parent that orchestrates child reveal timing                */

export const staggerContainer = (
    staggerSec: number = DELAYS.stagger,
    delaySec: number = 0
): Variants => ({
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: staggerSec,
            delayChildren: delaySec,
            opacity: { duration: TIMING.micro },
        },
    },
});

/* ── 3. DEPTH ITEM ───────────────────────────────────────────
   Cards assemble from Z-depth: scale + y + blur → settle     */

export const depthItem: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.94,
        filter: "blur(3px)",
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: {
            ...springs.settle,
            opacity: { duration: TIMING.normal },
            filter: { duration: TIMING.fast },
        },
    },
};

/* ── 4. SECTION REVEAL ───────────────────────────────────────
   Viewport-triggered sections rise and sharpen                */

export const sectionReveal: Variants = {
    hidden: {
        opacity: 0,
        y: 12,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            ...springs.smooth,
            opacity: { duration: TIMING.normal },
        },
    },
};

/* ── 5. SLIDE UP (modals, toasts) ────────────────────────────
   Enter from below with spring, exit with tween               */

export const slideUp: Variants = {
    hidden: { opacity: 0, y: 16, scale: 0.97 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            ...springs.smooth,
            opacity: { duration: TIMING.fast },
        },
    },
    exit: {
        opacity: 0,
        y: 10,
        scale: 0.97,
        transition: { duration: TIMING.fast },
    },
};

/* ── 6. SCALE IN (tooltips) ──────────────────────────────────
   Magnetic snap with slight overshoot                         */

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.88 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            ...springs.snappy,
            opacity: { duration: TIMING.micro },
        },
    },
    exit: {
        opacity: 0,
        scale: 0.92,
        transition: { duration: TIMING.micro },
    },
};

/* ── 7. MODAL ────────────────────────────────────────────────
   Backdrop fades while content assembles from depth           */

export const modalOverlay: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: TIMING.normal },
    },
    exit: {
        opacity: 0,
        transition: { duration: TIMING.fast },
    },
};

export const modalContent: Variants = {
    hidden: { opacity: 0, y: 24, scale: 0.94, filter: "blur(2px)" },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: {
            ...springs.gentle,
            opacity: { duration: TIMING.normal },
            filter: { duration: TIMING.fast },
        },
    },
    exit: {
        opacity: 0,
        y: 12,
        scale: 0.96,
        transition: { duration: TIMING.fast },
    },
};

/* ── 8. TOAST ────────────────────────────────────────────────
   Slides up with spring, settles into stack                   */

export const toastVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            ...springs.smooth,
            opacity: { duration: TIMING.fast },
        },
    },
    exit: {
        opacity: 0,
        y: 8,
        scale: 0.96,
        transition: { duration: TIMING.fast },
    },
};

/* ── 9. BUTTON PHYSICS ───────────────────────────────────────
   Compress on press with spring rebound                       */

export const buttonSpring = {
    whileTap: { scale: 0.96 },
    transition: springs.snappy,
};

/* ── 10. SHAKE (error) ───────────────────────────────────────
   Controlled tension, not cartoon bounce                      */

export const shake: Variants = {
    idle: { x: 0 },
    shake: {
        x: [0, -5, 5, -3, 3, -1, 0],
        transition: { duration: 0.35 },
    },
};

/* ── 11. AGENT BREATHING PULSE ───────────────────────────────
   Ambient "alive" indicator — subtle, continuous              */

export const agentBreathing: Variants = {
    idle: {
        scale: 1,
        opacity: 0.7,
    },
    breathing: {
        scale: [1, 1.04, 1],
        opacity: [0.7, 1, 0.7],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
};

/* ── 12. AGENT ACTION SEQUENCE ───────────────────────────────
   Anticipation pause → coordinated wave → confidence glow     */

export const agentAction: Variants = {
    idle: {
        boxShadow: "0 0 0px rgba(34,197,94,0)",
    },
    anticipation: {
        scale: 0.99,
        transition: { duration: DELAYS.anticipation },
    },
    acting: {
        scale: 1,
        transition: springs.smooth,
    },
    confident: {
        boxShadow: "0 0 20px rgba(34,197,94,0.12)",
        transition: { duration: TIMING.slow },
    },
};

/* ── 13. VALUE RESOLVE ───────────────────────────────────────
   Numbers don't "appear" — they resolve from noise            */

export const valueResolve: Variants = {
    hidden: {
        opacity: 0,
        filter: "blur(6px)",
        y: 4,
    },
    visible: {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        transition: {
            ...springs.smooth,
            opacity: { duration: TIMING.normal },
            filter: { duration: TIMING.slow },
        },
    },
};

/* ── 14. TABLE ROW ───────────────────────────────────────────
   Rows slide in with spring, maintaining spatial context       */

export const tableRow: Variants = {
    hidden: { opacity: 0, y: 6 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            ...springs.snappy,
            opacity: { duration: TIMING.micro },
        },
    },
    exit: {
        opacity: 0,
        y: -4,
        transition: { duration: TIMING.micro },
    },
};

/* ── 15. MORPH (wallet button state transition) ──────────────
   Seamless shape transformation with spring                   */

export const morphTransition = {
    layout: true,
    transition: {
        layout: springs.smooth,
        opacity: { duration: TIMING.fast },
    },
};

/* ── HELPER: withReducedMotion ───────────────────────────────
   Strips transforms for accessibility, keeps opacity           */

export function withReducedMotion(
    variants: Variants,
    prefersReduced: boolean
): Variants {
    if (!prefersReduced) return variants;
    const stripped: Variants = {};
    for (const key in variants) {
        const v = variants[key];
        if (typeof v === "object" && v !== null && !Array.isArray(v)) {
            const { y, x, scale, filter, ...rest } = v as any;
            stripped[key] = {
                ...rest,
                transition: { duration: 0.01 },
            };
        } else {
            stripped[key] = v;
        }
    }
    return stripped;
}
