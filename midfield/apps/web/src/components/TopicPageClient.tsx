"use client";

import { useState } from "react";
import { PostComposer } from "@/components/PostComposer";
import { PostList } from "@/components/PostList";
import { EntityHeader } from "@/components/EntityHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Users, Trophy, Calendar, BarChart3, Minus, Plus, Activity, Star, Info, FileQuestion } from "lucide-react";
import Link from "next/link";
import { PLAYER_IMAGE_STYLE } from "@/components/FeaturedPlayers";

interface TopicPageClientProps {
    topic: any;
    squad: any[];
    groupedSquad: Record<string, any[]>;
    playerClub?: any;
}

const positionOrder = ["Goalkeepers", "Defenders", "Midfielders", "Forwards", "Other"];

// Position info with colors - matches FeaturedPlayers
const getPositionInfo = (pos: string) => {
    const normalized = pos?.toLowerCase().trim() || "";
    // Goalkeepers - Orange
    if (normalized.includes("goalkeeper") || normalized === "gk")
        return { abbr: "GK", color: "bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900" };
    // Defenders - Yellow
    if (normalized.includes("back") || normalized.includes("defender") || normalized === "cb" || normalized === "lb" || normalized === "rb")
        return { abbr: normalized.includes("left") ? "LB" : normalized.includes("right") ? "RB" : "CB", color: "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900" };
    // Midfielders - Green
    if (normalized.includes("midfield") || normalized === "cm" || normalized === "cdm" || normalized === "cam")
        return { abbr: normalized.includes("defensive") ? "CDM" : normalized.includes("attacking") ? "CAM" : "CM", color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" };
    // Attackers - Blue
    if (normalized.includes("wing") || normalized.includes("forward") || normalized.includes("striker") || normalized === "st" || normalized === "lw" || normalized === "rw")
        return { abbr: normalized.includes("left") ? "LW" : normalized.includes("right") ? "RW" : "ST", color: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900" };
    return { abbr: pos?.substring(0, 3).toUpperCase() || "MID", color: "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400" };
};

export function TopicPageClient({ topic, squad, groupedSquad, playerClub }: TopicPageClientProps) {
    const isClub = topic.type === 'club';
    const isPlayer = topic.type === 'player';
    const metadata = topic.metadata as any;
    // Players section always open for clubs
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(isClub ? ["players"] : ["stats"]));

    const toggleSection = (section: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(section)) next.delete(section);
            else next.add(section);
            return next;
        });
    };

    // Define sections based on entity type
    const sections = isClub
        ? [
            { id: "players", title: "Players", icon: Users, count: squad.length },
            { id: "fixtures", title: "Fixtures", icon: Calendar },
            { id: "about", title: "About", icon: Info },
        ]
        : [
            { id: "stats", title: "Statistics", icon: BarChart3 },
            { id: "ratings", title: "FC26 Ratings", icon: Star },
            { id: "about", title: "About", icon: Info },
        ];

    // Build club metadata from playerClub relationship
    const clubData = playerClub ? {
        clubName: playerClub.title,
        clubSlug: playerClub.slug,
        clubBadgeUrl: playerClub.metadata?.badge_url,
        league: playerClub.metadata?.league,
        leagueSlug: playerClub.metadata?.league?.toLowerCase().replace(/\s+/g, '-'),
    } : {};

    // Empty state placeholder
    const EmptyState = ({ message }: { message: string }) => (
        <div className="flex flex-col items-center justify-center py-6 text-center">
            <FileQuestion className="w-8 h-8 text-slate-300 dark:text-neutral-600 mb-2" />
            <p className="text-sm text-slate-400 dark:text-neutral-500">{message}</p>
        </div>
    );

    // Mini Player Card - Compact version with position colors
    const PlayerMiniCard = ({ player }: { player: any }) => {
        const rating = player.metadata?.rating;
        const position = player.metadata?.position || "";
        const posInfo = getPositionInfo(position);

        return (
            <Link href={`/topic/${player.slug}`}>
                <Card variant="interactive" className="p-2 flex items-center gap-2.5 group">
                    {/* Player Photo - Compact (w-9 h-9) */}
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 overflow-hidden shrink-0">
                        {player.metadata?.photo_url ? (
                            <img
                                src={player.metadata.photo_url}
                                alt={player.title}
                                className={PLAYER_IMAGE_STYLE.className}
                                style={PLAYER_IMAGE_STYLE.style}
                            />
                        ) : (
                            <span className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                                {player.title?.charAt(0)}
                            </span>
                        )}
                    </div>

                    {/* Player Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                            {player.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            {/* Rating Badge */}
                            {rating && (
                                <div className="px-1.5 py-0.5 bg-slate-900 dark:bg-slate-100 rounded text-[10px] font-bold text-white dark:text-neutral-900">
                                    {rating}
                                </div>
                            )}
                            {/* Position Badge WITH COLOR */}
                            {position && (
                                <Badge variant="secondary" className={`text-[9px] ${posInfo.color}`}>
                                    {posInfo.abbr}
                                </Badge>
                            )}
                        </div>
                    </div>
                </Card>
            </Link>
        );
    };

    // Custom scrollbar styles
    const scrollStyles = `
        .squad-scroll::-webkit-scrollbar {
            width: 4px;
        }
        .squad-scroll::-webkit-scrollbar-track {
            background: transparent;
        }
        .squad-scroll::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 2px;
        }
        .squad-scroll::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
        }
        @media (prefers-color-scheme: dark) {
            .squad-scroll::-webkit-scrollbar-thumb {
                background: #404040;
            }
            .squad-scroll::-webkit-scrollbar-thumb:hover {
                background: #525252;
            }
        }
    `;

    return (
        <div className="min-h-screen">
            <style>{scrollStyles}</style>

            {/* Header */}
            <EntityHeader
                title={topic.title}
                type={isClub ? "club" : "player"}
                imageUrl={metadata?.photo_url}
                badgeUrl={metadata?.badge_url}
                followerCount={topic.follower_count || 12500}
                metadata={{
                    position: metadata?.position,
                    rating: metadata?.rating,
                    nationality: metadata?.nationality,
                    age: metadata?.age,
                    height: metadata?.height,
                    kitNumber: metadata?.kit_number,
                    league: isClub ? metadata?.league : clubData.league,
                    leagueSlug: clubData.leagueSlug,
                    stadium: metadata?.stadium,
                    founded: metadata?.founded,
                    ...clubData,
                }}
                backHref="/"
            />

            {/* Main Content */}
            <div className="flex gap-6">
                {/* Sidebar */}
                <aside className="hidden lg:block shrink-0" style={{ width: '340px' }}>
                    <div className="sticky top-4">
                        {/* Section Title */}
                        <h3 className="text-sm font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-3 px-1">
                            {isClub ? "Club Info" : "Player Info"}
                        </h3>

                        <div className="space-y-3">
                            {sections.map((section) => {
                                const Icon = section.icon;
                                const isExpanded = expandedSections.has(section.id);

                                return (
                                    <Card key={section.id} className="overflow-hidden">
                                        {/* Section Header */}
                                        <button
                                            onClick={() => toggleSection(section.id)}
                                            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                <span className="font-bold text-slate-900 dark:text-neutral-100">
                                                    {section.title}
                                                </span>
                                                {section.count !== undefined && (
                                                    <Badge variant="secondary" className="text-[10px]">{section.count}</Badge>
                                                )}
                                            </div>
                                            {/* + / - icon animation */}
                                            <div className="relative w-5 h-5 flex items-center justify-center">
                                                <Plus
                                                    className={`absolute w-5 h-5 text-slate-400 transition-all duration-150 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 ${isExpanded ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`}
                                                />
                                                <Minus
                                                    className={`absolute w-5 h-5 text-slate-400 transition-all duration-150 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 ${isExpanded ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}
                                                />
                                            </div>
                                        </button>

                                        {/* Section Content */}
                                        {isExpanded && (
                                            <div className="px-4 pb-4 border-t border-slate-100 dark:border-neutral-800">
                                                {/* Players Section (Clubs) */}
                                                {section.id === "players" && isClub && (
                                                    squad.length > 0 ? (
                                                        <div
                                                            className="squad-scroll pt-4 space-y-4 overflow-y-auto"
                                                            style={{ maxHeight: '480px' }}
                                                        >
                                                            {positionOrder.map((pos) => {
                                                                const players = groupedSquad[pos];
                                                                if (!players || players.length === 0) return null;

                                                                return (
                                                                    <div key={pos}>
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
                                                                                {pos}
                                                                            </span>
                                                                            <span className="text-[10px] text-slate-300 dark:text-neutral-600">
                                                                                {players.length}
                                                                            </span>
                                                                        </div>
                                                                        <div className="space-y-2.5">
                                                                            {players.map((player) => (
                                                                                <PlayerMiniCard key={player.id} player={player} />
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <EmptyState message="No squad data available" />
                                                    )
                                                )}

                                                {/* Statistics Section (Players) */}
                                                {section.id === "stats" && isPlayer && (
                                                    <div className="pt-4 space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-slate-500 dark:text-neutral-400">Goals (Season)</span>
                                                            <span className="font-bold text-slate-900 dark:text-neutral-100">12</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-slate-500 dark:text-neutral-400">Assists</span>
                                                            <span className="font-bold text-slate-900 dark:text-neutral-100">8</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-slate-500 dark:text-neutral-400">Minutes Played</span>
                                                            <span className="font-bold text-slate-900 dark:text-neutral-100">1,847</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-slate-500 dark:text-neutral-400">Pass Accuracy</span>
                                                            <span className="font-bold text-slate-900 dark:text-neutral-100">87%</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* FC26 Ratings Section (Players) */}
                                                {section.id === "ratings" && isPlayer && (
                                                    metadata?.rating ? (
                                                        <div className="pt-4 space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-slate-500 dark:text-neutral-400">Overall Rating</span>
                                                                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{metadata.rating}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-slate-500 dark:text-neutral-400">Pace</span>
                                                                <span className="font-bold text-slate-900 dark:text-neutral-100">89</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-slate-500 dark:text-neutral-400">Shooting</span>
                                                                <span className="font-bold text-slate-900 dark:text-neutral-100">85</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-slate-500 dark:text-neutral-400">Passing</span>
                                                                <span className="font-bold text-slate-900 dark:text-neutral-100">82</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-slate-500 dark:text-neutral-400">Dribbling</span>
                                                                <span className="font-bold text-slate-900 dark:text-neutral-100">91</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <EmptyState message="FC26 ratings not available" />
                                                    )
                                                )}

                                                {/* Fixtures Section (Clubs) */}
                                                {section.id === "fixtures" && isClub && (
                                                    <EmptyState message="Fixture data coming soon" />
                                                )}

                                                {/* About Section */}
                                                {section.id === "about" && (
                                                    <div className="pt-4">
                                                        <p className="text-sm text-slate-500 dark:text-neutral-400 leading-relaxed">
                                                            {isClub
                                                                ? `${topic.title} is a professional football club competing in ${metadata?.league || 'top-flight football'}.`
                                                                : `${topic.title} is a professional footballer currently playing as a ${metadata?.position || 'player'}${playerClub ? ` for ${playerClub.title}` : ''}.`
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </aside>

                {/* Discussion */}
                <main className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-5">
                        <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-100">
                            Discussion
                        </h2>
                    </div>

                    <PostComposer topicSlug={topic.slug} />

                    <div className="mt-6">
                        <PostList topicSlug={topic.slug} />
                    </div>
                </main>
            </div>
        </div>
    );
}
