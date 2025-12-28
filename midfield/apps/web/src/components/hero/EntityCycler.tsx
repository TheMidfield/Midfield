"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Shield, ArrowRight } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import type { HeroEntity } from "@/app/actions/hero-data";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { getPositionInfo, getRatingColor, PLAYER_IMAGE_STYLE } from "@/lib/entity-helpers";

// Sleek entity card EXACTLY matching SimilarWidget style
function MiniEntityCard({ entity }: { entity: HeroEntity }) {
    const isPlayer = entity.type === 'player';
    const isClub = entity.type === 'club';
    const posInfo = isPlayer && entity.position ? getPositionInfo(entity.position) : null;

    return (
        <Card variant="interactive" className="p-2 sm:p-2.5 flex items-center gap-2.5 sm:gap-3 group hover:border-emerald-500/30 transition-all min-w-[240px]">
            {/* Avatar */}
            {isPlayer ? (
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0 bg-slate-100 dark:bg-neutral-800 rounded-full flex items-center justify-center overflow-hidden border border-slate-200 dark:border-neutral-700">
                    {entity.imageUrl ? (
                        <NextImage
                            src={entity.imageUrl}
                            alt={entity.title}
                            fill
                            sizes="40px"
                            {...PLAYER_IMAGE_STYLE}
                        />
                    ) : (
                        <Shield className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                    )}
                </div>
            ) : (
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0">
                    {entity.imageUrl ? (
                        <NextImage
                            src={entity.imageUrl}
                            alt={entity.title}
                            fill
                            sizes="36px"
                            className="object-contain"
                        />
                    ) : (
                        <Shield className="w-full h-full text-slate-300 dark:text-neutral-600" />
                    )}
                </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {entity.displayName}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {isPlayer && posInfo && (
                        <Badge variant="secondary" className={`text-[8px] px-1 h-4 ${posInfo.color}`}>
                            {posInfo.abbr}
                        </Badge>
                    )}
                    {isPlayer && entity.rating && (
                        <Badge variant="secondary" className="text-[9px] h-4 px-1.5 py-0 font-bold gap-0.5 flex items-center">
                            <span className={`font-black ${getRatingColor(entity.rating)}`}>{entity.rating}</span>
                        </Badge>
                    )}
                    {isClub && entity.subtitle && (
                        <Badge variant="secondary" className="text-[8px] px-1.5 h-4 bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 truncate max-w-[120px]">
                            {entity.subtitle}
                        </Badge>
                    )}
                    {!isPlayer && !entity.subtitle && (
                        <Badge variant="secondary" className="text-[8px] px-1 h-4 bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 border-none capitalize">
                            {entity.type}
                        </Badge>
                    )}
                </div>
            </div>
        </Card>
    );
}

/**
 * EntityCycler - Animated hero invitation
 */
export function EntityCycler({ entities }: { entities: HeroEntity[] }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (entities.length <= 1) return;
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % entities.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [entities.length]);

    const currentEntity = entities[index];

    // Loading state
    if (!currentEntity) {
        return (
            <div style={{ maxWidth: '520px' }}>
                <div className="h-10 w-72 bg-slate-100 dark:bg-neutral-800 rounded animate-pulse mb-3" />
                <div className="h-5 w-56 bg-slate-100 dark:bg-neutral-800 rounded animate-pulse mb-6" />
                <div className="h-12 w-64 bg-slate-100 dark:bg-neutral-800 rounded animate-pulse" />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '520px' }}>
            {/* Title - Larger & Bolder */}
            <h1 className="font-extrabold tracking-tight text-slate-900 dark:text-white text-4xl sm:text-5xl lg:text-6xl mb-4 leading-[1.1]">
                The Home of <br />
                <span className="text-emerald-600 dark:text-emerald-500">Football Discussion</span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-500 dark:text-neutral-400 font-medium text-base mb-8 max-w-[400px] leading-relaxed">
                Share your take on any player, club, or league. Join thousands of fans debating globally.
            </p>

            {/* "What's your take on" + cycling card */}
            <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-4 mb-8">
                <span className="text-slate-500 dark:text-slate-200 font-semibold tracking-tight whitespace-nowrap text-xl">
                    What's your take on
                </span>

                <div className="relative h-14 min-w-[240px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentEntity.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-full"
                        >
                            <Link href={`/topic/${currentEntity.slug}`} className="block w-full">
                                <MiniEntityCard entity={currentEntity} />
                            </Link>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <span className="text-emerald-600 dark:text-emerald-500 font-bold text-3xl ml-2 hidden sm:inline-block">?</span>
            </div>

            {/* CTA - Updated Style */}
            <Link
                href={`/topic/${currentEntity.slug}`}
                className="group inline-flex items-center justify-center font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-all px-8 h-12 text-base shadow-none"
            >
                Join the conversation
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
        </div>
    );
}
