"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User as UserIcon, Terminal, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ui/ThemeToggle";
import { Button } from "./ui/Button";
import { IconButton } from "./ui/IconButton";
import { NavbarSearch } from "./NavbarSearch";
import { useEffect, useState } from "react";

export function Navbar() {
    const pathname = usePathname();
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Fetch user profile for avatar
        async function loadUserProfile() {
            try {
                const response = await fetch('/api/user-profile');
                if (response.ok) {
                    const data = await response.json();
                    setUserAvatar(data.avatar_url);
                }
            } catch (error) {
                console.error('Failed to load user profile:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadUserProfile();

        // Listen for avatar updates from profile page
        const handleAvatarUpdate = (event: CustomEvent) => {
            setUserAvatar(event.detail.avatarUrl);
        };

        window.addEventListener('avatar-updated', handleAvatarUpdate as EventListener);

        return () => {
            window.removeEventListener('avatar-updated', handleAvatarUpdate as EventListener);
        };
    }, []);

    const isActive = (path: string) => {
        if (path === "/") return pathname === "/";
        return pathname?.startsWith(path);
    };

    return (
        <nav className="fixed top-0 z-50 w-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-slate-300 dark:border-neutral-800">
            <div className="w-full max-w-[1600px] mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24">

                {/* Left: Brand + Nav */}
                <div className="flex items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 min-w-0">
                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <img
                            src="/midfield-logo.png"
                            alt=""
                            className="h-7 sm:h-8 md:h-9 w-auto"
                        />
                        <span className="font-black text-base sm:text-lg md:text-xl tracking-tighter text-slate-900 dark:text-neutral-100 uppercase">
                            Midfield
                        </span>
                    </Link>

                    {/* Desktop Nav - visible at 900px+ */}
                    <div className="hidden lg:flex items-center gap-1">
                        <NavLink href="/" active={isActive("/")}>Home</NavLink>
                        <NavLink href="/players" active={isActive("/players")}>Players</NavLink>
                        <NavLink href="/clubs" active={isActive("/clubs")}>Clubs</NavLink>
                        <NavLink href="/leagues" active={isActive("/leagues")}>Leagues</NavLink>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {/* Search - visible at 768px+ */}
                    <div className="hidden md:block">
                        <NavbarSearch />
                    </div>

                    <Link href="/design-system" className="hidden xl:block">
                        <Button variant="ghost" size="sm" icon={Terminal}>
                            Showcase
                        </Button>
                    </Link>

                    <ThemeToggle />

                    <Link href="/profile">
                        {!isLoading && userAvatar ? (
                            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-md overflow-hidden border-2 border-slate-200 dark:border-neutral-700 hover:border-slate-400 dark:hover:border-neutral-600 transition-all cursor-pointer">
                                <img
                                    src={userAvatar}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <IconButton icon={UserIcon} variant="ghost" />
                        )}
                    </Link>

                    {/* Hamburger Menu - Below lg breakpoint, professional design */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-md text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-all cursor-pointer group"
                        aria-label="Menu"
                    >
                        <span className={`w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                        <span className={`w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                        <span className={`w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Mobile Menu Drawer - Smooth slide-down animation */}
            {isMobileMenuOpen && (
                <>
                    {/* Backdrop with fade-in */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    {/* Drawer with slide-down */}
                    <div className="fixed top-14 sm:top-16 left-0 right-0 bg-white dark:bg-neutral-900 border-b border-slate-300 dark:border-neutral-800 shadow-xl z-40 lg:hidden animate-in slide-in-from-top-2 duration-300">
                        <div className="px-4 sm:px-6 py-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
                            {/* Mobile Search - First Item (only show if not visible in header) */}
                            <div className="mb-3 md:hidden">
                                <NavbarSearch />
                            </div>
                            
                            <MobileNavLink href="/" active={isActive("/")} onClick={() => setIsMobileMenuOpen(false)}>
                                Home
                            </MobileNavLink>
                            <MobileNavLink href="/players" active={isActive("/players")} onClick={() => setIsMobileMenuOpen(false)}>
                                Players
                            </MobileNavLink>
                            <MobileNavLink href="/clubs" active={isActive("/clubs")} onClick={() => setIsMobileMenuOpen(false)}>
                                Clubs
                            </MobileNavLink>
                            <MobileNavLink href="/leagues" active={isActive("/leagues")} onClick={() => setIsMobileMenuOpen(false)}>
                                Leagues
                            </MobileNavLink>
                            <MobileNavLink href="/design-system" active={isActive("/design-system")} onClick={() => setIsMobileMenuOpen(false)}>
                                Showcase
                            </MobileNavLink>
                        </div>
                    </div>
                </>
            )}
        </nav>
    );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
    return (
        <Link
            href={href}
            className={`
                px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200
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

function MobileNavLink({ href, children, active, onClick }: { href: string; children: React.ReactNode; active?: boolean; onClick?: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`
                block px-4 py-3 rounded-md text-base font-semibold transition-colors duration-200
                ${active
                    ? "text-slate-900 dark:text-neutral-100 bg-slate-100 dark:bg-neutral-800"
                    : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-100 hover:bg-slate-50 dark:hover:bg-neutral-800"
                }
            `}
        >
            {children}
        </Link>
    );
}
