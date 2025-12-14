"use server";

import { getAllTopics } from "@midfield/logic/src/topics";

export async function searchTopics(query: string, type?: string) {
    if (!query || query.length < 2) return [];

    const all = await getAllTopics();
    const lowerQ = query.toLowerCase();

    return all.filter(t => {
        const matchesQuery = t.title.toLowerCase().includes(lowerQ);
        const matchesType = type ? t.type === type : true;
        return matchesQuery && matchesType;
    }).slice(0, 5); // Limit results
}
