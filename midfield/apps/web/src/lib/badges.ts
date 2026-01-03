import { Crown, Medal, Trophy, Zap, MessageSquare, Heart, Share2, Star, Flame } from "lucide-react";

export interface BadgeMetadata {
    title: string;
    description: string;
    icon: any;
    color: string;
    bg: string;
    border: string;
    text: string;
    category: 'membership' | 'engagement' | 'social';
    rank: number; // Higher number = more prestigious/successor
}

export const BADGE_INFO: Record<string, BadgeMetadata> = {
    // MEMBERSHIP TIER (Mutually Exclusive)
    'original-10': {
        title: 'Starting XI',
        description: 'Legendary status. You were one of the first 11 users to join Midfield.',
        icon: Crown,
        color: 'amber',
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        border: 'border-amber-200 dark:border-amber-800',
        text: 'text-amber-600 dark:text-amber-400',
        category: 'membership',
        rank: 3
    },
    'club-100': {
        title: 'Club 100',
        description: 'Early adopter. You were among the first 100 users on the platform.',
        icon: Trophy,
        color: 'purple',
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        border: 'border-purple-200 dark:border-purple-800',
        text: 'text-purple-600 dark:text-purple-400',
        category: 'membership',
        rank: 2
    },
    'club-1000': {
        title: 'Club 1k',
        description: 'Founding Member. You joined with the first 1000 users.',
        icon: Medal,
        color: 'blue',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-600 dark:text-blue-400',
        category: 'membership',
        rank: 1
    },

    // ENGAGEMENT & QUALITY
    'trendsetter': {
        title: 'Trendsetter',
        description: 'You started the conversation! Awarded for being the first to post a take on any topic.',
        icon: Zap,
        color: 'emerald',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        border: 'border-emerald-200 dark:border-emerald-800',
        text: 'text-emerald-600 dark:text-emerald-400',
        category: 'engagement',
        rank: 1
    },

    // SOCIAL & COMMUNITY
    'playmaker': {
        title: 'Playmaker',
        description: 'Driving the play. You received your first reaction from another user.',
        icon: Heart,
        color: 'rose',
        bg: 'bg-rose-100 dark:bg-rose-900/30',
        border: 'border-rose-200 dark:border-rose-800',
        text: 'text-rose-600 dark:text-rose-400',
        category: 'social',
        rank: 1
    },
    'hat-trick': {
        title: 'Hat-Trick',
        description: 'Quality confirmed. One of your takes received 3 reactions.',
        icon: Flame,
        color: 'orange',
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        border: 'border-orange-200 dark:border-orange-800',
        text: 'text-orange-600 dark:text-orange-400',
        category: 'social',
        rank: 2
    },
    'influencer': {
        title: 'Influencer',
        description: 'Enticed a debate. You received your first reply from another user.',
        icon: MessageSquare,
        color: 'indigo',
        bg: 'bg-indigo-100 dark:bg-indigo-900/30',
        border: 'border-indigo-200 dark:border-indigo-800',
        text: 'text-indigo-600 dark:text-indigo-400',
        category: 'social',
        rank: 3
    }
};
