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
    'starting_xi': {
        title: 'Starting XI',
        description: 'Legendary status. You were among the first 11 users to join Midfield.',
        unlockRequirement: 'Be among the first 11 users to join Midfield',
        icon: IconCrown,
        color: 'amber',
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        border: 'border-amber-200 dark:border-amber-800',
        text: 'text-amber-600 dark:text-amber-400',
        category: 'membership',
        rank: 3
    },
    'club_100': {
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
    'club_1k': {
        title: 'Club 1k',
        description: 'Founding member. You joined with the first 1,000 users.',
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
        description: 'You started the conversation. The first to open a take on any topic page.',
        unlockRequirement: 'Be the first to post a take on any topic page',
        icon: IconShoe,
        color: 'emerald',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-200 dark:border-emerald-700',
        text: 'text-emerald-700 dark:text-emerald-400',
        category: 'engagement',
        rank: 1
    },

    // SOCIAL & COMMUNITY
    'playmaker': {
        title: 'Crowd Provoker',
        description: 'You got the crowd going. First reaction received from another user.',
        unlockRequirement: 'Receive your first reaction on any of your takes',
        icon: IconBuildingStadium,
        color: 'sky',
        bg: 'bg-sky-50 dark:bg-sky-900/20',
        border: 'border-sky-200 dark:border-sky-700',
        text: 'text-sky-700 dark:text-sky-400',
        category: 'social',
        rank: 1
    },
    'hat-trick': {
        title: 'Hat-Trick',
        description: 'Triple threat. You received 3 replies on your takes.',
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
        description: 'Deep-lying playmaker. First reply received from another user.',
        unlockRequirement: 'Receive your first reply on any of your takes',
        icon: IconGitBranchDeleted,
        color: 'violet',
        bg: 'bg-violet-50 dark:bg-violet-900/20',
        border: 'border-violet-200 dark:border-violet-700',
        text: 'text-violet-700 dark:text-violet-400',
        category: 'social',
        rank: 3
    }
};

// Order for displaying badges on profile
export const BADGE_DISPLAY_ORDER = [
    'starting_xi',    // Starting XI
    'club_100',       // Club 100
    'club_1k',        // Club 1k
    'trendsetter',    // Playmaker
    'playmaker',      // Crowd Provoker
    'influencer',     // Regista
    'hat-trick'       // Hat-Trick
];
