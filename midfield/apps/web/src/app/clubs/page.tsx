import { getTopicsByType } from "@midfield/logic/src/topics";
import Link from "next/link";
import { Shield } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";


export default async function ClubsPage() {
    const clubs = await getTopicsByType('club');

    // Sort clubs alphabetically
    const sortedClubs = clubs.sort((a, b) => a.title.localeCompare(b.title));

    return (
        <div className="w-full">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <Shield className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-neutral-100">
                        Clubs
                    </h1>
                    <p className="text-slate-500 dark:text-neutral-400 font-medium mt-1">
                        Browse football clubs from top leagues
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedClubs.map((club: any) => (
                    <Link key={club.id} href={`/topic/${club.slug}`}>
                        <Card variant="interactive" className="p-5 flex items-center gap-4 group h-full">
                            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                                <img
                                    src={club.metadata?.badge_url}
                                    alt={club.title}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                    {club.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <Badge variant="secondary" className="text-[10px] truncate max-w-full">
                                        {club.metadata?.league?.replace(/^(English|Spanish|Italian|German|French)\s/, '') || "League"}
                                    </Badge>
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
