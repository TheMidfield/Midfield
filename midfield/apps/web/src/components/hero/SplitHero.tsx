"use client";

import { EntityCycler } from "./EntityCycler";
import { LiveFeed } from "./LiveFeed";
import type { HeroEntity } from "@/app/actions/hero-data";

/**
 * Split Hero - Homepage hero section
 * Now receives entities via SSR for instant loading
 */
export function SplitHero({ entities }: { entities: HeroEntity[] }) {
    return (
        <section
            className="relative mb-10 lg:mb-14 pt-4 pb-6 lg:py-8 overflow-visible"
            style={{ width: '100%' }}
        >
            {/* Fading grid background - uses radial mask to fade edges */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                    backgroundSize: '24px 24px',
                    maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 70%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 70%)'
                }}
            />

            <div
                className="relative z-10 flex flex-col lg:flex-row justify-between"
                style={{ gap: '80px', maxWidth: '1280px', margin: '0 auto' }}
            >
                {/* Left Column - Determines section height */}
                <div className="flex-1 flex flex-col justify-center" style={{ maxWidth: '480px' }}>
                    <EntityCycler entities={entities} />
                </div>

                {/* Right Column - Absolutely positioned, extends slightly beyond left */}
                <div
                    className="hidden lg:block absolute right-0 top-0"
                    style={{
                        width: 'calc(50% - 40px)', // Half width minus half gap
                        maxWidth: '600px',
                        height: '480px',
                        overflow: 'hidden',
                        // Simple clean fade - stays solid for 75%, then fades quickly
                        maskImage: 'linear-gradient(to bottom, black 0%, black 75%, transparent 95%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 75%, transparent 95%)'
                    }}
                >
                    <LiveFeed />
                </div>
            </div>
        </section>
    );
}
