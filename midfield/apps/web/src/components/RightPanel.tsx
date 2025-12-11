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
        <aside className="hidden lg:block w-[320px] shrink-0 sticky top-24 h-fit space-y-8">
            {/* Search Widget could go here */}

            {/* Trending Widget */}
            <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-[24px] p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-extrabold text-lg flex items-center gap-2 text-slate-900 dark:text-neutral-100">
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                        Trending
                    </h3>
                </div>
                <div className="space-y-1">
                    {trending.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800 group cursor-pointer transition-colors">
                            <span className="text-lg font-black text-slate-300 dark:text-neutral-600 w-4 text-center group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors">
                                {index + 1}
                            </span>
                            <div className="flex-1">
                                <div className="font-bold text-slate-900 dark:text-neutral-100 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">#{item.tag}</div>
                                <div className="text-xs font-medium text-slate-400 dark:text-neutral-500">{item.posts} posts</div>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 dark:text-neutral-500 group-hover:text-green-600 dark:group-hover:text-green-400 transition-all">
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
                <button className="w-full mt-4 py-2.5 text-sm text-slate-500 dark:text-neutral-400 font-bold hover:text-slate-900 dark:hover:text-slate-100 transition-colors border-t border-slate-200 dark:border-neutral-800">
                    Show more
                </button>
            </div>

            {/* Predicted to Follow */}
            <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-[24px] p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-300">
                <h3 className="font-extrabold text-lg mb-4 text-slate-900 dark:text-neutral-100">Who to follow</h3>
                <div className="space-y-4">
                    {suggested.map((user) => (
                        <div key={user.id} className="flex items-center gap-3 cursor-pointer group">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center border border-slate-200 dark:border-neutral-700 group-hover:bg-slate-200 dark:group-hover:bg-neutral-700 transition-colors">
                                <span className="font-bold text-slate-400 dark:text-neutral-500 text-xs">{user.name.substring(0, 2).toUpperCase()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm text-slate-900 dark:text-neutral-100 truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{user.name}</div>
                                <div className="text-xs font-semibold text-slate-400 dark:text-neutral-500 truncate">{user.handle}</div>
                            </div>
                            <Button variant="pill" size="pill-sm">
                                Follow
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-medium text-slate-400 dark:text-neutral-500 px-4 justify-center">
                <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 hover:underline">Privacy</a>
                <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 hover:underline">Terms</a>
                <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 hover:underline">Cookies</a>
                <span className="text-slate-300 dark:text-neutral-600">Midfield © 2024</span>
            </div>
        </aside>
    );
}
