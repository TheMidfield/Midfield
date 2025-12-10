import Link from "next/link";
import { MessageSquare, ArrowRight, Activity, Users } from "lucide-react";

export function TopicCard({ topic }: { topic: any }) {
    const isClub = topic.type === 'club';
    const rating = topic.metadata?.rating || topic.rating || "88";
    const imageUrl = topic.metadata?.avatar_url || topic.metadata?.badge_url;

    // Subtitle logic
    const subtitle = isClub
        ? (topic.metadata?.leagues?.[0] || topic.description?.slice(0, 30) || "Football Club")
        : (topic.metadata?.club_name || topic.metadata?.position || "Player");

    return (
        <Link
            href={`/topic/${topic.slug}`}
            className="group relative flex flex-col bg-white border border-slate-200 rounded-[24px] p-6 transition-colors duration-300 hover:border-green-500 overflow-hidden"
        >
            {/* Club Artistic Watermark */}
            {isClub && imageUrl && (
                <div className="absolute -right-6 -bottom-6 w-48 h-48 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 grayscale pointer-events-none select-none">
                    <img src={imageUrl} alt="" className="w-full h-full object-contain" />
                </div>
            )}

            {/* Header Row */}
            <div className="flex justify-between items-start mb-5 relative z-10">
                <div className="flex gap-4 items-center">
                    {/* Image Container: Square for Clubs, Circle for Players */}
                    <div className={`
                        relative shrink-0 border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden
                        ${isClub ? 'w-16 h-16 rounded-2xl p-2' : 'w-16 h-16 rounded-full'}
                    `}>
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={topic.title}
                                className={`w-full h-full ${isClub ? 'object-contain' : 'object-cover'}`}
                            />
                        ) : (
                            <span className="text-2xl opacity-20">👤</span>
                        )}

                        {/* Rating Badge (Players Only usually, but let's keep for consistency or remove for clubs if user prefers cleaner) */}
                        {!isClub && (
                            <div className="absolute bottom-0 right-0 translate-x-1 translate-y-1 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded border-2 border-white">
                                {rating}
                            </div>
                        )}
                    </div>

                    {/* Simple Text for Header (Optional, mostly for wide cards, but here we stack) */}
                </div>

                {/* Arrow Action */}
                <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:border-green-500 group-hover:text-green-600 transition-all bg-white">
                    <ArrowRight className="w-4 h-4" />
                </div>
            </div>

            {/* Main Content */}
            <div className="mb-8 relative z-10">
                <h3 className="text-lg font-extrabold text-slate-900 leading-tight mb-1 group-hover:text-green-700 transition-colors">
                    {topic.title}
                </h3>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {isClub ? (
                        <>
                            <span className="text-slate-500">{subtitle}</span>
                        </>
                    ) : (
                        <>
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{subtitle}</span>
                            {topic.metadata?.position && <span className="text-slate-300">• {topic.metadata.position}</span>}
                        </>
                    )}
                </div>
            </div>

            {/* Footer Metrics */}
            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                    <Users className="w-3.5 h-3.5" />
                    <span>2.4k Members</span>
                </div>

                <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Active Now</span>
                </div>
            </div>
        </Link>
    );
}
