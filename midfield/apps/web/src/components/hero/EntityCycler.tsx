"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Shield, Trophy } from "lucide-react";
import Link from "next/link";
import type { HeroEntity } from "@/app/actions/hero-data";

// Proper mini topic card with working images
function MiniEntityCard({ entity }: { entity: HeroEntity }) {
    const isPlayer = entity.type === 'player';
    const isClub = entity.type === 'club';

    const typeColor = isPlayer
        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
        : isClub
            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
            : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400';

    return (
        <div
            className="inline-flex items-center bg-white dark:bg-neutral-900 border-2 border-slate-200 dark:border-neutral-700 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-all group/card"
            style={{ padding: '8px 12px', gap: '10px' }}
        >
            {/* Avatar - use img tag directly for reliability */}
            <div
                className={`relative shrink-0 flex items-center justify-center overflow-hidden ${isPlayer
                        ? 'rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-800 dark:to-neutral-700 border border-slate-200 dark:border-neutral-600'
                        : ''
                    }`}
                style={{ width: '32px', height: '32px' }}
            >
                {entity.imageUrl ? (
                    <img
                        src={entity.imageUrl}
                        alt={entity.title}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: isPlayer ? 'cover' : 'contain',
                            objectPosition: isPlayer ? 'top' : 'center'
                        }}
                    />
                ) : isClub ? (
                    <Shield className="text-slate-400 dark:text-neutral-500" style={{ width: '18px', height: '18px' }} />
                ) : (
                    <Trophy className="text-slate-400 dark:text-neutral-500" style={{ width: '18px', height: '18px' }} />
                )}
            </div>

            {/* Name */}
            <span
                className="font-bold text-slate-900 dark:text-white group-hover/card:text-emerald-600 dark:group-hover/card:text-emerald-400 transition-colors"
                style={{ fontSize: '14px' }}
            >
                {entity.displayName}
            </span>

            {/* Type badge */}
            <span
                className={`shrink-0 font-bold uppercase tracking-wider rounded px-1.5 py-0.5 ${typeColor}`}
                style={{ fontSize: '8px' }}
            >
                {entity.type}
            </span>

            {/* Question mark */}
            <span className="text-emerald-500 font-bold" style={{ fontSize: '18px' }}>?</span>
        </div>
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
        }, 2800);
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
            {/* Title */}
            <h1
                className="font-bold tracking-tight text-slate-900 dark:text-white"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', lineHeight: 1.25, marginBottom: '8px' }}
            >
                The Home of{' '}
                <span className="text-emerald-600 dark:text-emerald-500">Football Discussion</span>
            </h1>

            {/* Subtitle */}
            <p
                className="text-slate-500 dark:text-neutral-400"
                style={{ fontSize: '13px', marginBottom: '20px', maxWidth: '340px', lineHeight: 1.5 }}
            >
                Share your take on any player, club, or league.
            </p>

            {/* "What's your take on" + cycling card */}
            <div
                className="flex items-center flex-wrap"
                style={{ gap: '8px', marginBottom: '16px' }}
            >
                <span
                    className="text-slate-500 dark:text-neutral-400"
                    style={{ fontSize: '13px' }}
                >
                    What's your take on
                </span>

                <div className="relative" style={{ height: '50px', minWidth: '180px' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentEntity.id}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="absolute left-0 top-1/2 -translate-y-1/2"
                        >
                            <Link href={`/topic/${currentEntity.slug}`}>
                                <MiniEntityCard entity={currentEntity} />
                            </Link>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* CTA */}
            <Link
                href={`/topic/${currentEntity.slug}`}
                className="inline-flex items-center font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors"
                style={{ height: '36px', padding: '0 14px', fontSize: '13px' }}
            >
                Join the conversation
                <ArrowRight className="shrink-0" style={{ width: '14px', height: '14px', marginLeft: '6px' }} />
            </Link>

            {/* Trust indicator */}
            <div className="flex items-center mt-6" style={{ gap: '6px' }}>
                <div className="flex" style={{ marginLeft: '4px' }}>
                    {['bg-emerald-500', 'bg-blue-500', 'bg-purple-500'].map((color, i) => (
                        <div
                            key={i}
                            className={`rounded-full ${color}`}
                            style={{ width: '8px', height: '8px', marginLeft: i > 0 ? '-3px' : '0' }}
                        />
                    ))}
                </div>
                <span className="text-slate-400 dark:text-neutral-500" style={{ fontSize: '11px' }}>
                    2.7k+ topics • 15k+ takes
                </span>
            </div>
        </div>
    );
}
