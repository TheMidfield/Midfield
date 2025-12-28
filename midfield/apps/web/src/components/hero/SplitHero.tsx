"use client";

import { useState, useEffect } from "react";
import { EntityCycler } from "./EntityCycler";
import { LiveFeed } from "./LiveFeed";
import { getHeroEntities, type HeroEntity } from "@/app/actions/hero-data";

/**
 * Split Hero - Homepage hero section
 */
export function SplitHero() {
    const [entities, setEntities] = useState<HeroEntity[]>([]);

    useEffect(() => {
        let mounted = true;
        getHeroEntities()
            .then((data) => { if (mounted) setEntities(data); })
            .catch(console.error);
        return () => { mounted = false; };
    }, []);

    return (
        <section
            className="relative mb-10 lg:mb-14 pt-4 pb-6 lg:py-8"
            style={{ width: '100%' }}
        >
            {/* Very subtle grid */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.015]"
                style={{
                    backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }}
            />

            <div
                className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between"
                style={{ gap: '80px', maxWidth: '1280px', margin: '0 auto' }}
            >
                {/* Left Column - Centered vertically */}
                <div className="flex-1 flex flex-col justify-center" style={{ maxWidth: '480px' }}>
                    <EntityCycler entities={entities} />
                </div>

                {/* Right Column - Limited height with fade */}
                <div
                    className="hidden lg:block flex-1 min-w-0 relative"
                    style={{
                        height: '500px',
                        overflow: 'hidden',
                        maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
                    }}
                >
                    <LiveFeed />
                </div>
            </div>
        </section>
    );
}
