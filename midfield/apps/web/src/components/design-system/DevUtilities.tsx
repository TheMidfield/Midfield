"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Zap, User } from "lucide-react";

export function DevUtilities() {
    return (
        <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <Zap className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-neutral-100">Onboarding Wizard</h3>
                        <p className="text-xs text-slate-500 dark:text-neutral-400">Test user onboarding flow</p>
                    </div>
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.dispatchEvent(new Event('dev:open-onboarding'))}
                >
                    Launch Wizard
                </Button>
            </Card>
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-neutral-100">Profile Page</h3>
                        <p className="text-xs text-slate-500 dark:text-neutral-400">View profile layout</p>
                    </div>
                </div>
                <a href="/design-system/profile-preview">
                    <Button variant="outline" size="sm" className="w-full">
                        View Profile Preview
                    </Button>
                </a>
            </Card>
        </div>
    );
}
