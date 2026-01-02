import Link from "next/link";
import NextImage from "next/image";
import { ArrowRight, ThumbsUp, ThumbsDown, Shield, MessageSquare, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getPositionInfo, getRatingColor, PLAYER_IMAGE_STYLE } from "@/lib/entity-helpers";

// Country flag mapping
const COUNTRY_FLAG_IMAGES: Record<string, string> = {
    "England": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/england.png",
    "Spain": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/spain.png",
    "Italy": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/italy.png",
    "Germany": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/germany.png",
    "France": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/france.png",
};

export function TopicCard({ topic, showWatermark = false }: { topic: any; showWatermark?: boolean }) {
    const isClub = topic.type === 'club';
    const isLeague = topic.type === 'league';
    const isPlayer = topic.type === 'player';
    const ratingRaw = topic.fc26_data?.overall || topic.rating;
    const rating = (ratingRaw && ratingRaw !== "?" && ratingRaw !== "0") ? ratingRaw : null;
    const imageUrl = topic.metadata?.photo_url || topic.metadata?.badge_url;
    const position = topic.metadata?.position || "";

    const positionInfo = getPositionInfo(position);

    // Style Overrides
    // Style Overrides
    const isUCL = isLeague && (topic.title.includes("Champions League") || topic.slug.includes("champions-league"));
    const isEuropa = isLeague && (topic.title.includes("Europa League") || topic.slug.includes("europa-league"));

    const getHoverBorder = () => {
        if (isUCL) return "hover:border-[#001A57] dark:hover:border-[#3b82f6]";
        if (isEuropa) return "hover:border-orange-600 dark:hover:border-orange-500";
        return "hover:border-emerald-400 dark:hover:border-emerald-500";
    };

    const getHoverText = () => {
        if (isUCL) return "group-hover:text-[#001A57] dark:group-hover:text-[#60a5fa]";
        if (isEuropa) return "group-hover:text-orange-700 dark:group-hover:text-orange-400";
        return "group-hover:text-emerald-600 dark:group-hover:text-emerald-400";
    };

    const getHoverBg = () => {
        if (isUCL) return "group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-[#001A57] dark:group-hover:text-[#60a5fa]";
        if (isEuropa) return "group-hover:bg-orange-50 dark:group-hover:bg-orange-900/30 group-hover:text-orange-700 dark:group-hover:text-orange-400";
        return "group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400";
    };

    const hoverBorderClass = getHoverBorder();
    const hoverTextClass = getHoverText();
    const hoverBgClass = getHoverBg();

    // League-specific rendering - match club/player card structure
    if (isLeague) {
        const countryFlag = COUNTRY_FLAG_IMAGES[topic.metadata?.country || ""];
        const logoUrl = topic.metadata?.logo_url;
        const logoUrlDark = topic.metadata?.logo_url_dark || logoUrl;
        const trophyUrl = topic.metadata?.trophy_url;

        return (

            <Link href={`/topic/${topic.slug}`} className="block group">
                <Card className={`group relative p-4 sm:p-5 h-[185px] flex flex-col overflow-hidden cursor-pointer transition-all duration-200 active:scale-[0.96] lg:active:scale-100 ${hoverBorderClass} ${hoverBgClass}`}>
                    {/* Trophy Watermark */}
                    {trophyUrl && (
                        <div className="absolute -right-8 -bottom-8 w-48 h-48 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500 grayscale pointer-events-none select-none rotate-12">
                            <img
                                src={trophyUrl}
                                alt=""
                                className="w-full h-full object-contain"
                            />
                        </div>
                    )}

                    {/* Top Row: Logo & Flag (matching player/club layout) */}
                    <div className="flex justify-between items-start mb-3 relative z-10">
                        <div className="flex items-start gap-3">
                            {/* League Logo - NO CONTAINER, direct display */}
                            <div className="w-14 h-14 flex items-center justify-center shrink-0">
                                {logoUrl ? (
                                    <>
                                        <img
                                            src={logoUrl}
                                            alt={topic.title}
                                            className="max-w-full max-h-full object-contain dark:hidden"
                                        />
                                        <img
                                            src={logoUrlDark}
                                            alt={topic.title}
                                            className="max-w-full max-h-full object-contain hidden dark:block"
                                        />
                                    </>
                                ) : (
                                    <Trophy className="w-12 h-12 text-slate-300 dark:text-neutral-600" />
                                )}
                            </div>

                            {/* Country Flag (in metadata position like club badges for players) */}
                            {countryFlag && (
                                <div className="flex flex-col gap-2 mt-1">
                                    <div className="h-5 w-auto flex items-center">
                                        <img
                                            src={countryFlag}
                                            alt={topic.metadata?.country}
                                            className="h-full w-auto object-contain rounded border border-slate-200 dark:border-neutral-700"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Arrow */}
                        <div className={`w-8 h-8 rounded-md bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-400 dark:text-neutral-500 transition-all shrink-0 ${hoverBgClass}`}>
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Middle: Title */}
                    <div className="relative z-10 flex-1 flex flex-col justify-center">
                        <h3 className={`text-lg font-bold text-slate-900 dark:text-neutral-100 leading-tight mb-2 transition-colors line-clamp-2 ${hoverTextClass}`}>
                            {topic.title.replace(/^(English|Spanish|Italian|German|French|UEFA)\s/, '')}
                        </h3>
                    </div>

                    {/* Footer Metrics */}
                    <div className="mt-auto pt-3 border-t border-slate-200 dark:border-neutral-800 group-hover:border-slate-400 dark:group-hover:border-neutral-500 transition-colors flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-neutral-400 text-[11px] font-semibold">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{topic.post_count?.toLocaleString() || "0"} Takes</span>
                        </div>

                        <div className="flex items-center gap-2.5">
                            {topic.upvotes > 0 && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-neutral-500">
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                    <span>{topic.upvotes}</span>
                                </div>
                            )}
                            {topic.downvotes > 0 && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-neutral-500">
                                    <ThumbsDown className="w-3.5 h-3.5" />
                                    <span>{topic.downvotes}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </Link>
        );
    }

    // Player/Club rendering (existing code)
    const renderUrl = topic.metadata?.render_url || imageUrl;

    return (
        <Link href={`/topic/${topic.slug}`} className="block group">
            <Card variant="interactive" className="group relative p-4 sm:p-5 h-[185px] flex flex-col overflow-hidden">
                {/* Player Artistic Watermark (Homepage Featured Only) */}
                {isPlayer && showWatermark && renderUrl && (
                    <div className="absolute right-0 top-0 w-36 h-36 sm:w-40 sm:h-40 opacity-[0.08] group-hover:opacity-[0.12] transition-opacity duration-500 pointer-events-none select-none grayscale">
                        <NextImage
                            src={renderUrl}
                            alt=""
                            fill
                            className="object-contain scale-[1.8]"
                            style={{
                                objectPosition: '50% 0%',
                                transformOrigin: '50% 0%'
                            }}
                            unoptimized={true}
                        />
                    </div>
                )}

                {/* Club Artistic Watermark */}
                {isClub && imageUrl && (
                    <div className="absolute -right-8 -bottom-8 w-48 h-48 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500 grayscale pointer-events-none select-none rotate-12">
                        <NextImage
                            src={imageUrl}
                            alt=""
                            fill
                            className="object-contain"
                            unoptimized={true}
                        />
                    </div>
                )}

                {/* Top Row: Avatar & Info */}
                <div className="flex justify-between items-start mb-3 relative z-10">
                    <div className="flex items-start gap-3">
                        {/* Avatar Container */}
                        <div className="relative">
                            <div className={`
                                relative border bg-slate-50 dark:bg-neutral-800 flex items-center justify-center overflow-hidden transition-colors
                                ${isClub ? 'w-12 h-12 sm:w-14 sm:h-14 rounded-md p-2 border-slate-200 dark:border-neutral-700 group-hover:border-slate-400 dark:group-hover:border-neutral-500' : 'w-12 h-12 sm:w-14 sm:h-14 rounded-full border-slate-200 dark:border-neutral-700 group-hover:border-slate-400 dark:group-hover:border-neutral-500'}
                            `}>
                                {imageUrl ? (
                                    <NextImage
                                        src={imageUrl}
                                        alt={topic.title}
                                        fill
                                        className={isClub ? 'object-contain p-1' : PLAYER_IMAGE_STYLE.className}
                                        {...(!isClub ? PLAYER_IMAGE_STYLE : {})}
                                        sizes="56px"
                                        unoptimized={true}
                                    />
                                ) : (
                                    isClub ? (
                                        <Shield className="w-1/2 h-1/2 text-slate-300 dark:text-neutral-600" />
                                    ) : (
                                        <div
                                            className="w-full h-full bg-slate-300 dark:bg-neutral-600"
                                            style={{
                                                mask: "url('/player-silhouette.png') no-repeat center 8px",
                                                WebkitMask: "url('/player-silhouette.png') no-repeat center 8px",
                                                maskSize: "130%",
                                                WebkitMaskSize: "130%"
                                            }}
                                        />
                                    )
                                )}
                            </div>

                            {!isClub && rating && (() => {
                                return (
                                    <div className="absolute -bottom-1 -right-1">
                                        <Badge variant="secondary" className="text-[9px] h-4 px-1.5 py-0 font-bold gap-0.5 flex items-center shadow-sm">
                                            <span className={`font-black ${getRatingColor(rating)}`}>{rating}</span>
                                        </Badge>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Position Badge + Club Badge - Players only, League for Clubs */}
                        {!isClub && (() => {
                            const clubName = topic.clubInfo?.name || topic.metadata?.club_name;
                            const clubBadge = topic.clubInfo?.badge_url;
                            return (
                                <div className="flex flex-col gap-2 mt-1 ml-3">
                                    {position && (
                                        <Badge variant="secondary" className={`text-[9px] w-fit ${positionInfo.color}`}>
                                            {positionInfo.abbr}
                                        </Badge>
                                    )}
                                    {clubName && (
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400">
                                            {clubBadge ? (
                                                <div className="relative w-4.5 h-4.5 shrink-0">
                                                    <NextImage
                                                        src={clubBadge}
                                                        alt={clubName}
                                                        fill
                                                        sizes="18px"
                                                        className="object-contain"
                                                        unoptimized={true}
                                                    />
                                                </div>
                                            ) : (
                                                <Shield className="w-4.5 h-4.5 shrink-0" />
                                            )}
                                            <span className="font-medium truncate max-w-[100px]">{clubName}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* League badge for clubs at top */}
                        {isClub && topic.metadata?.league && (
                            <div className="flex flex-col gap-2 mt-1">
                                <Badge variant="secondary" className="text-[9px] w-fit">
                                    {topic.metadata.league.replace(/^(English|Spanish|Italian|German|French)\s/, '')}
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Arrow */}
                    <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-400 dark:text-neutral-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 active:bg-emerald-100 dark:active:bg-emerald-900/50 active:text-emerald-600 dark:active:text-emerald-400 transition-all shrink-0">
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>

                {/* Middle: Info */}
                <div className="relative z-10 flex-1 flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-neutral-100 leading-tight mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 active:text-emerald-600 dark:active:text-emerald-400 transition-colors line-clamp-2">
                        {topic.title}
                    </h3>
                </div>

                {/* Footer Metrics */}
                <div className="mt-auto pt-3 border-t border-slate-200 dark:border-neutral-800 group-hover:border-slate-400 dark:group-hover:border-neutral-500 transition-colors flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-neutral-400 text-[11px] font-semibold">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{topic.post_count?.toLocaleString() || "0"} Takes</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                        {topic.upvotes > 0 && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-neutral-500">
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>{topic.upvotes}</span>
                            </div>
                        )}
                        {topic.downvotes > 0 && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-neutral-500">
                                <ThumbsDown className="w-3.5 h-3.5" />
                                <span>{topic.downvotes}</span>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </Link>
    );
}
