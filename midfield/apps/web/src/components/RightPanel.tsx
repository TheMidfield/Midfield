import { TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

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
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 hover:border-slate-300 transition-colors duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-extrabold text-lg flex items-center gap-2 text-slate-900">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        Trending
                    </h3>
                </div>
                <div className="space-y-1">
                    {trending.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 group cursor-pointer transition-colors">
                            <span className="text-lg font-black text-slate-300 w-4 text-center group-hover:text-green-500 transition-colors">
                                {index + 1}
                            </span>
                            <div className="flex-1">
                                <div className="font-bold text-slate-900 group-hover:text-green-700 transition-colors">#{item.tag}</div>
                                <div className="text-xs font-medium text-slate-400">{item.posts} posts</div>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 group-hover:text-green-600 transition-all">
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
                <button className="w-full mt-4 py-2.5 text-sm text-slate-500 font-bold hover:text-slate-900 transition-colors border-t border-slate-100">
                    Show more
                </button>
            </div>

            {/* Predicted to Follow */}
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 hover:border-slate-300 transition-colors duration-300">
                <h3 className="font-extrabold text-lg mb-4 text-slate-900">Who to follow</h3>
                <div className="space-y-4">
                    {suggested.map((user) => (
                        <div key={user.id} className="flex items-center gap-3 cursor-pointer group">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-100 group-hover:bg-slate-200 transition-colors">
                                <span className="font-bold text-slate-400 text-xs">{user.name.substring(0, 2).toUpperCase()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm text-slate-900 truncate group-hover:text-green-600 transition-colors">{user.name}</div>
                                <div className="text-xs font-semibold text-slate-400 truncate">{user.handle}</div>
                            </div>
                            <button className="px-3 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
                                Follow
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-medium text-slate-400 px-4 justify-center">
                <a href="#" className="hover:text-slate-600 hover:underline">Privacy</a>
                <a href="#" className="hover:text-slate-600 hover:underline">Terms</a>
                <a href="#" className="hover:text-slate-600 hover:underline">Cookies</a>
                <span className="text-slate-300">Midfield © 2024</span>
            </div>
        </aside>
    );
}
