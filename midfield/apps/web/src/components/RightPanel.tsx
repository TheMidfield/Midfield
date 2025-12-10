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
        <aside className="hidden lg:block w-[320px] shrink-0 sticky top-20 h-fit space-y-6">
            {/* Search Widget could go here */}

            {/* Trending Widget */}
            <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Trending
                    </h3>
                </div>
                <div className="space-y-4">
                    {trending.map((item) => (
                        <div key={item.id} className="flex justify-between items-center group cursor-pointer">
                            <div>
                                <div className="font-semibold text-foreground group-hover:text-primary transition-colors">#{item.tag}</div>
                                <div className="text-xs text-muted-foreground">{item.posts} posts</div>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-muted/50 rounded-full transition-all">
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>
                    ))}
                </div>
                <button className="w-full mt-4 py-2 text-sm text-primary font-medium hover:bg-primary/5 rounded-lg transition-colors">
                    Show more
                </button>
            </div>

            {/* Suggested to Follow */}
            <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Who to follow</h3>
                <div className="space-y-4">
                    {suggested.map((user) => (
                        <div key={user.id} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-linear-to-bl from-gray-200 to-gray-400" />
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold truncate">{user.name}</div>
                                <div className="text-xs text-muted-foreground truncate">{user.handle}</div>
                            </div>
                            <button className="px-3 py-1.5 text-xs font-semibold bg-foreground text-background rounded-full hover:opacity-90 transition-opacity">
                                Follow
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-xs text-muted-foreground px-4 text-center leading-loose">
                Privacy · Terms · Cookies · Midfield © 2024
            </div>
        </aside>
    );
}
