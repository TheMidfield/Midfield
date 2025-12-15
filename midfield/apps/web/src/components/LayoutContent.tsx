"use client";

import { usePathname } from "next/navigation";
import { RightPanel } from "./RightPanel";

export function LayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Pages where we DON'T want the right sidebar
    const noSidebarPages = ['/profile', '/auth', '/design-system', '/settings'];
    const hideSidebar = noSidebarPages.some(path => pathname.startsWith(path));

    if (hideSidebar) {
        return (
            <main className="w-full">
                {children}
            </main>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Main Content */}
            <main className="flex-1 min-w-0 w-full">
                {children}
            </main>

            {/* Right Widgets - Desktop */}
            <aside className="hidden lg:block w-[320px] shrink-0 sticky top-24">
                <RightPanel />
            </aside>
        </div>
    );
}

