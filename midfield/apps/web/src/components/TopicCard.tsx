import Link from "next/link";
import NextImage from "next/image";
import { ArrowRight, Activity, Shield, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getPositionInfo, getRatingColor, PLAYER_IMAGE_STYLE } from "@/lib/entity-helpers";

export function TopicCard({ topic }: { topic: any }) {
    const isClub = topic.type === 'club';
    const ratingRaw = topic.fc26_data?.overall || topic.rating;
    const rating = (ratingRaw && ratingRaw !== "?" && ratingRaw !== "0") ? ratingRaw : null;
    const imageUrl = topic.metadata?.photo_url || topic.metadata?.badge_url;
    const position = topic.metadata?.position || "";
    const positionInfo = getPositionInfo(position);

    return (
        <Link href={`/topic/${topic.slug}`}>
            <Card variant="interactive" className="group relative p-4 sm:p-5 min-h-[200px] sm:min-h-[220px] flex flex-col overflow-hidden">
                {/* Club Artistic Watermark */}
                {isClub && imageUrl && (
                    <div className="absolute -right-8 -bottom-8 w-48 h-48 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500 grayscale pointer-events-none select-none rotate-12">
                        <NextImage
                            src={imageUrl}
                            alt=""
                            fill
                            className="object-contain"
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
                                        className={isClub ? 'object-contain p-1' : PLAYER_IMAGE_STYLE.className} // Added p-1 for club badges to prevent edge clipping
                                        {...(!isClub ? PLAYER_IMAGE_STYLE : {})}
                                        sizes="56px"
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

                        {/* Position Badge + Club Badge - Players only */}
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
                    </div>

                    {/* Arrow */}
                    <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-400 dark:text-neutral-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all shrink-0">
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>

                {/* Middle: Info */}
                <div className="relative z-10 flex-1 flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-neutral-100 leading-tight mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {topic.title}
                    </h3>

                    <div className="flex flex-wrap gap-2 items-center">
                        {isClub ? (
                            <Badge variant="secondary" className="text-[10px]">
                                {topic.metadata?.league?.replace(/^(English|Spanish|Italian|German|French)\s/, '') || "League"}
                            </Badge>
                        ) : (
                            topic.metadata?.club_name && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400">
                                    <Shield className="w-3 h-3" />
                                    <span className="font-medium">{topic.metadata.club_name}</span>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Footer Metrics */}
                <div className="mt-auto pt-3 border-t border-slate-200 dark:border-neutral-800 group-hover:border-slate-400 dark:group-hover:border-neutral-500 transition-colors flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-neutral-400 text-[11px] font-semibold">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{topic.post_count?.toLocaleString() || "0"} Takes</span>
                    </div>

                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                        <Activity className="w-3.5 h-3.5" />
                        <span>Active</span>
                    </div>
                </div>
            </Card>
        </Link >
    );
}
