"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Smile, Shield, Sparkles, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Notification } from "@/app/actions/notifications";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
    notification: Notification;
    onRead: () => void;
    onNavigate: () => void;
    onWelcomeClick: () => void;
    onBadgeClick: (badgeId: string) => void;
}

export function NotificationItem({ notification, onRead, onNavigate, onWelcomeClick, onBadgeClick }: NotificationItemProps) {
    const isRead = notification.is_read;
    const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

    const baseClasses = "flex items-center gap-3 p-3 sm:p-2.5 rounded-md transition-colors cursor-pointer hover:bg-slate-100 dark:hover:bg-neutral-800/50 active:bg-slate-200 dark:active:bg-neutral-700/50";

    const UnreadDot = () => !isRead ? (
        <div className="w-2 h-2 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500 shrink-0" />
    ) : <div className="w-2 sm:w-1.5 shrink-0" />;

    const getTypeIcon = () => {
        switch (notification.type) {
            case 'reply':
                return MessageSquare;
            case 'upvote':
                return Smile;
            case 'badge_received':
                return Shield;
            case 'system_welcome':
                return Sparkles;
            default:
                return MessageSquare;
        }
    };

    const Icon = getTypeIcon();

    const EntityImage = () => {
        const entity = notification.entity;
        const hasImage = entity?.imageUrl;

        return (
            <div className="relative shrink-0">
                <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-md bg-slate-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                    {hasImage ? (
                        entity.type === 'player' ? (
                            // Player cutout: zoom on face with buffer at top
                            // pt-1 gives top buffer, items-end pushes image down
                            <div className="w-full h-full flex items-end justify-center pt-1 overflow-hidden">
                                <Image
                                    src={entity.imageUrl!}
                                    alt={entity.title}
                                    width={80}
                                    height={80}
                                    className="w-[180%] h-auto object-contain"
                                    unoptimized
                                />
                            </div>
                        ) : (
                            <Image
                                src={entity.imageUrl!}
                                alt={entity.title}
                                width={48}
                                height={48}
                                className="object-contain p-1"
                                unoptimized
                            />
                        )
                    ) : (
                        <User className="w-6 h-6 sm:w-5 sm:h-5 text-slate-400 dark:text-neutral-600" />
                    )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 sm:w-4 sm:h-4 rounded-md bg-slate-700 dark:bg-neutral-600 flex items-center justify-center">
                    <Icon className="w-3 h-3 sm:w-2.5 sm:h-2.5 text-white" />
                </div>
            </div>
        );
    };

    const renderContent = () => {
        switch (notification.type) {
            case 'reply':
                return (
                    <>
                        <EntityImage />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-[13px] text-slate-700 dark:text-neutral-300 leading-snug">
                                <span className="font-semibold text-slate-900 dark:text-neutral-100">@{notification.actor?.username}</span> replied to your take
                            </p>
                            <p className="text-xs sm:text-[11px] text-slate-500 dark:text-neutral-500 mt-1 sm:mt-0.5">{timeAgo}</p>
                        </div>
                        <UnreadDot />
                    </>
                );
            case 'upvote':
                return (
                    <>
                        <EntityImage />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-[13px] text-slate-700 dark:text-neutral-300 leading-snug">
                                <span className="font-semibold text-slate-900 dark:text-neutral-100">@{notification.actor?.username}</span> reacted to your take
                            </p>
                            <p className="text-xs sm:text-[11px] text-slate-500 dark:text-neutral-500 mt-1 sm:mt-0.5">{timeAgo}</p>
                        </div>
                        <UnreadDot />
                    </>
                );
            case 'badge_received':
                const badgeText = notification.resource_slug
                    ? notification.resource_slug.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                    : 'New Badge';
                return (
                    <>
                        <div className="shrink-0 w-12 h-12 sm:w-10 sm:h-10 rounded-md bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                            <Shield className="w-6 h-6 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-[13px] text-slate-700 dark:text-neutral-300 leading-snug">
                                You unlocked <span className="font-semibold text-amber-700 dark:text-amber-400">{badgeText}</span>
                            </p>
                            <p className="text-xs sm:text-[11px] text-slate-500 dark:text-neutral-500 mt-1 sm:mt-0.5">{timeAgo}</p>
                        </div>
                        <UnreadDot />
                    </>
                );
            case 'system_welcome':
                return (
                    <>
                        <div className="shrink-0 w-12 h-12 sm:w-10 sm:h-10 rounded-md bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-[13px] font-semibold text-slate-900 dark:text-neutral-100">
                                Welcome to Midfield!
                            </p>
                            <p className="text-xs sm:text-[11px] text-slate-500 dark:text-neutral-500 mt-1 sm:mt-0.5">Let's get you started</p>
                        </div>
                        <UnreadDot />
                    </>
                );
            default:
                return null;
        }
    };

    // Modal-type notifications: DO NOT close sidebar
    if (notification.type === 'system_welcome') {
        return (
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onWelcomeClick();
                }}
                className={baseClasses}
            >
                {renderContent()}
            </div>
        );
    }

    if (notification.type === 'badge_received') {
        const badgeId = notification.resource_slug || '';
        return (
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onBadgeClick(badgeId);
                }}
                className={baseClasses}
            >
                {renderContent()}
            </div>
        );
    }

    // Navigation notifications: go to the post directly with highlight
    // resource_id contains the post ID, resource_slug contains the topic slug
    const postId = notification.resource_id;
    const href = notification.resource_slug
        ? `/topic/${notification.resource_slug}${postId ? `?post=${postId}` : ''}`
        : '#';

    return (
        <Link
            href={href}
            onClick={() => { onRead(); onNavigate(); }}
            className={baseClasses}
        >
            {renderContent()}
        </Link>
    );
}
