"use server";

import { getAllTopics } from "@midfield/logic/src/topics";

export async function searchTopics(query: string) {
    if (!query || query.length < 2) return [];

    const all = await getAllTopics();
    const lowerQ = query.toLowerCase();

    return all.filter(t =>
        t.title.toLowerCase().includes(lowerQ)
    ).slice(0, 5); // Limit results
}
