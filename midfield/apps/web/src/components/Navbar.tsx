"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { User as UserIcon, Terminal, Home, Users, Shield, Trophy } from "lucide-react";
import { ThemeToggle } from "./ui/ThemeToggle";
import { Button } from "./ui/Button";
import { IconButton } from "./ui/IconButton";
import { NavbarSearch } from "./NavbarSearch";
import { NotificationBell } from "./notifications/NotificationsPopover";
import { useEffect, useState } from "react";
import { useOnboarding } from "./OnboardingProvider";
import { useSearch } from "@/context/SearchContext";
import { Logo } from "@/components/Logo";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/DropdownMenu";
import { simulateNotification } from "@/app/actions/dev";

export function Navbar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { closeSearch } = useSearch();
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        // Fetch user profile for avatar
        async function loadUserProfile() {
            try {
                const response = await fetch('/api/user-profile');
                if (response.ok) {
                    const data = await response.json();
                    setUserAvatar(data.avatar_url);
                    setIsAuthenticated(data.isAuthenticated || false);
                }
            } catch (error) {
                console.error('Failed to load user profile:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        }

        loadUserProfile();

        const handleAvatarUpdate = (event: CustomEvent) => {
            setUserAvatar(event.detail.avatarUrl);
        };

        window.addEventListener('avatar-updated', handleAvatarUpdate as EventListener);
        return () => window.removeEventListener('avatar-updated', handleAvatarUpdate as EventListener);
    }, []);

    // Handle Navigation Loading State
    useEffect(() => {
        setIsNavigating(false);
        setIsMobileMenuOpen(false);
    }, [pathname, searchParams]);

    useEffect(() => {
        const handleAnchorClick = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest('a');
            if (target && target.href && !target.target && target.href.startsWith(window.location.origin)) {
                // Determine if it's a navigation to a different path
                const targetUrl = new URL(target.href);
                if (targetUrl.pathname !== window.location.pathname || targetUrl.search !== window.location.search) {
                    setIsNavigating(true);
                }
            }
        };

        document.addEventListener('click', handleAnchorClick);
        return () => document.removeEventListener('click', handleAnchorClick);
    }, []);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    const isActive = (path: string) => {
        if (path === "/") return pathname === "/";
        return pathname?.startsWith(path);
    };

    const handleDevAction = async (type: 'reply' | 'upvote' | 'badge_received' | 'system_welcome') => {
        await simulateNotification(type);
    };

    const { isOnboardingOpen } = useOnboarding();

    return (
        <>
            <nav
                className={`fixed top-0 z-50 w-full bg-white dark:bg-neutral-900 lg:bg-white/95 lg:dark:bg-neutral-900/95 lg:backdrop-blur-md border-b transition-all duration-500 pt-[env(safe-area-inset-top)] ${isOnboardingOpen ? 'border-transparent' : 'border-slate-300 dark:border-neutral-800'
                    }`}
            >
                {/* Loading Bar */}
                {isNavigating && (
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-100 dark:bg-neutral-800 overflow-hidden z-50">
                        <div className="h-full bg-emerald-500 animate-loading-bar" />
                    </div>
                )}

                <div className="relative w-full max-w-[1600px] mx-auto flex h-[62px] sm:h-16 items-center px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24">
                    {/* Left: Brand + Nav */}
                    <div
                        className={`flex items-center min-w-0 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOnboardingOpen
                            ? "absolute left-1/2 -translate-x-1/2 justify-center gap-0"
                            : "relative left-0 translate-x-0 justify-start gap-3 sm:gap-4 md:gap-6 lg:gap-8"
                            }`}
                        style={{ zIndex: 60 }}
                    >
                        <Link href="/" className="flex items-center gap-2.5 shrink-0 group active:scale-95 lg:active:scale-100 transition-transform">
                            <Logo className="h-[34px] w-[34px] sm:h-8 sm:w-8 transition-transform duration-300 group-hover:scale-110" />
                            <span className="font-display font-light text-xl sm:text-xl md:text-2xl tracking-tight text-slate-900 dark:text-neutral-100">
                                Midfield
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className={`hidden lg:flex items-center gap-1 transition-all duration-500 ${isOnboardingOpen ? 'opacity-0 w-0 overflow-hidden pointer-events-none' : 'opacity-100 w-auto'}`}>
                            <NavLink href="/" active={isActive("/")} onClick={closeSearch}>Home</NavLink>
                            <NavLink href="/players" active={isActive("/players")} onClick={closeSearch}>Players</NavLink>
                            <NavLink href="/clubs" active={isActive("/clubs")} onClick={closeSearch}>Clubs</NavLink>
                            <NavLink href="/leagues" active={isActive("/leagues")} onClick={closeSearch}>Leagues</NavLink>
                        </div>
                    </div>

                    <div className="flex-1" />

                    {/* Right: Actions */}
                    <div className={`flex items-center gap-2 sm:gap-3 shrink-0 transition-all duration-500 ${isOnboardingOpen ? 'opacity-0 translate-x-4 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
                        <div className="hidden md:block">
                            <NavbarSearch />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="hidden xl:flex gap-2">
                                    <Terminal className="w-4 h-4" />
                                    <span>Dev</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" sideOffset={8} className="w-56">
                                <DropdownMenuItem asChild>
                                    <Link href="/design-system" className="cursor-pointer">Design System</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Simulate Notification</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleDevAction('system_welcome')}>
                                    Welcome / Signup
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDevAction('reply')}>
                                    New Reply
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDevAction('upvote')}>
                                    New Upvote
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDevAction('badge_received')}>
                                    Badge Award
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <ThemeToggle />

                        {!isLoading ? (
                            isAuthenticated ? (
                                <div className="flex items-center gap-1">
                                    <NotificationBell />
                                    <Link href="/profile" className="active:scale-95 lg:active:scale-100 transition-transform">
                                        {userAvatar ? (
                                            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-md overflow-hidden border-2 border-slate-200 dark:border-neutral-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer">
                                                <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-md bg-slate-100 dark:bg-neutral-800 border-2 border-slate-200 dark:border-neutral-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer flex items-center justify-center">
                                                <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 dark:text-neutral-500" />
                                            </div>
                                        )}
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link href="/auth/login" className="hidden md:block">
                                        <Button variant="ghost" size="sm">Log in</Button>
                                    </Link>
                                    <Link href="/auth/signup">
                                        <Button variant="default" size="sm" className="hidden sm:flex group">
                                            <span>Join Midfield</span>
                                            <svg className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </Button>
                                        <IconButton icon={UserIcon} variant="ghost" className="flex sm:hidden" />
                                    </Link>
                                </div>
                            )
                        ) : (
                            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-md bg-slate-100 dark:bg-neutral-800 animate-pulse" />
                        )}

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-md text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 active:scale-90 lg:active:scale-100 active:bg-slate-200 dark:active:bg-neutral-700 transition-all cursor-pointer"
                            aria-label="Menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span className={`w-5 h-0.5 bg-current rounded-full transition-all duration-300 ease-out ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                            <span className={`w-5 h-0.5 bg-current rounded-full transition-all duration-300 ease-out ${isMobileMenuOpen ? 'opacity-0 scale-0' : ''}`} />
                            <span className={`w-5 h-0.5 bg-current rounded-full transition-all duration-300 ease-out ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ease-out ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileMenuOpen(false)}
            >
                {/* Adjusted top offset for larger navbar */}
                <div className="absolute inset-0 top-[62px] sm:top-16 bg-black/50 backdrop-blur-sm pt-[env(safe-area-inset-top)]" />
            </div>

            {/* Mobile Menu Drawer */}
            <div
                className={`fixed top-[62px] sm:top-16 left-0 right-0 z-40 lg:hidden transition-all duration-300 ease-out transform-gpu rounded-b-xl border-b border-slate-200 dark:border-neutral-800 shadow-xl overflow-hidden pt-[env(safe-area-inset-top)] ${isMobileMenuOpen
                    ? 'translate-y-0 opacity-100'
                    : '-translate-y-4 opacity-0 pointer-events-none'
                    }`}
            >
                <div className="bg-white dark:bg-neutral-900">
                    <div className="px-4 py-4 space-y-1 max-h-[calc(100vh-5rem)] overflow-y-auto">
                        <div className="mb-4 md:hidden">
                            <NavbarSearch onSearchStart={() => setIsMobileMenuOpen(false)} />
                        </div>
                        <MobileNavLink href="/" icon={Home} active={isActive("/")} onClick={() => setIsMobileMenuOpen(false)}>Home</MobileNavLink>
                        <MobileNavLink href="/players" icon={Users} active={isActive("/players")} onClick={() => setIsMobileMenuOpen(false)}>Players</MobileNavLink>
                        <MobileNavLink href="/clubs" icon={Shield} active={isActive("/clubs")} onClick={() => setIsMobileMenuOpen(false)}>Clubs</MobileNavLink>
                        <MobileNavLink href="/leagues" icon={Trophy} active={isActive("/leagues")} onClick={() => setIsMobileMenuOpen(false)}>Leagues</MobileNavLink>
                        <div className="my-3 border-t border-slate-200 dark:border-neutral-800" />
                        <MobileNavLink href="/design-system" icon={Terminal} active={isActive("/design-system")} onClick={() => setIsMobileMenuOpen(false)}>Showcase</MobileNavLink>

                        {/* Mobile Dev Tools */}
                        <div className="px-4 py-2">
                            <p className="text-xs font-semibold text-slate-500 dark:text-neutral-500 uppercase tracking-wider mb-2">Dev Tools</p>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleDevAction('system_welcome')} className="text-xs h-8 justify-start">
                                    Simulate Welcome
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDevAction('reply')} className="text-xs h-8 justify-start">
                                    Simulate Reply
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDevAction('upvote')} className="text-xs h-8 justify-start">
                                    Simulate Upvote
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDevAction('badge_received')} className="text-xs h-8 justify-start">
                                    Simulate Badge
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function NavLink({ href, children, active, onClick }: { href: string; children: React.ReactNode; active?: boolean; onClick?: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`
                px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 lg:active:scale-100
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

function MobileNavLink({
    href,
    children,
    icon: Icon,
    active,
    onClick
}: {
    href: string;
    children: React.ReactNode;
    icon: React.ComponentType<{ className?: string }>;
    active?: boolean;
    onClick?: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`
                flex items-center gap-3 px-4 py-3.5 rounded-md text-[15px] font-semibold transition-all duration-200 active:scale-[0.97] lg:active:scale-100 active:bg-slate-200 dark:active:bg-neutral-800
                ${active
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30"
                    : "text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-neutral-100 hover:bg-slate-100 dark:hover:bg-neutral-800"
                }
            `}
        >
            <Icon className={`w-5 h-5 ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-neutral-500'}`} />
            {children}
        </Link>
    );
}
