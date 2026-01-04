import Link from "next/link";

export function Footer({ className }: { className?: string }) {
    return (
        <footer className={`w-full border-t border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 mt-auto ${className || ''}`}>
            <div className="w-full max-w-[1600px] mx-auto px-10 sm:px-16 lg:px-24 py-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Copyright */}
                    <div className="text-sm text-slate-500 dark:text-neutral-400">
                        © {new Date().getFullYear()} Midfield. All rights reserved.
                    </div>

                    {/* Links */}
                    <nav className="flex items-center gap-6">
                        <Link
                            href="/about"
                            prefetch={false}
                            className="text-sm text-slate-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                            About
                        </Link>
                        <Link
                            href="/privacy-static.html"
                            prefetch={false}
                            className="text-sm text-slate-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="/terms"
                            prefetch={false}
                            className="text-sm text-slate-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                            Terms
                        </Link>
                        <Link
                            href="/contact"
                            prefetch={false}
                            className="text-sm text-slate-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                            Contact
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
