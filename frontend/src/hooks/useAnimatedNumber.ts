"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseAnimatedNumberOptions {
    /** Duration in ms (default 800) */
    duration?: number;
    /** Decimal places (default 0) */
    decimals?: number;
    /** Prefix (e.g. "$") */
    prefix?: string;
    /** Suffix (e.g. "%", "M") */
    suffix?: string;
}

/**
 * Physics-based number animation with velocity decay.
 * Starts fast, decelerates like a settling spring.
 * Returns formatted string, direction, resolved state, and flash trigger.
 */
export function useAnimatedNumber(
    target: number,
    options: UseAnimatedNumberOptions = {}
) {
    const { duration = 800, decimals = 0, prefix = "", suffix = "" } = options;

    const [display, setDisplay] = useState(target);
    const [direction, setDirection] = useState<"up" | "down" | null>(null);
    const [resolved, setResolved] = useState(true);
    const [flashKey, setFlashKey] = useState(0);
    const prevTarget = useRef(target);
    const animRef = useRef<number | null>(null);

    const animate = useCallback(
        (from: number, to: number) => {
            if (animRef.current) cancelAnimationFrame(animRef.current);

            setResolved(false);
            const start = performance.now();
            const diff = to - from;

            const step = (now: number) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);

                // Velocity decay: starts at ~3x speed, decays exponentially
                // Creates the "fast rush → gentle settle" physics feel
                const decay = 1 - Math.exp(-5 * progress);
                const current = from + diff * decay;

                setDisplay(current);

                if (progress < 1) {
                    animRef.current = requestAnimationFrame(step);
                } else {
                    setDisplay(to);
                    setResolved(true);
                }
            };

            animRef.current = requestAnimationFrame(step);
        },
        [duration]
    );

    useEffect(() => {
        if (target !== prevTarget.current) {
            const prev = prevTarget.current;
            setDirection(target > prev ? "up" : "down");
            setFlashKey((k) => k + 1);
            animate(prev, target);
            prevTarget.current = target;
        }
    }, [target, animate]);

    useEffect(() => {
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, []);

    const formatted = `${prefix}${display.toFixed(decimals)}${suffix}`;

    return { formatted, display, direction, resolved, flashKey };
}
