"use client";

import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { BADGE_INFO } from "@/lib/badges";
import { Lock } from "lucide-react";

interface BadgeModalProps {
    badgeId: string | null;
    onClose: () => void;
    isUnlocked?: boolean; // Whether the user has earned this badge
}

export function BadgeModal({ badgeId, onClose, isUnlocked = true }: BadgeModalProps) {
    const badge = badgeId ? BADGE_INFO[badgeId] : null;

    return (
        <Dialog open={!!badgeId} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[340px] sm:max-w-[360px]">
                {badge && (
                    <div className="flex flex-col items-center text-center">
                        {/* Badge Icon - Smaller */}
                        <div
                            className={`${badge.bg} border ${badge.border} ${!isUnlocked ? 'opacity-50' : ''} w-16 h-16 flex items-center justify-center rounded-2xl mb-4 relative`}
                        >
                            {(() => {
                                const Icon = badge.icon;
                                return <Icon className={`w-8 h-8 ${badge.text}`} strokeWidth={1.5} />;
                            })()}
                            {!isUnlocked && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 rounded-2xl">
                                    <Lock className="w-5 h-5 text-slate-900 dark:text-white" />
                                </div>
                            )}
                        </div>

                        {/* Title and Description - Smaller */}
                        <div className="flex flex-col items-center gap-2 mb-5">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-100">{badge.title}</h2>

                            {/* Show description ONLY if unlocked */}
                            {isUnlocked && (
                                <p className="text-sm text-slate-600 dark:text-neutral-400 max-w-[280px]">
                                    {badge.description}
                                </p>
                            )}

                            {/* Show unlock requirement ONLY if locked */}
                            {!isUnlocked && (
                                <div className="mt-2 p-3 rounded-lg w-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                    <p className="text-xs font-semibold uppercase tracking-wider mb-1.5 text-amber-800 dark:text-amber-300">
                                        How to Unlock
                                    </p>
                                    <p className="text-sm text-amber-900 dark:text-amber-200">
                                        {badge.unlockRequirement}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Button - Enthusiastic for earned, neutral for locked */}
                        <Button
                            onClick={onClose}
                            className="w-full max-w-40 cursor-pointer"
                            size="sm"
                            variant={isUnlocked ? "default" : "outline"}
                        >
                            {isUnlocked ? "Cool!" : "OK"}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
