import dbData from "./mock-db/db.json";
import { Topic } from "@midfield/types";

// Type assertion since the JSON import might be inferred loosely
const MOCK_TOPICS = dbData.topics as unknown as Topic[];

export const getTopics = async (): Promise<Topic[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return MOCK_TOPICS;
};

export const getTopicBySlug = async (slug: string): Promise<Topic | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return MOCK_TOPICS.find(t => t.slug === slug);
};

export const getAllTopics = async (): Promise<Topic[]> => {
    // Simulate network
    await new Promise((resolve) => setTimeout(resolve, 50));
    return MOCK_TOPICS;
};

export const getTopicsByType = async (type: 'club' | 'player'): Promise<Topic[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return MOCK_TOPICS.filter(t => t.type === type);
};

export const getPlayersByClub = async (clubId: string): Promise<Topic[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return MOCK_TOPICS.filter(t => t.type === 'player' && t.metadata?.club_id === clubId);
};
