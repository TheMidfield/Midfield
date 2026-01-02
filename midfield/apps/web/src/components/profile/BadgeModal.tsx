"use client";

import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { BADGE_INFO } from "@/lib/badges";

interface BadgeModalProps {
    badgeId: string | null;
    onClose: () => void;
}

export function BadgeModal({ badgeId, onClose }: BadgeModalProps) {
    const badge = badgeId ? BADGE_INFO[badgeId] : null;

    return (
        <Dialog open={!!badgeId} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                {badge && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', maxWidth: '100%' }}>
                        <div
                            className={`${badge.bg} border ${badge.border}`}
                            style={{
                                width: '80px',
                                height: '80px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '24px',
                                borderRadius: '24px' // Softer radius for larger size
                            }}
                        >
                            {(() => {
                                const Icon = badge.icon;
                                return <Icon className={`w-10 h-10 ${badge.text}`} strokeWidth={1.5} />;
                            })()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '24px', width: '100%' }}>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">{badge.title}</h2>
                            <p className="text-base text-slate-500 dark:text-neutral-400" style={{ maxWidth: '280px', lineHeight: '1.5' }}>
                                {badge.description}
                            </p>
                        </div>
                        <Button
                            onClick={onClose}
                            size="lg"
                            style={{ width: '100%', maxWidth: '200px' }}
                        >
                            Nice!
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
