"use client";

import { usePathname } from "next/navigation";
import { RightPanel } from "./RightPanel";

export function LayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Pages where we DON'T want the right sidebar
    const noSidebarPages = ['/profile', '/auth', '/design-system', '/settings'];
    const hideSidebar = noSidebarPages.some(path => pathname.startsWith(path));

    // Homepage gets full width layout
    const isHomepage = pathname === '/';

    if (hideSidebar || isHomepage) {
        return (
            <main className="w-full">
                {children}
            </main>
        );
    }

    return (
        <div className="flex flex-col xl:flex-row gap-8 items-start">
            {/* Main Content */}
            <main className="flex-1 min-w-0 w-full">
                {children}
            </main>

            {/* Right Widgets - Desktop ONLY (1280px+) */}
            <aside className="hidden xl:block w-[320px] shrink-0 sticky top-24 self-start">
                <RightPanel />
            </aside>
        </div>
    );
}

