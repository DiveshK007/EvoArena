"use client";

import { useRef, useCallback, useEffect, type MouseEvent } from "react";

interface MagneticOptions {
    /** Max pull distance in pixels (default 8) */
    strength?: number;
    /** Passive zone radius in pixels (default 80) */
    radius?: number;
}

/**
 * Makes an element magnetically attracted to the cursor on hover.
 * Attach ref to the element, handlers to its wrapper.
 * Uses requestAnimationFrame for smooth 60fps tracking.
 */
export function useMagneticHover(options: MagneticOptions = {}) {
    const { strength = 8, radius = 80 } = options;
    const ref = useRef<HTMLElement>(null);
    const rafRef = useRef<number | null>(null);
    const currentX = useRef(0);
    const currentY = useRef(0);
    const targetX = useRef(0);
    const targetY = useRef(0);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = useCallback(() => {
        currentX.current = lerp(currentX.current, targetX.current, 0.15);
        currentY.current = lerp(currentY.current, targetY.current, 0.15);

        if (ref.current) {
            ref.current.style.transform = `translate(${currentX.current}px, ${currentY.current}px)`;
        }

        if (
            Math.abs(currentX.current - targetX.current) > 0.1 ||
            Math.abs(currentY.current - targetY.current) > 0.1
        ) {
            rafRef.current = requestAnimationFrame(animate);
        }
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!ref.current) return;

            const rect = ref.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < radius) {
                const pull = 1 - distance / radius;
                targetX.current = dx * pull * (strength / radius) * 3;
                targetY.current = dy * pull * (strength / radius) * 3;
            } else {
                targetX.current = 0;
                targetY.current = 0;
            }

            if (rafRef.current === null) {
                rafRef.current = requestAnimationFrame(animate);
            }
        },
        [strength, radius, animate]
    );

    const handleMouseLeave = useCallback(() => {
        targetX.current = 0;
        targetY.current = 0;
        if (rafRef.current === null) {
            rafRef.current = requestAnimationFrame(animate);
        }
    }, [animate]);

    useEffect(() => {
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return {
        ref,
        handlers: {
            onMouseMove: handleMouseMove,
            onMouseLeave: handleMouseLeave,
        },
    };
}
