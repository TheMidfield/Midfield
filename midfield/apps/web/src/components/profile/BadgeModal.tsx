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
            <DialogContent>
                {badge && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', maxWidth: '100%' }}>
                        <div
                            className={`${badge.bg} border ${badge.border} ${!isUnlocked ? 'opacity-50' : ''}`}
                            style={{
                                width: '80px',
                                height: '80px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '24px',
                                borderRadius: '24px', // Softer radius for larger size
                                position: 'relative'
                            }}
                        >
                            {(() => {
                                const Icon = badge.icon;
                                return <Icon className={`w-10 h-10 ${badge.text}`} strokeWidth={1.5} />;
                            })()}
                            {!isUnlocked && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 rounded-3xl">
                                    <Lock className="w-6 h-6 text-slate-900 dark:text-white" />
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '24px', width: '100%' }}>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">{badge.title}</h2>
                            <p className="text-base text-slate-500 dark:text-neutral-400" style={{ maxWidth: '280px', lineHeight: '1.5' }}>
                                {badge.description}
                            </p>

                            {/* Show unlock requirement if locked */}
                            {!isUnlocked && (
                                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg w-full max-w-[280px]">
                                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-2">How to Unlock</p>
                                    <p className="text-sm text-amber-900 dark:text-amber-200">
                                        {badge.unlockRequirement}
                                    </p>
                                </div>
                            )}
                        </div>
                        <Button
                            onClick={onClose}
                            size="lg"
                            style={{ width: '100%', maxWidth: '200px' }}
                        >
                            {isUnlocked ? 'Nice!' : 'Got it!'}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
