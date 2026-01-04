import React from "react";
import { Metadata } from "next";
import { IconHierarchy2, IconMessagePlus, IconBallFootball } from "@tabler/icons-react";

export const metadata: Metadata = {
    title: "About | Midfield",
    description: "A football discussion platform for fans.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-neutral-900 pt-32 pb-24">
            <div className="rounded-md" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: '0 24px' }}>

                <div className="text-center mb-10">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-3 font-display">
                        About Midfield
                    </h1>
                    <p className="text-slate-600 dark:text-neutral-400">
                        A place for conversation around the beautiful game
                    </p>
                </div>

                <div className="space-y-6 mb-12">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                            <IconHierarchy2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-neutral-100 mb-1">One topic for every player, club, and league</h4>
                            <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
                                All discussion about them lives on a single page. No searching through endless threads — everything is organized.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                            <IconMessagePlus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-neutral-100 mb-1">Share your Take</h4>
                            <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
                                Everyone has an opinion on the game. Whether it's a hot take or a measured analysis, this is where you share it.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                            <IconBallFootball className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-neutral-100 mb-1">Simple football discussion</h4>
                            <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
                                No clutter, no noise. Just fans talking about the sport they love.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-200 dark:border-neutral-800 text-center">
                    <p className="text-sm text-slate-500 dark:text-neutral-500 mb-3">
                        Built by a small team of football fans.
                    </p>
                    <p className="text-sm text-slate-600 dark:text-neutral-400">
                        Questions? <a href="mailto:team.midfield@gmail.com" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">team.midfield@gmail.com</a>
                    </p>
                </div>

            </div>
        </div>
    );
}
