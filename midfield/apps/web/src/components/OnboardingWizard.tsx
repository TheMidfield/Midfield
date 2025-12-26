"use client";

import { useState, useTransition } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Card } from "./ui/Card";
import { Shield, User, Check, ArrowRight, Upload, X } from "lucide-react";
import NextImage from "next/image";
import { createClient } from "@/lib/supabase/client";

interface OnboardingWizardProps {
    userId: string;
    userEmail?: string;
    onComplete: () => void;
}

interface Club {
    id: string;
    title: string;
    slug: string;
    metadata?: {
        badge_url?: string;
        league?: string;
    };
}

export function OnboardingWizard({ userId, userEmail, onComplete }: OnboardingWizardProps) {
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [selectedClub, setSelectedClub] = useState<Club | null>(null);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // Load clubs when reaching step 2
    const loadClubs = async () => {
        const supabase = createClient();
        const { data } = await supabase
            .from('topics')
            .select('id, title, slug, metadata')
            .eq('type', 'club')
            .eq('is_active', true)
            .order('title', { ascending: true })
            .limit(100);

        if (data) setClubs(data as Club[]);
    };

    const handleNextStep = async () => {
        setError(null);

        if (step === 1) {
            // Validate username
            if (!username.trim() || username.length < 3) {
                setError("Username must be at least 3 characters");
                return;
            }

            // Check username availability
            const supabase = createClient();
            const { data: existing } = await supabase
                .from('users')
                .select('id')
                .eq('username', username.trim())
                .maybeSingle();

            if (existing) {
                setError("Username is already taken");
                return;
            }

            await loadClubs();
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

    const filteredClubs = clubs.filter(club =>
        club.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.metadata?.league?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

                <div className="p-6 sm:p-8">
                    {/* Step 1: Username & Avatar */}
                    {step === 1 && (
                        <div className="space-y-6">
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
                                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-700 dark:text-neutral-300 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all text-sm font-medium">
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
                                        <p className="text-xs text-slate-500 dark:text-neutral-500 mt-1">
                                            Or leave blank for a default avatar
                                        </p>
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
                                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                            placeholder="your_username"
                                            maxLength={20}
                                            required
                                            className="text-base pl-9 font-medium tracking-wide border-2 hover:border-emerald-300 dark:hover:border-emerald-700 focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors"
                                            style={{ width: '100%' }}
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
                                disabled={!username.trim() || username.length < 3}
                                className="w-full h-12 text-base font-semibold"
                                size="lg"
                            >
                                Continue
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Favorite Club */}
                    {step === 2 && (
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="text-center space-y-2">
                                <div className="w-14 h-14 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                                    <Shield className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">
                                    Choose Your Club
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-neutral-400">
                                    Select your favorite team (optional)
                                </p>
                            </div>

                            {/* Search */}
                            <div>
                                <Input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search clubs or leagues..."
                                    className="text-base"
                                />
                            </div>

                            {/* Clubs Grid */}
                            <div className="max-h-[320px] overflow-y-auto -mx-2 px-2">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {filteredClubs.slice(0, 24).map((club) => (
                                        <button
                                            key={club.id}
                                            onClick={() => setSelectedClub(club)}
                                            className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 text-center ${selectedClub?.id === club.id
                                                ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                                : 'border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600'
                                                }`}
                                        >
                                            {selectedClub?.id === club.id && (
                                                <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-600 dark:bg-emerald-500 rounded-full flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                            {club.metadata?.badge_url && (
                                                <div className="relative w-12 h-12">
                                                    <NextImage
                                                        src={club.metadata.badge_url}
                                                        alt={club.title}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                            )}
                                            <span className="text-xs font-bold text-slate-900 dark:text-neutral-100 line-clamp-2">
                                                {club.title}
                                            </span>
                                            {club.metadata?.league && (
                                                <span className="text-[10px] text-slate-500 dark:text-neutral-500">
                                                    {club.metadata.league.replace(/^(English|Spanish|Italian|German|French)\s/, '')}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

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
