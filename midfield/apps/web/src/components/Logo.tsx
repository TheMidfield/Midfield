import { SVGProps } from "react";

export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            {/* 
                Midfield Logo - Sophisticated pitch center concept
                - Center circle represents the kickoff spot (the heart of football)
                - Elegant arcs suggest the center circle markings
                - Premium, minimal design aligned with our rounded-md aesthetic
            */}

            {/* Outer ring - subtle, refined circle */}
            <circle
                cx="12"
                cy="12"
                r="10"
                className="stroke-slate-300 dark:stroke-neutral-600"
                strokeWidth="1.5"
                fill="none"
            />

            {/* Inner emerald arc - left side (pitch line aesthetic) */}
            <path
                d="M6.5 12C6.5 8.96 8.96 6.5 12 6.5"
                className="stroke-emerald-500 dark:stroke-emerald-400"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
            />

            {/* Inner emerald arc - right side (pitch line aesthetic) */}
            <path
                d="M17.5 12C17.5 15.04 15.04 17.5 12 17.5"
                className="stroke-emerald-500 dark:stroke-emerald-400"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
            />

            {/* Center dot - the kickoff point */}
            <circle
                cx="12"
                cy="12"
                r="2.5"
                className="fill-slate-900 dark:fill-white"
            />
        </svg>
    );
}
