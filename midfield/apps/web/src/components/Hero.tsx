import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-white border border-border shadow-sm p-8 md:p-12 mb-10">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-green-50 to-transparent opacity-50" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-100 rounded-full blur-3xl opacity-40" />

            <div className="relative max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100/80 text-green-700 text-xs font-bold uppercase tracking-wide mb-6">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Beta Live
                </div>

                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 font-display">
                    The intelligent home for <br />
                    <span className="text-green-600">football discussion.</span>
                </h1>

                <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                    Debate players, analyze stats, and connect with real fans without the noise.
                    Structured topics, data-driven context, and toxic-free zones.
                </p>

                <div className="flex flex-wrap gap-4">
                    <Link href="/auth" className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/20">
                        Join the Debate
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link href="/about" className="px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                        How it works
                    </Link>
                </div>
            </div>
        </div>
    );
}
