import Link from "next/link";
import { Search, User, Zap, Terminal } from "lucide-react";
import { ThemeToggle } from "./ui/ThemeToggle";

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-slate-200 dark:border-neutral-800 transition-all duration-300">
            <div className="w-full max-w-[1600px] mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Left: Brand + Nav */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-neutral-900 flex items-center justify-center cursor-pointer hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
                            <Zap className="w-5 h-5 fill-current" />
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-neutral-100">Midfield</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        <NavLink href="/" active>Discovery</NavLink>
                        <NavLink href="/clubs">Clubs</NavLink>
                        <NavLink href="/matches">Matches</NavLink>
                        <NavLink href="/transfers">Transfers</NavLink>
                    </div>
                </div>

                {/* Right: Search + Theme + Profile */}
                <div className="flex items-center gap-4">
                    <Link href="/design-system" className="hidden lg:flex items-center gap-2 mr-2 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer">
                        <Terminal className="w-4 h-4" />
                        <span>Showcase</span>
                    </Link>

                    <SearchInput />

                    <ThemeToggle />

                    <Link href="/auth" className="flex items-center gap-2 pl-2 cursor-pointer">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors">
                            <User className="w-5 h-5 text-slate-600 dark:text-neutral-400" />
                        </div>
                    </Link>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
    return (
        <Link
            href={href}
            className={`
                px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                ${active
                    ? "text-slate-900 dark:text-neutral-100 bg-slate-100 dark:bg-neutral-800"
                    : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-neutral-800"
                }
            `}
        >
            {children}
        </Link>
    );
}

// Simple internal client component for search if we don't want a new file yet, 
// but Next.js requires 'use client' at top of file for hooks. 
// So I MUST import it.
import { SearchInput } from "./SearchInput";
