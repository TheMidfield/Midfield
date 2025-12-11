import Link from "next/link";
import { User, Zap, Terminal } from "lucide-react";
import { ThemeToggle } from "./ui/ThemeToggle";
import { Button } from "./ui/Button";
import { IconButton } from "./ui/IconButton";
import { SearchInput } from "./SearchInput";

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-slate-300 dark:border-neutral-800 shadow-sm">
            <div className="w-full max-w-[1600px] mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Left: Brand + Nav */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-500 dark:hover:bg-emerald-400 transition-colors shadow-sm">
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
                <div className="flex items-center gap-3">
                    <Link href="/design-system" className="hidden lg:block">
                        <Button variant="ghost" size="sm" icon={Terminal}>
                            Showcase
                        </Button>
                    </Link>

                    <SearchInput />

                    <ThemeToggle />

                    <Link href="/auth">
                        <IconButton icon={User} variant="subtle" />
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
                px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200
                ${active
                    ? "text-slate-900 dark:text-neutral-100 bg-slate-100 dark:bg-neutral-800"
                    : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-100 hover:bg-slate-50 dark:hover:bg-neutral-800"
                }
            `}
        >
            {children}
        </Link>
    );
}
