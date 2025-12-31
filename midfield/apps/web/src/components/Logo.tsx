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
            {/* Enhanced Pitch Center / Lens Concept */}
            {/* Left Bracket - thicker, more refined curve */}
            <path
                d="M7.5 3.5C4 5.8 2 9.2 2 12C2 14.8 4 18.2 7.5 20.5"
                className="stroke-emerald-500 dark:stroke-emerald-400"
                strokeWidth="2"
                strokeLinecap="round"
            />

            {/* Right Bracket */}
            <path
                d="M16.5 3.5C20 5.8 22 9.2 22 12C22 14.8 20 18.2 16.5 20.5"
                className="stroke-emerald-500 dark:stroke-emerald-400"
                strokeWidth="2"
                strokeLinecap="round"
            />

            {/* Center Dot (Kickoff / Focus) - with subtle ring */}
            <circle
                cx="12"
                cy="12"
                r="3.5"
                className="fill-slate-900 dark:fill-white"
            />
            <circle
                cx="12"
                cy="12"
                r="5"
                className="stroke-slate-900/20 dark:stroke-white/20"
                strokeWidth="1"
                fill="none"
            />
        </svg>
    );
}
