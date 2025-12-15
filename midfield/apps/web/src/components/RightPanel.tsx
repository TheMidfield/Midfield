import { TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/Button";

export function RightPanel() {
    const trending = [
        { id: 1, tag: "Messi", posts: "1.2k" },
        { id: 2, tag: "ChampionsLeague", posts: "54k" },
        { id: 3, tag: "TransferNews", posts: "8.9k" },
        { id: 4, tag: "Mourinho", posts: "3.4k" },
    ];

    const suggested = [
        { id: 1, name: "Fabrizio Romano", handle: "@fabriziorom" },
        { id: 2, name: "Premier League", handle: "@premierleague" },
    ];

    return (
        <div className="w-full space-y-6">
            {/* Search Widget could go here */}

            {/* Trending Widget */}
            <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-extrabold text-lg flex items-center gap-2 text-slate-900 dark:text-neutral-100">
                        <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        Trending
                    </h3>
                </div>
                <div className="space-y-1">
                    {trending.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 rounded-md hover:bg-slate-50 dark:hover:bg-neutral-800 group cursor-pointer transition-colors">
                            <span className="text-lg font-black text-slate-300 dark:text-neutral-600 w-4 text-center group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                                {index + 1}
                            </span>
                            <div className="flex-1">
                                <div className="font-bold text-slate-900 dark:text-neutral-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">#{item.tag}</div>
                                <div className="text-xs font-medium text-slate-400 dark:text-neutral-500">{item.posts} posts</div>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 dark:text-neutral-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all">
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-neutral-800">
                    <Button variant="ghost" className="w-full">
                        Show more
                    </Button>
                </div>
            </div>

            {/* Predicted to Follow */}
            <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-6">
                <h3 className="font-extrabold text-lg mb-4 text-slate-900 dark:text-neutral-100">Who to follow</h3>
                <div className="space-y-4">
                    {suggested.map((user) => (
                        <div key={user.id} className="flex items-center gap-3 cursor-pointer group">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center border border-slate-200 dark:border-neutral-700 group-hover:border-slate-300 dark:group-hover:border-neutral-600 transition-colors">
                                <span className="font-bold text-slate-400 dark:text-neutral-500 text-xs">{user.name.substring(0, 2).toUpperCase()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm text-slate-900 dark:text-neutral-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{user.name}</div>
                                <div className="text-xs font-semibold text-slate-400 dark:text-neutral-500 truncate">{user.handle}</div>
                            </div>
                            <Button variant="pill" size="pill-sm">
                                Follow
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
