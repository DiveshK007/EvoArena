export function Logo({ className = "w-[28px] h-[28px]" }: { className?: string }) {
    return (
        <div className={`flex items-center justify-center shrink-0 ${className}`}>
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full drop-shadow-[0_0_6px_rgba(240,185,11,0.8)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* 3 Inner Isometric Lines */}
                <path
                    d="M50 10 L50 50 M15.36 70 L50 50 M84.64 70 L50 50"
                    stroke="#60A5FA"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
                {/* Hexagon Outline */}
                <polygon
                    points="50,10 84.64,30 84.64,70 50,90 15.36,70 15.36,30"
                    stroke="#F0B90B"
                    strokeWidth="8"
                    strokeLinejoin="round"
                />
                {/* Center Dot */}
                <circle cx="50" cy="50" r="12" fill="#F0B90B" />
            </svg>
        </div>
    );
}
