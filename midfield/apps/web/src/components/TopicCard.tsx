import Link from "next/link";
import { MessageSquare, ArrowRight, Activity, Users, Shield } from "lucide-react";

export function TopicCard({ topic }: { topic: any }) {
    const isClub = topic.type === 'club';
    const rating = topic.metadata?.rating || topic.rating || "88";
    const imageUrl = topic.metadata?.avatar_url || topic.metadata?.badge_url;

    // Position Color Helper
    const getPositionColor = (pos: string) => {
        const p = pos?.toLowerCase() || "";
        if (p.includes("goalkeeper")) return "bg-yellow-100 text-yellow-800";
        if (p.includes("defen") || p.includes("back")) return "bg-blue-100 text-blue-800";
        if (p.includes("midfield")) return "bg-green-100 text-green-800";
        if (p.includes("forward") || p.includes("wing") || p.includes("striker")) return "bg-red-100 text-red-800";
        return "bg-slate-100 text-slate-700";
    };

    const positionColor = !isClub ? getPositionColor(topic.metadata?.position) : "";

    return (
        <Link
            href={`/topic/${topic.slug}`}
            className="group relative flex flex-col bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-5 transition-all duration-300 hover:border-green-500 dark:hover:border-green-400 overflow-hidden h-[240px] cursor-pointer"
        >
            {/* Club Artistic Watermark */}
            {isClub && imageUrl && (
                <div className="absolute -right-8 -bottom-8 w-48 h-48 opacity-[0.04] group-hover:opacity-[0.1] transition-opacity duration-500 grayscale pointer-events-none select-none rotate-12">
                    <img src={imageUrl} alt="" className="w-full h-full object-contain" />
                </div>
            )}

            {/* Top Row: Avatar & Club Badge & Arrow */}
            <div className="flex justify-between items-start mb-3 relative z-10">
                <div className="flex items-start gap-3">
                    {/* Avatar Container */}
                    <div className="relative">
                        <div className={`
                            relative border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800 flex items-center justify-center overflow-hidden shadow-sm
                            ${isClub ? 'w-16 h-16 rounded-lg p-2' : 'w-16 h-16 rounded-full'}
                        `}>
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={topic.title}
                                    className={`w-full h-full ${isClub ? 'object-contain' : 'object-cover object-top origin-top scale-[1.2]'}`}
                                />
                            ) : (
                                <span className="text-2xl opacity-20">👤</span>
                            )}
                        </div>

                        {/* Rating Badge - Overlapping Cutout Style */}
                        {!isClub && (
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-slate-900 dark:bg-slate-100 rounded-full flex items-center justify-center ring-[3px] ring-white dark:ring-neutral-900">
                                <span className="text-[11px] font-bold text-white dark:text-neutral-900">{rating}</span>
                            </div>
                        )}
                    </div>

                    {/* Club Badge (Moved per request) */}
                    {!isClub && topic.metadata?.club_slug && (
                        <div className="flex flex-col gap-0.5 mt-1">
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg">
                                <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-neutral-700 shrink-0 overflow-hidden">
                                    {/* Mock Icon */}
                                    <Shield className="w-full h-full p-0.5 text-white bg-slate-400 dark:bg-neutral-600" />
                                </div>
                                <span className="text-[11px] font-black text-slate-700 dark:text-neutral-300 uppercase tracking-tight">
                                    {topic.metadata.club_name || "Club"}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Arrow */}
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-neutral-800 flex items-center justify-center text-slate-300 dark:text-neutral-600 group-hover:bg-green-50 dark:group-hover:bg-green-950/30 group-hover:text-green-600 dark:group-hover:text-green-400 transition-all shrink-0">
                    <ArrowRight className="w-4 h-4" />
                </div>
            </div>

            {/* Middle: Info */}
            <div className="relative z-10 flex-1 flex flex-col justify-center">
                <h3 className="text-[20px] font-extrabold text-slate-900 dark:text-neutral-100 leading-[1.1] mb-2 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors line-clamp-2">
                    {topic.title}
                </h3>

                <div className="flex flex-wrap gap-2 items-center">
                    {isClub ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400">
                            {topic.metadata?.leagues?.[0] || "League"}
                        </span>
                    ) : (
                        <>
                            {topic.metadata?.position && (
                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wide border border-transparent ${positionColor}`}>
                                    {topic.metadata.position}
                                </span>
                            )}

                            {/* Mock Age */}
                            <span className="text-[11px] font-bold text-slate-400 dark:text-neutral-500 border border-slate-200 dark:border-neutral-700 rounded-md px-1.5 py-0.5">
                                23 yrs
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Footer Metrics */}
            <div className="mt-auto pt-3 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-neutral-400 text-[11px] font-semibold">
                    <Users className="w-3.5 h-3.5" />
                    <span>2.4k</span>
                </div>

                <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-[11px] font-bold">
                    <Activity className="w-3.5 h-3.5" />
                    <span>High Activity</span>
                </div>
            </div>
        </Link>
    );
}
