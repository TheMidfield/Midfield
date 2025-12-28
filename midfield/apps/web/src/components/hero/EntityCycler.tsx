"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Shield, ArrowRight } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/components/ui/useAuthModal";
import { AuthModal } from "@/components/ui/AuthModal";
import { createClient } from "@/lib/supabase/client";
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
        <Card variant="interactive" className="p-2 sm:p-2.5 flex items-center gap-2.5 sm:gap-3 group hover:border-emerald-500/30 transition-all min-w-[240px]" style={{ width: '100%' }}>
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

    // Shuffle entities once on mount
    useEffect(() => {
        if (entities.length > 0) {
            setShuffledEntities(shuffleArray(entities));
        }
    }, [entities]);

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
        }, 3000);
        return () => clearInterval(interval);
    }, [shuffledEntities.length]);

    const currentEntity = shuffledEntities[index];

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
        <>
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={closeAuthModal}
                context={authModalContext}
            />
            <div style={{ maxWidth: '520px' }}>
                {/* Title - Larger & Bolder */}
                <h1 className="font-extrabold tracking-tight text-slate-900 dark:text-white text-4xl sm:text-5xl lg:text-6xl mb-12 leading-[1.1]">
                    Everyone has a <br />
                    <span className="text-emerald-600 dark:text-emerald-500">football take.</span>
                </h1>

                {/* "What's your take on" + cycling card */}
                <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-4 mb-16">
                <span className="text-slate-700 dark:text-slate-200 font-semibold tracking-tight whitespace-nowrap text-xl">
                    What's your take on...
                </span>

                <div className="relative h-14" style={{ minWidth: '240px' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentEntity.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-full"
                            style={{ width: '100%' }}
                        >
                            <Link href={`/topic/${currentEntity.slug}`} className="block w-full">
                                <MiniEntityCard entity={currentEntity} />
                            </Link>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* CTA - Compact Style */}
            <button
                onClick={() => {
                    if (isAuthenticated) {
                        router.push(`/topic/${currentEntity.slug}`);
                    } else {
                        openAuthModal("default");
                    }
                }}
                className="group inline-flex items-center justify-center font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-all px-5 h-9 text-sm shadow-none cursor-pointer"
            >
                Join the conversation
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Discrete subtitle */}
            <p className="text-slate-500 dark:text-neutral-500 text-sm mt-8 max-w-[360px]">
                Discuss players, clubs, and leagues with fans worldwide.
            </p>
            </div>
        </>
    );
}
