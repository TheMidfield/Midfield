import useSWR from 'swr';
import { getTrendingTopicsData, getMatchCenterData, type TrendingTopic, type MatchCenterFixture } from '@/app/actions/fetch-widget-data';
import { getHeroTakes, type HeroTake } from '@/app/actions/hero-data';

// SWR configuration
const swrConfig = {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // 1 minute
};

/**
 * Hook for trending topics with 5-minute cache
 */
export function useTrendingTopics() {
    return useSWR<TrendingTopic[]>(
        'trending-topics',
        () => getTrendingTopicsData(),
        {
            ...swrConfig,
            refreshInterval: 5 * 60 * 1000, // 5 minutes
        }
    );
}

/**
 * Hook for match center with 10-minute cache
 */
export function useMatchCenter(limit: number = 5) {
    return useSWR<MatchCenterFixture[]>(
        ['match-center', limit],
        () => getMatchCenterData(limit),
        {
            ...swrConfig,
            refreshInterval: 10 * 60 * 1000, // 10 minutes
        }
    );
}

/**
 * Hook for hero takes
 * Uses Realtime for instant updates, no polling needed
 */
export function useHeroTakes(limit: number = 6) {
    return useSWR<HeroTake[]>(
        ['hero-takes', limit],
        () => getHeroTakes(limit),
        {
            revalidateOnFocus: true,      // Refresh when tab focused
            revalidateOnReconnect: true,   // Refresh on network reconnect
            refreshInterval: 0,            // No polling - Realtime handles updates
            dedupingInterval: 500,         // Allow rapid updates (500ms)
        }
    );
}
