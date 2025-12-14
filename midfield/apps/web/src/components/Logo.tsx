import { SVGProps } from "react";

export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            {/* Outer Circle Background */}
            <circle cx="50" cy="50" r="50" className="fill-emerald-600 dark:fill-emerald-500" />

            {/* Inner Design - Techy Pitch Center */}
            <g className="stroke-white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                {/* Center Circle */}
                <circle cx="50" cy="50" r="18" fill="none" />

                {/* Diagonal Divider Line */}
                <line x1="25" y1="75" x2="75" y2="25" />

                {/* Top Arc / Sector */}
                <path d="M50 20 V 32" /> {/* Vertical connector top */}
                <path d="M25 35 Q 35 25 50 20" fill="none" /> {/* Top Left Curve */}
                <path d="M50 20 Q 65 25 75 35" fill="none" /> {/* Top Right Curve */}

                {/* Bottom Arc / Sector */}
                <path d="M50 80 V 68" /> {/* Vertical connector bottom */}
                <path d="M25 65 Q 35 75 50 80" fill="none" /> {/* Bottom Left Curve */}
                <path d="M50 80 Q 65 75 75 65" fill="none" /> {/* Bottom Right Curve */}
            </g>
        </svg>
    );
}
