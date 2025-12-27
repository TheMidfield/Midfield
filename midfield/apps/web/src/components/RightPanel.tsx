"use client";

import { usePathname } from "next/navigation";
import { TrendingWidget } from "./widgets/TrendingWidget";
import { RelatedTopicsWidget } from "./widgets/RelatedTopicsWidget";

export function RightPanel() {
    const pathname = usePathname();

    // Simple logic to extract slug from /topic/[slug]
    // If not a topic page, slug will be undefined, triggering "generic" content
    const isTopicPage = pathname?.startsWith('/topic/');
    const slug = isTopicPage ? pathname.split('/topic/')[1] : undefined;

    // User requested: "related before trending"

    return (
        <div className="w-full space-y-6">
            {/* Search Widget could go here */}

            {/* Context-Aware Related Content Widget (Priority) */}
            <RelatedTopicsWidget slug={slug} />

            {/* Smart Trending Widget */}
            <TrendingWidget />
        </div>
    );
}
