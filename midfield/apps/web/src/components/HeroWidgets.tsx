"use client";

import { MatchCenterWidget } from "./widgets/MatchCenterWidget";
import { TrendingWidget } from "./widgets/TrendingWidget";

export function HeroWidgets() {
    return (
        <section className="w-full mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Match Center - Full width on mobile, half on desktop */}
                <MatchCenterWidget />

                {/* Trending - Full width on mobile, half on desktop */}
                <TrendingWidget />
            </div>
        </section>
    );
}
