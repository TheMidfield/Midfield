import { Crown, Medal, Trophy, Zap } from "lucide-react";

export const BADGE_INFO: Record<string, { title: string, description: string, icon: any, color: string, bg: string, border: string, text: string }> = {
    'trendsetter': {
        title: 'Trendsetter',
        description: 'You started the conversation! Awarded for being the first to post a take on any topic.',
        icon: Zap,
        color: 'emerald',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        border: 'border-emerald-200 dark:border-emerald-800',
        text: 'text-emerald-600 dark:text-emerald-400'
    },
    'original-10': {
        title: 'Starting XI',
        description: 'Legendary status. You were one of the first 11 users to join Midfield.',
        icon: Crown,
        color: 'amber',
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        border: 'border-amber-200 dark:border-amber-800',
        text: 'text-amber-600 dark:text-amber-400'
    },
    'club-100': {
        title: 'Club 100',
        description: 'Early adopter. You were among the first 100 users on the platform.',
        icon: Trophy,
        color: 'purple',
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        border: 'border-purple-200 dark:border-purple-800',
        text: 'text-purple-600 dark:text-purple-400'
    },
    'club-1000': {
        title: 'Club 1k',
        description: 'Founding Member. You joined with the first 1000 users.',
        icon: Medal,
        color: 'blue',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-600 dark:text-blue-400'
    }
};
