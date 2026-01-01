"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Upload, User, Mail, Calendar, Pencil, Shield, Bookmark, ChevronRight, MessageSquare, Heart, Hash, Award, Flame } from "lucide-react";
import Link from "next/link";

export default function ProfilePreviewPage() {
    // Mock profile data
    const mockProfile = {
        username: "john_doe",
        avatar_url: null,
        created_at: "2024-06-15T10:30:00Z",
        favorite_club: {
            title: "Manchester City",
            metadata: {
                badge_url: "https://resources.premierleague.com/premierleague/badges/50/t43.png",
                league_name: "English Premier League"
            }
        }
    };

    const mockUser = {
        email: "john.doe@example.com"
    };

    return (
        <div style={{ width: '100%', maxWidth: '880px', margin: '0 auto', padding: '32px 16px' }}>
            {/* Back to Dev Tools */}
            <Link href="/design-system">
                <Button variant="ghost" size="sm" style={{ marginBottom: '16px' }}>
                    ← Back to Dev Tools
                </Button>
            </Link>

            {/* Sample Badge */}
            <div className="mb-4 px-3 py-1.5 bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 rounded-md inline-block">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Sample Profile Preview</p>
            </div>

            {/* Page Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">Profile</h1>
                <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">Manage your account settings</p>
            </div>

            {/* Bento Grid Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>

                {/* Identity Card - Avatar + Username */}
                <Card className="col-span-6 md:col-span-2 md:row-span-2" style={{ padding: '20px' }}>
                    {/* Avatar */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '16px' }}>
                        <div style={{ position: 'relative', marginBottom: '12px' }}>
                            <div 
                                style={{ width: '80px', height: '80px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                                className="bg-slate-100 dark:bg-neutral-800 border-2 border-slate-200 dark:border-neutral-700"
                            >
                                <User className="w-8 h-8 text-slate-400 dark:text-neutral-500" />
                            </div>
                        </div>
                        <Button variant="outline" size="sm" icon={Upload} disabled>
                            Change photo
                        </Button>
                    </div>

                    {/* Username */}
                    <div style={{ borderTop: '1px solid', paddingTop: '16px', opacity: 0.155 }} className="border-slate-200 dark:border-neutral-800">
                        <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Username</p>
                        <div>
                            <p className="text-base font-bold text-slate-900 dark:text-neutral-100 mb-1">@{mockProfile.username}</p>
                            <Button variant="outline" size="sm" icon={Pencil} disabled>
                                Edit
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Stats Card */}
                <Card className="col-span-6 md:col-span-4" style={{ padding: '20px' }}>
                    <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-4">Activity</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div className="w-10 h-10 rounded-md bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-2">
                                <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-neutral-100">12</p>
                            <p className="text-xs text-slate-500 dark:text-neutral-400">Takes</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div className="w-10 h-10 rounded-md bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-2">
                                <Heart className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-neutral-100">48</p>
                            <p className="text-xs text-slate-500 dark:text-neutral-400">Reactions</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div className="w-10 h-10 rounded-md bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-2">
                                <Hash className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-neutral-100">5</p>
                            <p className="text-xs text-slate-500 dark:text-neutral-400">Topics</p>
                        </div>
                    </div>
                </Card>

                {/* Favorite Club Card */}
                <Card className="col-span-6 sm:col-span-3 md:col-span-2" style={{ padding: '16px' }}>
                    <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Favorite Club</p>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <img
                                src={mockProfile.favorite_club.metadata.badge_url}
                                alt={mockProfile.favorite_club.title}
                                className="w-8 h-8 object-contain"
                            />
                            <div style={{ minWidth: 0 }}>
                                <p className="text-xs font-bold text-slate-900 dark:text-neutral-100 uppercase tracking-tight truncate">
                                    {mockProfile.favorite_club.title}
                                </p>
                                <p className="text-[9px] text-slate-400 dark:text-neutral-500 uppercase tracking-wider truncate">
                                    {mockProfile.favorite_club.metadata.league_name}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" icon={Pencil} disabled>
                            Change
                        </Button>
                    </div>
                </Card>

                {/* Badges Card - Coming Soon */}
                <Card className="col-span-6 sm:col-span-3 md:col-span-2" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Badges</p>
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">Soon</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-neutral-800 border border-dashed border-slate-300 dark:border-neutral-700 flex items-center justify-center">
                            <Award className="w-4 h-4 text-slate-300 dark:text-neutral-600" />
                        </div>
                        <div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-neutral-800 border border-dashed border-slate-300 dark:border-neutral-700 flex items-center justify-center">
                            <Flame className="w-4 h-4 text-slate-300 dark:text-neutral-600" />
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-neutral-500">Earn badges by seeding topics and leaving the first take</p>
                </Card>

                {/* Account Info Card */}
                <Card className="col-span-4 md:col-span-2" style={{ padding: '16px' }}>
                    <Mail className="w-4 h-4 text-slate-400 dark:text-neutral-500 mb-2" />
                    <p className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Email</p>
                    <p className="text-xs text-slate-900 dark:text-neutral-100 truncate font-medium">{mockUser.email}</p>
                </Card>

                {/* Member Since Card */}
                <Card className="col-span-2 md:col-span-1" style={{ padding: '16px' }}>
                    <Calendar className="w-4 h-4 text-slate-400 dark:text-neutral-500 mb-2" />
                    <p className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Joined</p>
                    <p className="text-xs text-slate-900 dark:text-neutral-100 font-medium">
                        {new Date(mockProfile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                </Card>

                {/* Bookmarks Card */}
                <Card className="col-span-6 md:col-span-3" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="flex items-center justify-between p-4 h-full opacity-60 cursor-not-allowed">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-md bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                                <Bookmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-neutral-100">Bookmarks</p>
                                <p className="text-[10px] text-slate-500 dark:text-neutral-400">Saved posts</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                    </div>
                </Card>

                {/* Sign Out Card */}
                <Card className="col-span-6 md:col-span-3" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p className="text-sm text-slate-500 dark:text-neutral-400">Session</p>
                    <Button variant="destructive" size="sm" disabled>
                        Sign out
                    </Button>
                </Card>

            </div>
        </div>
    );
}
