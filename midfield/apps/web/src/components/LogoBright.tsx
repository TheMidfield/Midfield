import { SVGProps } from "react";

export function LogoBright({ className, ...props }: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            {/* 
                Midfield Logo - Bright variant for dark backgrounds
                - Brighter/whiter outer circle for better contrast on emerald background
                - Same sophisticated pitch center concept
            */}

            {/* Outer ring - softer white for better balance */}
            <circle
                cx="12"
                cy="12"
                r="10"
                className="stroke-white/75"
                strokeWidth="1.5"
                fill="none"
            />

            {/* Inner emerald arc - left side (pitch line aesthetic) */}
            <path
                d="M6.5 12C6.5 8.96 8.96 6.5 12 6.5"
                className="stroke-emerald-200"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
            />

            {/* Inner emerald arc - right side (pitch line aesthetic) */}
            <path
                d="M17.5 12C17.5 15.04 15.04 17.5 12 17.5"
                className="stroke-emerald-200"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
            />

            {/* Center dot - matches outer circle color */}
            <circle
                cx="12"
                cy="12"
                r="2.5"
                className="fill-white/75"
            />
        </svg>
    );
}
