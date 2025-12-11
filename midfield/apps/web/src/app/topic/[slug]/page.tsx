import { TopicDescription } from "@/components/TopicDescription";
import { PostComposer } from "@/components/PostComposer";
import { getTopicBySlug, getPlayersByClub } from "@midfield/logic/src/topics";
import { PostList } from "@/components/PostList";
import { TopicCard } from "@/components/TopicCard";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, Globe, Twitter, Instagram, Users, Activity, ChevronLeft } from "lucide-react";

export default async function TopicPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const topic = await getTopicBySlug(slug);

    if (!topic) {
        return notFound();
    }

    const isClub = topic.type === 'club';
    let squad: any[] = [];
    let groupedSquad: Record<string, any[]> = {};

    if (isClub) {
        squad = await getPlayersByClub(topic.id);

        // Group players by position
        groupedSquad = squad.reduce((acc, player) => {
            let pos = player.metadata?.position || "Other";
            if (pos.includes("Goalkeeper")) pos = "Goalkeepers";
            else if (pos.includes("Back") || pos.includes("Defender")) pos = "Defenders";
            else if (pos.includes("Midfield")) pos = "Midfielders";
            else if (pos.includes("Forward") || pos.includes("Wing") || pos.includes("Striker")) pos = "Forwards";

            if (!acc[pos]) acc[pos] = [];
            acc[pos].push(player);
            return acc;
        }, {} as Record<string, any[]>);
    }

    // Sort order for positions
    const positionOrder = ["Goalkeepers", "Defenders", "Midfielders", "Forwards", "Other"];

    return (
        <div className="w-full max-w-[1400px] mx-auto pb-24">
            {/* Back Nav */}
            <div className="py-6">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-neutral-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Home
                </Link>
            </div>

            {/* Hero Card */}
            <div className="relative mb-12 rounded-[2rem] overflow-hidden bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xl dark:shadow-green-900/10">

                {/* Banner / Cover */}
                <div className="relative h-64 md:h-96 w-full bg-slate-900 group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 z-10" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-10" />

                    {topic.metadata?.banner && (
                        <img
                            src={topic.metadata.banner}
                            alt="Banner"
                            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000 ease-out"
                        />
                    )}

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 z-20 flex flex-col md:flex-row md:items-end gap-8">
                        {/* Avatar */}
                        <div className={`relative shrink-0 p-1 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 ${isClub ? 'w-32 h-32 md:w-48 md:h-48' : 'w-32 h-32 md:w-40 md:h-40'}`}>
                            <div className="w-full h-full bg-white rounded-[20px] overflow-hidden p-4 md:p-6 flex items-center justify-center">
                                <img
                                    src={isClub ? topic.metadata?.badge_url : topic.metadata?.avatar_url}
                                    alt={topic.title}
                                    className={`w-full h-full ${isClub ? 'object-contain' : 'object-cover'}`}
                                />
                            </div>
                        </div>

                        {/* Text Block */}
                        <div className="flex-1 pb-2">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border shadow-sm backdrop-blur-sm ${isClub ? "bg-green-500/90 border-green-400 text-white" : "bg-indigo-500/90 border-indigo-400 text-white"
                                    }`}>
                                    {topic.type}
                                </span>
                                {topic.metadata?.leagues?.[0] && (
                                    <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-white/10 border border-white/20 text-white backdrop-blur-sm">
                                        {topic.metadata.leagues[0]}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-7xl font-black tracking-tight text-white drop-shadow-lg mb-4 md:mb-6 leading-none">
                                {topic.title}
                            </h1>

                            {/* Metadata Row */}
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-200">
                                {isClub ? (
                                    <>
                                        {topic.metadata?.stadium && (
                                            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md hover:bg-white/20 transition-colors">
                                                <MapPin className="w-4 h-4 text-green-400" />
                                                {topic.metadata.stadium}
                                            </div>
                                        )}
                                        {topic.metadata?.formed_year && (
                                            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
                                                <Calendar className="w-4 h-4 text-green-400" />
                                                Est. {topic.metadata.formed_year}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
                                            <Activity className="w-4 h-4 text-green-400" />
                                            {topic.metadata?.position}
                                        </div>
                                        {topic.metadata?.club_slug && (
                                            <Link href={`/topic/${topic.metadata.club_slug}`} className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md hover:bg-white/20 transition-colors">
                                                <Users className="w-4 h-4 text-green-400" />
                                                {topic.metadata.club_name}
                                            </Link>
                                        )}
                                    </>
                                )}

                                {/* Socials (if club) */}
                                {isClub && topic.metadata?.socials && (
                                    <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/20 opacity-80 hover:opacity-100 transition-opacity">
                                        {topic.metadata.socials.website && <a href={`https://${topic.metadata.socials.website}`} target="_blank" className="hover:text-green-400 transition-colors"><Globe className="w-5 h-5" /></a>}
                                        {topic.metadata.socials.twitter && <a href={`https://${topic.metadata.socials.twitter}`} target="_blank" className="hover:text-green-400 transition-colors"><Twitter className="w-5 h-5" /></a>}
                                        {topic.metadata.socials.instagram && <a href={`https://${topic.metadata.socials.instagram}`} target="_blank" className="hover:text-green-400 transition-colors"><Instagram className="w-5 h-5" /></a>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description & Details Body */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-10 bg-slate-50/50 dark:bg-neutral-900/50">
                    <div className="lg:col-span-2">
                        <TopicDescription description={topic.description} />
                    </div>
                    <div className="space-y-4">
                        {/* Stats or other widgets can go here later */}
                        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-slate-200 dark:border-neutral-700 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wide mb-4">Community Stats</h3>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-600 dark:text-neutral-400 font-medium">Followers</span>
                                <span className="text-slate-900 dark:text-neutral-100 font-bold">12.5k</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600 dark:text-neutral-400 font-medium">Discussion Rank</span>
                                <span className="text-green-600 dark:text-green-400 font-bold">#3 Trending</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Squad List (Grouped) */}
            {isClub && squad.length > 0 && (
                <div className="mb-12 space-y-10">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-neutral-800 pb-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-neutral-100">
                            <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                            Current Squad
                        </h2>
                        <span className="text-sm font-medium text-slate-500 dark:text-neutral-400">{squad.length} Players</span>
                    </div>

                    {positionOrder.map((pos) => {
                        const players = groupedSquad[pos];
                        if (!players || players.length === 0) return null;

                        return (
                            <div key={pos}>
                                <h3 className="text-lg font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-4 pl-1">{pos}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {players.map((player) => (
                                        <TopicCard key={player.id} topic={player} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="grid grid-cols-1 gap-8">
                <div className="bg-slate-50 dark:bg-neutral-900/50 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-neutral-800">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-neutral-100 mb-6">
                        Discussion Board
                    </h2>
                    <PostComposer topicSlug={slug} />
                    <div className="mt-8">
                        <PostList topicSlug={slug} />
                    </div>
                </div>
            </div>
        </div>
    );
}
