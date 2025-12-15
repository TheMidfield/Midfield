"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User as UserIcon, Terminal } from "lucide-react";
import { ThemeToggle } from "./ui/ThemeToggle";
import { Button } from "./ui/Button";
import { IconButton } from "./ui/IconButton";
import { NavbarSearch } from "./NavbarSearch";
import { Logo } from "./Logo";
import { useEffect, useState } from "react";

export function Navbar() {
    const pathname = usePathname();
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
            <div className="w-full max-w-[1600px] mx-auto flex h-16 items-center justify-between px-10 sm:px-16 lg:px-24">

                {/* Left: Brand + Nav */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-10 h-10 transition-transform group-hover:scale-105">
                            <Logo className="w-full h-full" />
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-neutral-100">Midfield</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        <NavLink href="/" active={isActive("/")}>Home</NavLink>
                        <NavLink href="/players" active={isActive("/players")}>Players</NavLink>
                        <NavLink href="/clubs" active={isActive("/clubs")}>Clubs</NavLink>
                        <NavLink href="/leagues" active={isActive("/leagues")}>Leagues</NavLink>
                    </div>
                </div>

                {/* Right: Search + Theme + Profile */}
                <div className="flex items-center gap-3">
                    <Link href="/design-system" className="hidden lg:block">
                        <Button variant="ghost" size="sm" icon={Terminal}>
                            Showcase
                        </Button>
                    </Link>

                    <NavbarSearch />

                    <ThemeToggle />

                    <Link href="/profile">
                        {!isLoading && userAvatar ? (
                            <div className="h-10 w-10 rounded-md overflow-hidden border-2 border-slate-200 dark:border-neutral-700 hover:border-slate-400 dark:hover:border-neutral-600 transition-all cursor-pointer">
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
