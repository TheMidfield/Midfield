import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Hero() {
    return (
        <div className="relative w-full overflow-hidden rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-10 md:p-16 lg:p-20 mb-12">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-50 dark:from-emerald-950/30 to-transparent opacity-50" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-100 dark:bg-emerald-900/20 rounded-full blur-3xl opacity-40" />

            <div className="relative w-full" style={{ maxWidth: '900px', minWidth: '320px' }}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wide mb-8">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                    Beta Live
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-neutral-100 mb-8 font-display leading-tight">
                    The intelligent home for <br />
                    <span className="text-emerald-600 dark:text-emerald-400">football discussion.</span>
                </h1>

                <p className="text-lg md:text-xl text-slate-600 dark:text-neutral-400 mb-10 leading-relaxed" style={{ maxWidth: '700px' }}>
                    Debate players, analyze stats, and connect with real fans without the noise.
                    Structured topics, data-driven context, and toxic-free zones.
                </p>

                <div className="flex flex-wrap gap-4">
                    <Link href="/auth">
                        <Button size="lg" icon={ArrowRight} iconPosition="right">
                            Join the Debate
                        </Button>
                    </Link>
                    <Link href="/about">
                        <Button variant="outline" size="lg">
                            How it works
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
