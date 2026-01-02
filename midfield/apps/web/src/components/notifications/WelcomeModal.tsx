"use client";

import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Shield, TrendingUp, Users } from "lucide-react";
import { Logo } from "@/components/Logo";

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-0 overflow-hidden">
                {/* Hero Header */}
                <div className="relative h-32 bg-emerald-600 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>

                    <div className="relative flex flex-col items-center z-10 animate-hero-pop">
                        <Logo className="w-12 h-12 text-white mb-2" />
                        <h2 className="font-display font-bold text-2xl text-white tracking-tight">Welcome to Midfield</h2>
                    </div>
                </div>

                <div className="p-6">
                    <p className="text-center text-slate-600 dark:text-neutral-300 mb-6 text-sm leading-relaxed">
                        You've joined the intelligent football platform designed for the modern fan.
                        Here's what you can do:
                    </p>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-neutral-100">Intelligent Stats</h4>
                                <p className="text-xs text-slate-500 dark:text-neutral-400">Deep dive into player and club data.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-neutral-100">Community Takes</h4>
                                <p className="text-xs text-slate-500 dark:text-neutral-400">Share your analysis and join the debate.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-neutral-100">Live Trends</h4>
                                <p className="text-xs text-slate-500 dark:text-neutral-400">See who's performing right now.</p>
                            </div>
                        </div>
                    </div>

                    <Button onClick={onClose} className="w-full font-semibold" size="lg">
                        Let's Kick Off
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
