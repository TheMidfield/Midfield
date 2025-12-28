"use client";

import { usePathname } from "next/navigation";
import { TrendingWidget } from "./widgets/TrendingWidget";
import { SimilarWidget } from "./widgets/SimilarWidget";

export function RightPanel() {
    const pathname = usePathname();

    // Simple logic to extract slug from /topic/[slug]
    // If not a topic page, slug will be undefined, triggering "generic" content
    const isTopicPage = pathname?.startsWith('/topic/');
    const slug = isTopicPage ? pathname.split('/topic/')[1] : undefined;

    return (
        <div className="w-full space-y-6">
            {/* Smart Similar Recommendations (Priority) */}
            <SimilarWidget slug={slug} />

            {/* Smart Trending Widget */}
            <TrendingWidget />
        </div>
    );
}
