"use client";

import { usePathname } from "next/navigation";
import { TrendingWidget } from "./widgets/TrendingWidget";
import { SimilarWidget } from "./widgets/SimilarWidget";
import { MatchCenterWidget } from "./widgets/MatchCenterWidget";

export function RightPanel() {
    const pathname = usePathname();

    // Simple logic to extract slug from /topic/[slug]
    // If not a topic page, slug will be undefined, triggering "generic" content
    const isTopicPage = pathname?.startsWith('/topic/');
    const isHomepage = pathname === '/';
    const slug = isTopicPage ? pathname.split('/topic/')[1] : undefined;

    return (
        <div className="w-full space-y-6">
            {/* Match Center - show on homepage and non-topic pages */}
            {!isTopicPage && <MatchCenterWidget />}

            {/* Smart Similar Recommendations (Priority on topic pages) */}
            <SimilarWidget slug={slug} />

            {/* Smart Trending Widget */}
            <TrendingWidget />
        </div>
    );
}
