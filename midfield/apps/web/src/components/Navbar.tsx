import Link from "next/link";
import { Search, User, Zap } from "lucide-react";

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full bg-[#121212] text-white border-b border-white/10">
            <div className="w-full max-w-[1600px] mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Left: Brand + Nav */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded bg-white text-black flex items-center justify-center font-bold">
                            <Zap className="w-5 h-5 fill-current" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Midfield</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
                        <Link href="/" className="text-white hover:text-white transition-colors">Discovery</Link>
                        <Link href="/clubs" className="hover:text-white transition-colors">Clubs</Link>
                        <Link href="/matches" className="hover:text-white transition-colors">Matches</Link>
                        <Link href="/transfers" className="hover:text-white transition-colors">Transfers</Link>
                    </div>
                </div>

                {/* Right: Search + Profile */}
                <div className="flex items-center gap-4">
                    <SearchInput />

                    <Link href="/auth" className="flex items-center gap-2 pl-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 p-0.5">
                            <div className="w-full h-full rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </nav>
    );
}

// Simple internal client component for search if we don't want a new file yet, 
// but Next.js requires 'use client' at top of file for hooks. 
// So I MUST import it.
import { SearchInput } from "./SearchInput";
