import React from 'react';

// Total Value Locked - Stacked Isometric Hexagons
export function TVLIcon({ className = "w-5 h-5", dropShadow = true }: { className?: string; dropShadow?: boolean }) {
    return (
        <svg viewBox="0 0 100 100" className={`${className} ${dropShadow ? 'drop-shadow-[0_0_8px_rgba(240,185,11,0.6)]' : ''}`} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Top Hex */}
            <polygon points="50,22 73,35 73,50 50,63 27,50 27,35" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
            <path d="M50 22 L50 63 M27 35 L50 48 M73 35 L50 48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
            {/* Middle & Bottom Layers */}
            <path d="M27 60 L50 73 L73 60 M27 70 L50 83 L73 70" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M50 63 L50 83" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
            <circle cx="50" cy="48" r="4" fill="currentColor" />
        </svg>
    );
}

// APY / Yield - Dynamic Geometric Lightning/Curve
export function APYIcon({ className = "w-5 h-5", dropShadow = true }: { className?: string; dropShadow?: boolean }) {
    return (
        <svg viewBox="0 0 100 100" className={`${className} ${dropShadow ? 'drop-shadow-[0_0_8px_rgba(240,185,11,0.6)]' : ''}`} fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M28 72 L48 45 L38 45 L70 24 L52 52 L62 52 L32 82 Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
            <circle cx="70" cy="24" r="5" fill="currentColor" />
            <path d="M25 85 L75 85" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
        </svg>
    );
}

// AI Agents - Neural Core Orb
export function AgentIcon({ className = "w-5 h-5", dropShadow = true }: { className?: string; dropShadow?: boolean }) {
    return (
        <svg viewBox="0 0 100 100" className={`${className} ${dropShadow ? 'drop-shadow-[0_0_8px_rgba(240,185,11,0.6)]' : ''}`} fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="3" strokeDasharray="8 6" />
            <polygon points="50,32 66,50 50,68 34,50" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
            <circle cx="50" cy="50" r="5" fill="currentColor" />
            {/* Radiating nodes */}
            <path d="M50 14 L50 22 M50 78 L50 86 M14 50 L22 50 M78 50 L86 50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <circle cx="50" cy="14" r="2" fill="currentColor" />
            <circle cx="50" cy="86" r="2" fill="currentColor" />
            <circle cx="14" cy="50" r="2" fill="currentColor" />
            <circle cx="86" cy="50" r="2" fill="currentColor" />
        </svg>
    );
}

// Activity / Analytics - Holographic Chart
export function ActivityIcon({ className = "w-5 h-5", dropShadow = true }: { className?: string; dropShadow?: boolean }) {
    return (
        <svg viewBox="0 0 100 100" className={`${className} ${dropShadow ? 'drop-shadow-[0_0_8px_rgba(240,185,11,0.6)]' : ''}`} fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 80 L80 80" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            <path d="M28 72 L28 45 M43 72 L43 25 M57 72 L57 50 M72 72 L72 35" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
            <circle cx="43" cy="25" r="4" fill="currentColor" opacity="0.9" />
            <circle cx="72" cy="35" r="4" fill="currentColor" opacity="0.9" />
        </svg>
    );
}

// Security / Audit - Shield Node
export function ShieldIcon({ className = "w-5 h-5", dropShadow = true }: { className?: string; dropShadow?: boolean }) {
    return (
        <svg viewBox="0 0 100 100" className={`${className} ${dropShadow ? 'drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]' : ''}`} fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 18 L78 26 L78 50 C78 68 65 82 50 88 C35 82 22 68 22 50 L22 26 L50 18 Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
            <path d="M50 18 L50 88" stroke="currentColor" strokeWidth="2" opacity="0.5" />
            <circle cx="50" cy="46" r="8" stroke="currentColor" strokeWidth="3" />
            <circle cx="50" cy="46" r="2" fill="currentColor" />
        </svg>
    );
}

// Trophy / Leaderboard
export function TrophyIcon({ className = "w-5 h-5", dropShadow = true }: { className?: string; dropShadow?: boolean }) {
    return (
        <svg viewBox="0 0 100 100" className={`${className} ${dropShadow ? 'drop-shadow-[0_0_8px_rgba(240,185,11,0.6)]' : ''}`} fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 30 L70 30 L65 55 C60 70 40 70 35 55 Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
            <path d="M30 35 C15 35 15 50 25 50 C30 50 35 45 35 45" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M70 35 C85 35 85 50 75 50 C70 50 65 45 65 45" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M50 65 L50 85" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M35 85 L65 85" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <circle cx="50" cy="42" r="6" fill="currentColor" opacity="0.8" />
        </svg>
    );
}

// Chart / Graph
export function ChartIcon({ className = "w-5 h-5", dropShadow = true }: { className?: string; dropShadow?: boolean }) {
    return (
        <svg viewBox="0 0 100 100" className={`${className} ${dropShadow ? 'drop-shadow-[0_0_8px_rgba(240,185,11,0.6)]' : ''}`} fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 80 L80 80" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            <path d="M25 75 L25 50 M40 75 L40 30 M55 75 L55 45 M70 75 L70 20" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
            <path d="M25 45 L40 25 L55 40 L70 15 L80 15" stroke="currentColor" strokeWidth="3" opacity="0.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// History / Scroll
export function HistoryIcon({ className = "w-5 h-5", dropShadow = true }: { className?: string; dropShadow?: boolean }) {
    return (
        <svg viewBox="0 0 100 100" className={`${className} ${dropShadow ? 'drop-shadow-[0_0_8px_rgba(240,185,11,0.6)]' : ''}`} fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 20 L75 20 C80 20 85 25 85 30 L85 70 C85 75 80 80 75 80 L30 80" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M30 20 C25 20 20 25 20 30 C20 35 25 40 30 40 L35 40 M30 80 C25 80 20 75 20 70 C20 65 25 60 30 60 L35 60" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M35 40 L35 80" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M45 45 L70 45 M45 55 L70 55 M45 65 L60 65" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        </svg>
    );
}

// Lock / Keyhole
export function LockIcon({ className = "w-5 h-5", dropShadow = true }: { className?: string; dropShadow?: boolean }) {
    return (
        <svg viewBox="0 0 100 100" className={`${className} ${dropShadow ? 'drop-shadow-[0_0_8px_rgba(240,185,11,0.6)]' : ''}`} fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="45" width="50" height="40" rx="4" stroke="currentColor" strokeWidth="4" />
            <path d="M35 45 L35 30 C35 20 65 20 65 30 L65 45" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <circle cx="50" cy="60" r="4" fill="currentColor" />
            <path d="M50 64 L50 72" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}

// Gamepad / Node Control
export function GamepadIcon({ className = "w-5 h-5", dropShadow = true }: { className?: string; dropShadow?: boolean }) {
    return (
        <svg viewBox="0 0 100 100" className={`${className} ${dropShadow ? 'drop-shadow-[0_0_8px_rgba(240,185,11,0.6)]' : ''}`} fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 45 C15 30 25 20 40 20 L60 20 C75 20 85 30 85 45 L85 55 C85 70 75 80 60 80 L40 80 C25 80 15 70 15 55 Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
            <path d="M35 50 L45 50 M40 45 L40 55" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <circle cx="60" cy="55" r="4" fill="currentColor" />
            <circle cx="70" cy="45" r="4" fill="currentColor" />
        </svg>
    );
}

// Settings / Gear Node
export function SettingsIcon({ className = "w-5 h-5", dropShadow = true }: { className?: string; dropShadow?: boolean }) {
    return (
        <svg viewBox="0 0 100 100" className={`${className} ${dropShadow ? 'drop-shadow-[0_0_8px_rgba(240,185,11,0.6)]' : ''}`} fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="16" stroke="currentColor" strokeWidth="4" />
            <circle cx="50" cy="50" r="4" fill="currentColor" />
            <path d="M50 15 L50 25 M50 75 L50 85 M15 50 L25 50 M75 50 L85 50" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            <path d="M25 25 L32 32 M68 68 L75 75 M25 75 L32 68 M68 32 L75 25" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        </svg>
    );
}
