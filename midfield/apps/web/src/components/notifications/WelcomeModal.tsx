"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { IconBallFootball, IconHierarchy2, IconBuildingStadium, IconMessagePlus, IconPlayFootball } from "@tabler/icons-react";
import { LogoBright } from "@/components/LogoBright";

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-emerald-600 border border-slate-200 dark:border-neutral-800 !p-0 !gap-0 overflow-hidden" closeButtonClassName="text-white/90 hover:text-white hover:bg-white/25 dark:text-white/90 dark:hover:bg-white/25">
                <DialogTitle className="sr-only">Welcome to Midfield</DialogTitle>
                {/* Hero Header - Grid pattern with strong emerald accents */}
                <div className="relative h-36 flex items-center justify-center overflow-hidden bg-emerald-600">
                    {/* Strong emerald spotlight - top left */}
                    <div
                        className="absolute pointer-events-none"
                        style={{
                            top: '-20%',
                            left: '-10%',
                            width: '200px',
                            height: '200px',
                            background: 'radial-gradient(circle, rgba(16, 255, 150, 0.4) 0%, transparent 70%)',
                            filter: 'blur(30px)',
                        }}
                    />
                    {/* Strong emerald spotlight - bottom right */}
                    <div
                        className="absolute pointer-events-none"
                        style={{
                            bottom: '-20%',
                            right: '-10%',
                            width: '180px',
                            height: '180px',
                            background: 'radial-gradient(circle, rgba(16, 255, 150, 0.35) 0%, transparent 70%)',
                            filter: 'blur(25px)',
                        }}
                    />
                    {/* Subtle vignette */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>

                    <div className="relative flex flex-col items-center z-10 animate-fade-in-up">
                        <LogoBright className="w-12 h-12 text-white mb-3" />
                        <h2 className="font-display font-bold text-2xl text-white tracking-tight text-center">Welcome to Midfield</h2>
                    </div>
                </div>

                <div className="px-8 pt-8 pb-6 bg-white dark:bg-neutral-900">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-slate-500 dark:text-neutral-400 mb-2">
                            <p className="text-sm font-normal leading-relaxed">
                                A place for conversation around the beautiful game
                            </p>
                            <IconBallFootball className="w-5 h-5 shrink-0" stroke={1.5} />
                        </div>
                        <h3 className="text-xs font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">getting started</h3>
                    </div>

                    <div className="space-y-6 mb-10">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                <IconHierarchy2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-neutral-100">One topic for every player, club, and league</h4>
                                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">All discussion about it lives on a single page.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                <IconBuildingStadium className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-neutral-100">See what people are saying</h4>
                                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">Read the latest takes and reactions.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                <IconMessagePlus className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-neutral-100">Add your take</h4>
                                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">Post your opinion and get responses.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Button onClick={onClose} className="px-12 font-semibold h-10 gap-2" size="lg">
                            Let's Kick Off
                            <IconPlayFootball className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
