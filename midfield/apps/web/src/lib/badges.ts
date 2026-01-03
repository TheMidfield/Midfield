import {
    IconCrown,
    IconTrophy,
    IconMedal,
    IconBolt,
    IconShoe,
    IconBuildingStadium,
    IconGitBranchDeleted,
    IconCircleDashedNumber3
} from "@tabler/icons-react";

export interface BadgeMetadata {
    title: string;
    description: string;
    unlockRequirement: string; // How to unlock this badge
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
        unlockRequirement: 'Be among the first 11 users to join Midfield',
        icon: IconCrown,
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
        unlockRequirement: 'Be among the first 100 users to join Midfield',
        icon: IconTrophy,
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
        unlockRequirement: 'Be among the first 1,000 users to join Midfield',
        icon: IconMedal,
        color: 'blue',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-600 dark:text-blue-400',
        category: 'membership',
        rank: 1
    },

    // ENGAGEMENT & QUALITY
    'trendsetter': {
        title: 'Playmaker',
        description: 'You started the conversation! Awarded for being the first to post a take on any topic.',
        unlockRequirement: 'Be the first to post a take on any topic page',
        icon: IconShoe,
        color: 'emerald',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        border: 'border-emerald-200 dark:border-emerald-800',
        text: 'text-emerald-600 dark:text-emerald-400',
        category: 'engagement',
        rank: 1
    },

    // SOCIAL & COMMUNITY
    'playmaker': {
        title: 'Crowd Provoker',
        description: 'Got the crowd going. You received your first reaction from another user.',
        unlockRequirement: 'Receive your first reaction on any of your takes',
        icon: IconBuildingStadium,
        color: 'rose',
        bg: 'bg-rose-100 dark:bg-rose-900/30',
        border: 'border-rose-200 dark:border-rose-800',
        text: 'text-rose-600 dark:text-rose-400',
        category: 'social',
        rank: 1
    },
    'hat-trick': {
        title: 'Hat-Trick',
        description: 'Triple threat! You received 3 replies on your takes.',
        unlockRequirement: 'Receive 3 replies on your takes',
        icon: IconCircleDashedNumber3,
        color: 'orange',
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        border: 'border-orange-200 dark:border-orange-800',
        text: 'text-orange-600 dark:text-orange-400',
        category: 'social',
        rank: 2
    },
    'influencer': {
        title: 'Regista',
        description: 'Deep playmaker. You received your first reply from another user.',
        unlockRequirement: 'Receive your first reply on any of your takes',
        icon: IconGitBranchDeleted,
        color: 'indigo',
        bg: 'bg-indigo-100 dark:bg-indigo-900/30',
        border: 'border-indigo-200 dark:border-indigo-800',
        text: 'text-indigo-600 dark:text-indigo-400',
        category: 'social',
        rank: 3
    }
};

