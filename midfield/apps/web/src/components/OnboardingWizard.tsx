"use client";

import { useState, useTransition } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Card } from "./ui/Card";
import { Shield, User, Check, ArrowRight, Upload, X, Globe } from "lucide-react";
import NextImage from "next/image";
import { createClient } from "@/lib/supabase/client";

interface OnboardingWizardProps {
    userId: string;
    userEmail?: string;
    onComplete: () => void;
}

import { FavoriteClubSelector, type Club } from "./onboarding/FavoriteClubSelector";

export function OnboardingWizard({ userId, userEmail, onComplete }: OnboardingWizardProps) {
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [selectedClub, setSelectedClub] = useState<Club | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    // Validate and check username availability
    const validateUsername = async (value: string) => {
        const cleaned = value.trim().toLowerCase();

        if (!cleaned) {
            setError("Username is required");
            return false;
        }

        if (cleaned.length < 3) {
            setError("Username must be at least 3 characters");
            return false;
        }

        if (!/^[a-z0-9_]+$/.test(cleaned)) {
            setError("Only letters, numbers, and underscores allowed");
            return false;
        }

        setIsCheckingUsername(true);
        const supabase = createClient();
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('username', cleaned)
            .neq('id', userId) // exclude current user if reusing logic
            .maybeSingle();

        setIsCheckingUsername(false);

        if (existing) {
            setError("Username is already taken");
            return false;
        }

        setError(null);
        return true;
    };

    const handleNextStep = async () => {
        if (step === 1) {
            const isValid = await validateUsername(username);
            if (!isValid) return;

            await new Promise(resolve => setTimeout(resolve, 0)); // No-op for now
            setStep(2);
        } else if (step === 2) {
            // Complete onboarding
            startTransition(async () => {
                const supabase = createClient();
                const { error: updateError } = await supabase
                    .from('users')
                    .update({
                        username: username.trim(),
                        avatar_url: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                        favorite_club_id: selectedClub?.id || null,
                        onboarding_completed: true
                    })
                    .eq('id', userId);

                if (updateError) {
                    setError(updateError.message);
                } else {
                    onComplete();
                }
            });
        }
    };



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <Card className="max-h-[90vh] overflow-hidden" style={{ width: 'calc(100% - 2rem)', maxWidth: '768px' }}>
                {/* Progress Bar */}
                <div className="h-1.5 bg-slate-200 dark:bg-neutral-800">
                    <div
                        className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300"
                        style={{ width: `${(step / 2) * 100}%` }}
                    />
                </div>

                <div className="p-6 sm:p-8 min-h-[520px] flex flex-col justify-center relative">
                    {/* Step 1: Username & Avatar */}
                    {step === 1 && (
                        <div className="space-y-6 w-full animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Header */}
                            <div className="text-center space-y-2">
                                <div className="w-14 h-14 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                                    <User className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">
                                    Welcome to Midfield! ⚽
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-neutral-400">
                                    Let's set up your profile
                                </p>
                            </div>

                            {/* Form */}
                            <div className="space-y-5">
                                {/* Avatar Upload */}
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-md bg-slate-100 dark:bg-neutral-800 border-2 border-slate-200 dark:border-neutral-700 overflow-hidden shrink-0">
                                        {avatarUrl ? (
                                            <NextImage src={avatarUrl} alt="Avatar" width={80} height={80} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-neutral-500">
                                                <User className="w-10 h-10" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1.5">
                                            Profile Picture (Optional)
                                        </label>
                                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-neutral-700 transition-all text-sm font-medium shadow-sm hover:shadow-md">
                                            <Upload className="w-4 h-4" />
                                            <span>Upload Image</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setAvatarUrl(reader.result as string);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>

                                    </div>
                                </div>

                                {/* Username */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-neutral-300 mb-2">
                                        Choose Your Username *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 font-bold text-base select-none pointer-events-none">
                                            @
                                        </span>
                                        <Input
                                            type="text"
                                            value={username}
                                            onChange={(e) => {
                                                const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                                                setUsername(val);
                                                if (error) setError(null);
                                            }}
                                            placeholder="your_username"
                                            maxLength={20}
                                            required
                                            className={`text-base pl-9 font-medium tracking-wide border-2 bg-white dark:bg-neutral-800 rounded-md transition-colors w-full
                                                ${error
                                                    ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-500'
                                                    : 'border-slate-200 dark:border-neutral-700 hover:border-emerald-300 dark:hover:border-emerald-700 focus:border-emerald-500 dark:focus:border-emerald-500'
                                                }
                                            `}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-neutral-500 mt-1.5">
                                        Letters, numbers, and underscores • 3-20 characters
                                    </p>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-md">
                                        <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <Button
                                onClick={handleNextStep}
                                disabled={!username || isCheckingUsername}
                                className="w-full h-12 text-base font-semibold"
                                size="lg"
                            >
                                {isCheckingUsername ? "Checking availability..." : "Continue"}
                                {!isCheckingUsername && <ArrowRight className="w-5 h-5 ml-2" />}
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Favorite Club */}
                    {step === 2 && (
                        <div className="space-y-6 relative w-full animate-in fade-in slide-in-from-right-4 duration-300 pt-2">
                            {/* Corner Badge */}
                            <div className="absolute -top-2 -right-2 sm:right-0 hidden sm:block">
                                <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50 shadow-sm animate-in fade-in slide-in-from-top-1">
                                    <Globe className="w-3 h-3" />
                                    Top 5 Leagues - More Coming Soon!
                                </span>
                            </div>

                            {/* Header */}
                            <div className="text-center space-y-2">
                                <div className="w-14 h-14 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                                    <Shield className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">
                                    Choose Your Club
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-neutral-400">
                                    Select your favorite team
                                </p>
                            </div>

                            <FavoriteClubSelector
                                onSelect={(club) => {
                                    setSelectedClub(club);
                                    setError(null);
                                }}
                                initialClubId={selectedClub?.id}
                            />

                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-md">
                                    <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setStep(1)}
                                    variant="ghost"
                                    className="flex-1 h-12"
                                    disabled={isPending}
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={handleNextStep}
                                    disabled={isPending}
                                    className="flex-1 h-12 text-base font-semibold"
                                    size="lg"
                                >
                                    {isPending ? "Saving..." : selectedClub ? "Complete" : "Skip"}
                                    <Check className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
