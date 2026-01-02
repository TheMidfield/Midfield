"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Shield, ArrowRight, ThumbsUp, ThumbsDown } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/components/ui/useAuthModal";
import { AuthModal } from "@/components/ui/AuthModal";
import { createClient } from "@/lib/supabase/client";
import type { HeroEntity } from "@/app/actions/hero-data";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { getPositionInfo, getRatingColor, PLAYER_IMAGE_STYLE } from "@/lib/entity-helpers";

// Sleek entity card EXACTLY matching SimilarWidget style
function MiniEntityCard({ entity }: { entity: HeroEntity }) {
    const isPlayer = entity.type === 'player';
    const isClub = entity.type === 'club';
    const posInfo = isPlayer && entity.position ? getPositionInfo(entity.position) : null;

    return (
        <Card variant="interactive" className="p-3 sm:p-2.5 flex items-center gap-3 sm:gap-3 group hover:border-emerald-500/30 transition-all text-left" style={{ width: '100%' }}>
            {/* Avatar */}
            {isPlayer ? (
                <div className="relative w-11 h-11 sm:w-10 sm:h-10 shrink-0 bg-slate-100 dark:bg-neutral-800 rounded-full flex items-center justify-center overflow-hidden border border-slate-200 dark:border-neutral-700">
                    {entity.imageUrl ? (
                        <NextImage
                            src={entity.imageUrl}
                            alt={entity.title}
                            fill
                            sizes="40px"
                            priority={true}
                            unoptimized={true}
                            {...PLAYER_IMAGE_STYLE}
                        />
                    ) : (
                        <Shield className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                    )}
                </div>
            ) : (
                <div className="relative w-10 h-10 sm:w-9 sm:h-9 shrink-0">
                    {entity.imageUrl ? (
                        <NextImage
                            src={entity.imageUrl}
                            alt={entity.title}
                            fill
                            sizes="36px"
                            priority={true}
                            unoptimized={true}
                            className="object-contain"
                        />
                    ) : (
                        <Shield className="w-full h-full text-slate-300 dark:text-neutral-600" />
                    )}
                </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-active:text-emerald-600 dark:group-active:text-emerald-400 transition-colors">
                    {entity.displayName}
                </h3>
                <div className="flex items-center gap-1.5 flex-wrap">
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
                        <Badge variant="secondary" className="text-[8px] px-1.5 h-4 truncate max-w-[100px] sm:max-w-[120px]">
                            {entity.subtitle}
                        </Badge>
                    )}
                    {!isPlayer && !entity.subtitle && (
                        <Badge variant="secondary" className="text-[8px] px-1 h-4 capitalize">
                            {entity.type}
                        </Badge>
                    )}
                </div>
            </div>
        </Card>
    );
}

// Smart Shuffle: Player-heavy mixing
// Ensures we never have consecutive non-players (clubs/leagues).
// Pattern: [Player, Player, Other, Player, Player, Other...]
function smartShuffle(entities: HeroEntity[]): HeroEntity[] {
    const players = entities.filter(e => e.type === 'player');
    const others = entities.filter(e => e.type !== 'player');

    // Standard shuffle for randomness within groups
    const sPlayers = shuffleArray(players);
    const sOthers = shuffleArray(others);

    const result: HeroEntity[] = [];
    let pIdx = 0;
    let oIdx = 0;

    while (pIdx < sPlayers.length || oIdx < sOthers.length) {
        // Add up to 2 players
        if (pIdx < sPlayers.length) result.push(sPlayers[pIdx++]);
        if (pIdx < sPlayers.length) result.push(sPlayers[pIdx++]);

        // Add 1 other entity
        if (oIdx < sOthers.length) result.push(sOthers[oIdx++]);
    }

    return result;
}

// Fisher-Yates shuffle
function shuffleArray<T>(arr: T[]): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * EntityCycler - Animated hero invitation
 */
export function EntityCycler({ entities }: { entities: HeroEntity[] }) {
    const [shuffledEntities, setShuffledEntities] = useState<HeroEntity[]>([]);
    const [index, setIndex] = useState(0);
    const { isAuthModalOpen, authModalContext, openAuthModal, closeAuthModal } = useAuthModal();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Shuffle entities once on mount with SMART mixing
    useEffect(() => {
        if (entities.length > 0) {
            setShuffledEntities(smartShuffle(entities));
        }
    }, [entities]);

    // Preload all entity images on initial load
    useEffect(() => {
        if (shuffledEntities.length === 0) return;

        // Preload all images immediately
        shuffledEntities.forEach(entity => {
            if (entity.imageUrl) {
                const img = new Image();
                img.src = entity.imageUrl;
            }
        });
    }, [shuffledEntities]);

    // Aggressively preload NEXT image using link[rel=preload] when index changes
    useEffect(() => {
        if (shuffledEntities.length < 2) return;

        const nextIndex = (index + 1) % shuffledEntities.length;
        const nextEntity = shuffledEntities[nextIndex];

        if (nextEntity?.imageUrl) {
            // Check if preload link already exists
            const existingLink = document.querySelector(`link[href="${nextEntity.imageUrl}"]`);
            if (!existingLink) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = nextEntity.imageUrl;
                link.fetchPriority = 'high';
                document.head.appendChild(link);

                // Clean up old preload links (keep max 3)
                const allPreloads = document.querySelectorAll('link[rel="preload"][as="image"]');
                if (allPreloads.length > 3) {
                    allPreloads[0]?.remove();
                }
            }
        }
    }, [index, shuffledEntities]);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getSession().then(({ data }) => {
            setIsAuthenticated(!!data.session);
        });
    }, []);

    useEffect(() => {
        if (shuffledEntities.length <= 1) return;
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % shuffledEntities.length);
        }, 2300);
        return () => clearInterval(interval);
    }, [shuffledEntities.length]);

    const currentEntity = shuffledEntities[index];

    // No loading state needed - data provided via SSR
    if (!currentEntity) return null;

    return (
        <>
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={closeAuthModal}
                context={authModalContext}
            />
            <div className="max-w-[600px] sm:max-w-[520px]">
                {/* Title - Larger but NOT over-weighted */}
                <h1 className="font-bold tracking-tight text-slate-900 dark:text-white text-4xl sm:text-5xl lg:text-6xl mb-8 sm:mb-12 leading-[1.1]">
                    Everyone has a <br />
                    <span className="text-emerald-600 dark:text-emerald-500">football take.</span>
                </h1>

                {/* "What's your take on" + cycling card */}
                <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-2 sm:gap-4 mb-10 sm:mb-16">
                    <span className="text-slate-700 dark:text-slate-200 font-semibold tracking-tight whitespace-nowrap text-lg sm:text-xl">
                        What's your take on...
                    </span>

                    {/* Card container - Shorter but larger on mobile as requested, fixed width on desktop for 1-line fit */}
                    <div className="relative h-20 sm:h-14 w-[280px] sm:w-[240px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentEntity.id}
                                initial={{ y: 20, opacity: 0, scale: 0.95 }}
                                animate={{ y: 0, opacity: 1, scale: 1.05 }}
                                exit={{ y: -20, opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-full"
                                style={{ width: '100%' }}
                            >
                                <Link href={`/topic/${currentEntity.slug}`} className="block w-full group">
                                    <MiniEntityCard entity={currentEntity} />
                                </Link>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* CTA */}
                <Button
                    variant="default"
                    size="sm"
                    className="group"
                    onClick={() => {
                        if (isAuthenticated) {
                            router.push(`/topic/${currentEntity.slug}`);
                        } else {
                            openAuthModal("default");
                        }
                    }}
                >
                    <span>Join the conversation</span>
                    <svg
                        className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Button>

                {/* Discrete subtitle */}
                <p className="text-slate-500 dark:text-neutral-500 text-sm mt-8 max-w-[360px]">
                    Discuss players, clubs, and leagues <br /> with fans worldwide.
                </p>
            </div >
        </>
    );
}
