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
            {/* Minimalist Pitch Center / Lens Concept */}
            {/* Left Bracket */}
            <path
                d="M8 4C4.5 6 2 9.5 2 12C2 14.5 4.5 18 8 20"
                className="stroke-emerald-600 dark:stroke-emerald-400"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            {/* Right Bracket */}
            <path
                d="M16 4C19.5 6 22 9.5 22 12C22 14.5 19.5 18 16 20"
                className="stroke-emerald-600 dark:stroke-emerald-400"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            {/* Center Dot (Kickoff / Focus) */}
            <circle
                cx="12"
                cy="12"
                r="3"
                className="fill-slate-900 dark:fill-white"
            />
        </svg>
    );
}
