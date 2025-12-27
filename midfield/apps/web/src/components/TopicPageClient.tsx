"use client";

import { useState, useRef } from "react";
import { TakeComposer } from "@/components/TakeComposer";
import { TakeFeed } from "@/components/TakeFeed";
import { EntityHeader } from "@/components/EntityHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Users, Trophy, Calendar, BarChart3, Minus, Plus, Activity, Star, Info, FileQuestion, MapPin, Hash } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { PLAYER_IMAGE_STYLE } from "@/components/FeaturedPlayers";
import { ClubFixtures } from "@/components/ClubFixtures";
import { LeagueTable } from "@/components/LeagueTable";
import { TopicDescription } from "@/components/TopicDescription";

interface TopicPageClientProps {
    topic: any;
    squad: any[];
    groupedSquad: Record<string, any[]>;
    playerClub?: any;
    leagueClubs?: any[];
    fixtures?: any[];
    standings?: any[];
    clubStanding?: any;
    posts?: any[];
    currentUser?: {
        id?: string;
        avatar_url: string | null;
        username: string | null;
    };
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

export function TopicPageClient({ topic, squad, groupedSquad, playerClub, leagueClubs = [], fixtures = [], standings = [], clubStanding, posts = [], currentUser }: TopicPageClientProps) {
    const isClub = topic.type === 'club';
    const isPlayer = topic.type === 'player';
    const isLeague = topic.type === 'league';
    const metadata = topic.metadata as any;
    // Clubs section always open for leagues, Players for clubs
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(isLeague ? ["clubs"] : isClub ? ["players"] : ["stats"]));

    // Ref to add posts to TakeFeed
    const addPostRef = useRef<((post: any) => void) | null>(null);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(section)) next.delete(section);
            else next.add(section);
            return next;
        });
    };

    // Handle new post - add to top of feed via ref
    const handlePostSuccess = (newPost: any) => {
        addPostRef.current?.(newPost);
    };

    // Define sections based on entity type
    const sections = isLeague
        ? [
            { id: "clubs", title: "Clubs", icon: Trophy, count: leagueClubs.length },
            { id: "standings", title: "Standings", icon: BarChart3 },
            { id: "about", title: "About", icon: Info },
        ]
        : isClub
            ? [
                { id: "players", title: "Players", icon: Users, count: squad.length },
                { id: "fixtures", title: "Fixtures", icon: Calendar, count: fixtures.length > 0 ? fixtures.filter(f => new Date(f.date) >= new Date()).length : undefined },
                { id: "about", title: "About", icon: Info },
            ]
            : [
                { id: "ratings", title: "FC26 Ratings", icon: Star },
                { id: "stats", title: "Statistics", icon: BarChart3 },
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
        const ratingRaw = player.fc26_data?.overall || player.rating;
        const rating = (ratingRaw && ratingRaw !== "?" && ratingRaw !== "0") ? ratingRaw : null;
        const imageUrl = player.metadata?.photo_url || player.metadata?.badge_url;
        const position = player.metadata?.position || "";
        const posInfo = getPositionInfo(position);

        return (
            <Link href={`/topic/${player.slug}`} className="block">
                <Card variant="interactive" className="p-2 sm:p-2.5 flex items-center gap-2.5 sm:gap-3 group hover:border-emerald-500/30 transition-all">
                    {/* Avatar */}
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0 bg-slate-100 dark:bg-neutral-800 rounded-full flex items-center justify-center overflow-hidden border border-slate-200 dark:border-neutral-700">
                        {imageUrl ? (
                            <NextImage
                                src={imageUrl}
                                alt={player.title}
                                fill
                                sizes="40px"
                                {...PLAYER_IMAGE_STYLE}
                            />
                        ) : (
                            <div
                                className="w-full h-full bg-slate-300 dark:bg-neutral-600"
                                style={{
                                    mask: "url('/player-silhouette.png') no-repeat center 4px",
                                    WebkitMask: "url('/player-silhouette.png') no-repeat center 4px",
                                    maskSize: "120%",
                                    WebkitMaskSize: "120%"
                                }}
                            />
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-neutral-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {player.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {/* Position Badge */}
                            {position && (
                                <Badge variant="secondary" className={`text-[8px] px-1 h-4 ${posInfo.color}`}>
                                    {posInfo.abbr}
                                </Badge>
                            )}

                            {/* FC26 Rating */}
                            {rating && (() => {
                                const numRating = typeof rating === 'number' ? rating : parseInt(String(rating), 10);
                                const colorClass = numRating >= 80 ? 'text-emerald-600 dark:text-emerald-500' :
                                    numRating >= 70 ? 'text-emerald-500 dark:text-emerald-400' :
                                        numRating >= 60 ? 'text-yellow-600 dark:text-yellow-500' :
                                            numRating >= 50 ? 'text-orange-500 dark:text-orange-400' :
                                                'text-red-600 dark:text-red-500';
                                return (
                                    <Badge variant="secondary" className="text-[9px] h-4 px-1.5 py-0 font-bold gap-0.5 flex items-center">
                                        <span className="text-[7px] font-bold italic opacity-70">FC26</span>
                                        <span className={`font-black ${colorClass}`}>{rating}</span>
                                    </Badge>
                                );
                            })()}

                            {/* Kit Number */}
                            {(player.metadata?.kit_number || player.metadata?.jersey_number) && (
                                <Badge variant="secondary" className="text-[8px] h-4 px-1.5 py-0 font-black text-slate-600 dark:text-slate-400">
                                    #{player.metadata?.kit_number || player.metadata?.jersey_number}
                                </Badge>
                            )}

                            {/* Age */}
                            {player.metadata?.birth_date && (() => {
                                const age = new Date().getFullYear() - new Date(player.metadata.birth_date).getFullYear();
                                return (
                                    <Badge variant="secondary" className="text-[8px] h-4 px-1.5 py-0 font-medium text-slate-500 dark:text-slate-400">
                                        {age}y
                                    </Badge>
                                );
                            })()}
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
                type={isLeague ? "league" : isClub ? "club" : "player"}
                imageUrl={metadata?.photo_url}
                badgeUrl={isLeague ? (metadata?.logo_url) : metadata?.badge_url}
                badgeUrlDark={isLeague ? metadata?.logo_url_dark : undefined}
                postCount={topic.post_count || 0}
                metadata={{
                    position: metadata?.position,
                    rating: metadata?.rating,
                    nationality: metadata?.nationality,
                    age: metadata?.birth_date ? new Date().getFullYear() - new Date(metadata.birth_date).getFullYear() : undefined,
                    height: metadata?.height,
                    kitNumber: metadata?.kit_number || metadata?.jersey_number,
                    league: isClub ? metadata?.league : clubData.league,
                    leagueSlug: clubData.leagueSlug,
                    stadium: metadata?.stadium,
                    founded: metadata?.founded,
                    country: metadata?.country,
                    render_url: metadata?.render_url,
                    trophy_url: metadata?.trophy_url,
                    fc26_data: topic.fc26_data,
                    ...clubData,
                }}
                backHref="/"
                userId={currentUser.id}
                topicId={topic.id}
            />

            {/* Main Content */}
            <div className="flex flex-col xl:flex-row gap-4 sm:gap-5 xl:gap-6">
                {/* Sidebar - appears FIRST on mobile, left side on desktop */}
                <aside className="w-full xl:shrink-0 xl:w-full xl:max-w-[340px] order-1">
                    <div className="xl:sticky xl:top-24">
                        {/* Section Title */}
                        <h3 className="text-xs sm:text-sm font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-2 sm:mb-3 px-1">
                            {isClub ? "Club Info" : "Player Info"}
                        </h3>

                        <div className="space-y-2 sm:space-y-3">
                            {sections.map((section) => {
                                const Icon = section.icon;
                                const isExpanded = expandedSections.has(section.id);

                                return (
                                    <Card key={section.id} className="overflow-hidden">
                                        {/* Section Header */}
                                        <button
                                            onClick={() => toggleSection(section.id)}
                                            className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                                <Icon className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-neutral-100 truncate">
                                                    {section.title}
                                                </span>
                                                {section.count !== undefined && (
                                                    <Badge variant="secondary" className="text-[9px] sm:text-[10px] shrink-0">{section.count}</Badge>
                                                )}

                                                {/* FC26 Rating Preview */}
                                                {section.id === "ratings" && isPlayer && topic.fc26_data?.overall && (() => {
                                                    const ovrRating = topic.fc26_data?.overall;
                                                    const numOvr = typeof ovrRating === 'number' ? ovrRating : parseInt(String(ovrRating), 10);
                                                    const ovrColor = numOvr >= 80 ? 'text-emerald-600 dark:text-emerald-500' :
                                                        numOvr >= 70 ? 'text-emerald-500 dark:text-emerald-400' :
                                                            numOvr >= 60 ? 'text-yellow-600 dark:text-yellow-500' :
                                                                numOvr >= 50 ? 'text-orange-500 dark:text-orange-400' :
                                                                    'text-red-600 dark:text-red-500';
                                                    return (
                                                        <div className="flex items-center gap-1.5 ml-2">
                                                            <Badge variant="secondary" className="text-[10px] sm:text-xs h-6 px-2 py-0 font-bold gap-1 flex items-center">
                                                                <span className="text-[8px] sm:text-[9px] opacity-70 font-semibold">OVR</span>
                                                                <span className={`font-black ${ovrColor}`}>{ovrRating}</span>
                                                            </Badge>
                                                            {topic.fc26_data?.potential && (
                                                                <Badge variant="secondary" className="hidden sm:flex text-[10px] sm:text-xs h-6 px-2 py-0 font-bold gap-1 items-center opacity-80">
                                                                    <span className="text-[8px] sm:text-[9px] opacity-70 font-semibold">POT</span>
                                                                    <span className="font-black text-slate-600 dark:text-slate-400">{topic.fc26_data?.potential}</span>
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                            {/* + / - icon animation */}
                                            <div className="relative w-4 sm:w-5 h-4 sm:h-5 flex items-center justify-center shrink-0">
                                                <Plus
                                                    className={`absolute w-4 sm:w-5 h-4 sm:h-5 text-slate-400 transition-all duration-150 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 ${isExpanded ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`}
                                                />
                                                <Minus
                                                    className={`absolute w-4 sm:w-5 h-4 sm:h-5 text-slate-400 transition-all duration-150 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 ${isExpanded ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}
                                                />
                                            </div>
                                        </button>

                                        {/* Section Content */}
                                        {isExpanded && (
                                            <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-slate-100 dark:border-neutral-800">
                                                {/* Players Section (Clubs) */}
                                                {section.id === "players" && isClub && (
                                                    squad.length > 0 ? (
                                                        <div
                                                            className="squad-scroll pt-3 sm:pt-4 -mr-2 sm:-mr-3 pr-3 sm:pr-4 space-y-3 sm:space-y-4 overflow-y-auto"
                                                            style={{
                                                                maxHeight: '400px',
                                                            }}
                                                        >
                                                            {positionOrder.map((pos) => {
                                                                const players = groupedSquad[pos];
                                                                if (!players || players.length === 0) return null;

                                                                return (
                                                                    <div key={pos}>
                                                                        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                                                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
                                                                                {pos}
                                                                            </span>
                                                                            <span className="text-[9px] sm:text-[10px] text-slate-300 dark:text-neutral-600">
                                                                                {players.length}
                                                                            </span>
                                                                        </div>
                                                                        <div className="space-y-1">
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

                                                {/* FC26 Ratings Section (Players) */}
                                                {section.id === "ratings" && isPlayer && (
                                                    (metadata?.rating || topic.fc26_data?.overall) ? (
                                                        <div className="pt-3 sm:pt-4 space-y-6">
                                                            {/* Overall Rating */}
                                                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
                                                                <span className="text-sm font-medium text-slate-500 dark:text-neutral-400">Overall Rating</span>
                                                                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                                                                    {topic.fc26_data?.overall || metadata?.rating}
                                                                </span>
                                                            </div>

                                                            {/* Detailed Stats Categories */}
                                                            {topic.fc26_data?.stats ? (() => {
                                                                // Helper to capitalize: "sprint speed" -> "Sprint Speed"
                                                                const formatName = (key: string) =>
                                                                    key.split(/[\s_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

                                                                // Helper to normalize keys for safe lookup (SoFIFA keys can be messy)
                                                                const getStat = (target: string) => {
                                                                    // Try exact match first
                                                                    if (topic.fc26_data.stats[target]) return Number(topic.fc26_data.stats[target]);
                                                                    // Try case-insensitive lookup, stripping spaces, underscores, and dashes
                                                                    const foundKey = Object.keys(topic.fc26_data.stats).find(k =>
                                                                        k.toLowerCase().replace(/[\s_-]/g, '') === target.toLowerCase().replace(/[\s_-]/g, '')
                                                                    );
                                                                    return foundKey ? Number(topic.fc26_data.stats[foundKey]) : null;
                                                                };

                                                                const categories = [
                                                                    {
                                                                        name: "Attacking",
                                                                        stats: ["Crossing", "Finishing", "Heading Accuracy", "Short Passing", "Volleys"]
                                                                    },
                                                                    {
                                                                        name: "Skill",
                                                                        stats: ["Dribbling", "Curve", "FK Accuracy", "Long Passing", "Ball Control"]
                                                                    },
                                                                    {
                                                                        name: "Movement",
                                                                        stats: ["Acceleration", "Sprint Speed", "Agility", "Reactions", "Balance"]
                                                                    },
                                                                    {
                                                                        name: "Power",
                                                                        stats: ["Shot Power", "Jumping", "Stamina", "Strength", "Long Shots"]
                                                                    },
                                                                    {
                                                                        name: "Mentality",
                                                                        stats: ["Aggression", "Interceptions", "Attack Position", "Vision", "Penalties", "Composure"]
                                                                    },
                                                                    {
                                                                        name: "Defending",
                                                                        stats: ["Defensive Awareness", "Standing Tackle", "Sliding Tackle"]
                                                                    },
                                                                    {
                                                                        name: "Goalkeeping",
                                                                        stats: ["GK Diving", "GK Handling", "GK Kicking", "GK Positioning", "GK Reflexes"]
                                                                    }
                                                                ];

                                                                // Goalkeeper Logic: Show GK stats first and full-width for GKs. Hide them for others.
                                                                const isGoalkeeper = /gk|goalkeeper/i.test(metadata.position || '');
                                                                const gkCategory = categories.find(c => c.name === "Goalkeeping");
                                                                const otherCategories = categories.filter(c => c.name !== "Goalkeeping");

                                                                const renderCategory = (cat: typeof categories[0]) => {
                                                                    const validStats = cat.stats.map(name => ({ name, value: getStat(name) })).filter(s => s.value !== null);
                                                                    if (validStats.length === 0) return null;

                                                                    return (
                                                                        <div key={cat.name} className="space-y-3 break-inside-avoid">
                                                                            <h4 className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider pl-0.5 border-b border-slate-100 dark:border-neutral-800 pb-1">
                                                                                {cat.name}
                                                                            </h4>
                                                                            <div className="grid gap-3">
                                                                                {validStats.map((stat) => (
                                                                                    <div key={stat.name} className="group">
                                                                                        <div className="flex items-center justify-between mb-1.5">
                                                                                            <span className="text-xs font-medium text-slate-600 dark:text-neutral-400 group-hover:text-slate-900 dark:group-hover:text-neutral-200 transition-colors">
                                                                                                {stat.name}
                                                                                            </span>
                                                                                            <span className={`text-xs font-bold ${(stat.value || 0) >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-neutral-300'}`}>
                                                                                                {stat.value}
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                                                                            <div
                                                                                                className={`h-full rounded-full transition-all duration-500 ${(stat.value || 0) >= 90 ? 'bg-emerald-500' :
                                                                                                    (stat.value || 0) >= 80 ? 'bg-emerald-600' :
                                                                                                        (stat.value || 0) >= 70 ? 'bg-emerald-700/80' :
                                                                                                            (stat.value || 0) >= 60 ? 'bg-yellow-500' :
                                                                                                                (stat.value || 0) >= 50 ? 'bg-orange-500' :
                                                                                                                    'bg-red-500'
                                                                                                    }`}
                                                                                                style={{ width: `${stat.value}%` }}
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                };

                                                                return (
                                                                    <div className="space-y-8">
                                                                        {/* Full-width Goalkeeping section for GKs */}
                                                                        {isGoalkeeper && gkCategory && (
                                                                            <div className="w-full">
                                                                                {renderCategory(gkCategory)}
                                                                            </div>
                                                                        )}

                                                                        {/* 2-Column Grid for other stats */}
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                                                            {otherCategories.map(renderCategory)}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })() : (
                                                                <div className="text-xs text-slate-400 italic text-center py-2">
                                                                    Detailed stats unavailable
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <EmptyState message="FC26 ratings not available" />
                                                    )
                                                )}

                                                {/* Statistics Section (Players) - Coming Soon */}
                                                {section.id === "stats" && isPlayer && (
                                                    <div className="pt-8 pb-6 flex flex-col items-center justify-center text-center opacity-70">
                                                        <Activity className="w-8 h-8 text-slate-300 dark:text-neutral-600 mb-3" />
                                                        <p className="text-sm font-medium text-slate-500 dark:text-neutral-400 mb-1">
                                                            Season Statistics
                                                        </p>
                                                        <p className="text-xs text-slate-400 dark:text-neutral-500">
                                                            Detailed match data coming soon...
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Fixtures Section (Clubs) */}
                                                {section.id === "fixtures" && isClub && (
                                                    <ClubFixtures
                                                        clubId={topic.id}
                                                        fixtures={fixtures}
                                                        clubStanding={clubStanding}
                                                    />
                                                )}

                                                {/* Clubs Section (Leagues) */}
                                                {section.id === "clubs" && isLeague && (
                                                    leagueClubs.length > 0 ? (
                                                        <div
                                                            className="squad-scroll pt-3 sm:pt-4 -mr-2 sm:-mr-3 pr-3 sm:pr-4 space-y-1 overflow-y-auto"
                                                            style={{ maxHeight: '400px' }}
                                                        >
                                                            {leagueClubs.map((club: any) => (
                                                                <Link key={club.id} href={`/topic/${club.slug}`} className="block">
                                                                    <Card variant="interactive" className="p-2 sm:p-2.5 flex items-center gap-2 sm:gap-2.5 group">
                                                                        {/* Club Badge */}
                                                                        <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0">
                                                                            {club.metadata?.badge_url && (
                                                                                <NextImage
                                                                                    src={club.metadata.badge_url}
                                                                                    alt={club.title}
                                                                                    fill
                                                                                    sizes="36px"
                                                                                    className="object-contain"
                                                                                />
                                                                            )}
                                                                        </div>
                                                                        {/* Club Name */}
                                                                        <div className="flex-1 min-w-0">
                                                                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                                                                {club.title}
                                                                            </h3>
                                                                        </div>
                                                                    </Card>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <EmptyState message="No clubs data available" />
                                                    )
                                                )}

                                                {/* Standings Section (Leagues) */}
                                                {section.id === "standings" && isLeague && (
                                                    <LeagueTable standings={standings} />
                                                )}

                                                {/* Club Stats (for clubs only, before About section) */}
                                                {section.id === "about" && isClub && (
                                                    <>
                                                        <div className="pt-3 sm:pt-4 space-y-3">
                                                            {metadata?.founded && (
                                                                <div className="flex items-start gap-3">
                                                                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30 shrink-0">
                                                                        <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <span className="text-xs text-slate-400 dark:text-neutral-500 block mb-0.5">Founded</span>
                                                                        <span className="text-sm font-bold text-slate-900 dark:text-neutral-100">{metadata.founded}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {metadata?.stadium && (
                                                                <div className="flex items-start gap-3">
                                                                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30 shrink-0">
                                                                        <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <span className="text-xs text-slate-400 dark:text-neutral-500 block mb-0.5">Stadium</span>
                                                                        <span className="text-sm font-bold text-slate-900 dark:text-neutral-100">{metadata.stadium}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {metadata?.league && (
                                                                <div className="flex items-start gap-3">
                                                                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30 shrink-0">
                                                                        <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <span className="text-xs text-slate-400 dark:text-neutral-500 block mb-0.5">League</span>
                                                                        <span className="text-sm font-bold text-slate-900 dark:text-neutral-100">{metadata.league}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="h-px bg-slate-100 dark:bg-neutral-800 my-4" />
                                                    </>
                                                )}

                                                {/* About Section */}
                                                {section.id === "about" && (
                                                    <TopicDescription
                                                        description={topic.description || (
                                                            isLeague
                                                                ? `${topic.title} is one of the top professional football leagues in ${metadata?.country || 'Europe'}.`
                                                                : isClub
                                                                    ? `${topic.title} is a professional football club competing in ${metadata?.league || 'top-flight football'}.`
                                                                    : `${topic.title} is a professional footballer currently playing as a ${metadata?.position || 'player'}${playerClub ? ` for ${playerClub.title}` : ''}.`
                                                        )}
                                                    />
                                                )}
                                            </div>
                                        )
                                        }
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </aside>

                {/* Discussion */}
                <main className="flex-1 min-w-0 w-full order-2">
                    <div className="flex items-center gap-2 mb-4 sm:mb-5">
                        <Activity className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                        <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-neutral-100">
                            Takes
                        </h2>
                    </div>

                    <TakeComposer
                        topicId={topic.id}
                        topicTitle={topic.title}
                        userAvatar={currentUser?.avatar_url}
                        username={currentUser?.username}
                        userId={currentUser?.id}
                        onSuccess={handlePostSuccess}
                    />

                    <TakeFeed
                        initialPosts={posts}
                        topicId={topic.id}
                        topicTitle={topic.title}
                        topicImageUrl={isClub ? metadata?.badge_url : metadata?.photo_url}
                        topicType={topic.type}
                        currentUser={currentUser}
                        onAddPostRef={addPostRef}
                        clubName={clubData.clubName}
                        clubBadgeUrl={clubData.clubBadgeUrl}
                        topicPosition={isClub ? metadata?.league?.replace(/^(English|Spanish|Italian|German|French)\s/, '') : metadata?.position}
                    />
                </main>
            </div >
        </div >
    );
}
