"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Upload, User, Mail, Calendar, Pencil, Shield, Bookmark, ChevronRight } from "lucide-react";
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
        <div style={{ width: '100%', maxWidth: '560px', margin: '0 auto', padding: '32px 16px' }}>
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
            <div style={{ marginBottom: '32px' }}>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">Profile</h1>
                <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">Manage your account settings</p>
            </div>

            {/* Avatar Section */}
            <Card style={{ padding: '24px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div 
                            style={{ width: '80px', height: '80px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                            className="bg-slate-100 dark:bg-neutral-800 border-2 border-slate-200 dark:border-neutral-700"
                        >
                            <User className="w-8 h-8 text-slate-400 dark:text-neutral-500" />
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <p className="text-sm font-medium text-slate-900 dark:text-neutral-100 mb-1">Profile photo</p>
                        <p className="text-xs text-slate-500 dark:text-neutral-400 mb-3">JPG, PNG or GIF. Max 5MB.</p>
                        <Button variant="outline" size="sm" icon={Upload} disabled>
                            Change photo
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Username Section */}
            <Card style={{ padding: '24px', marginBottom: '16px' }}>
                <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Username</p>
                <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-neutral-100 mb-3">@{mockProfile.username}</p>
                    <Button variant="outline" size="sm" icon={Pencil} disabled>
                        Edit username
                    </Button>
                </div>
            </Card>

            {/* Favorite Club Section */}
            <Card style={{ padding: '24px', marginBottom: '16px' }}>
                <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Favorite Club</p>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-md bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700">
                        <img
                            src={mockProfile.favorite_club.metadata.badge_url}
                            alt={mockProfile.favorite_club.title}
                            className="w-8 h-8 object-contain"
                        />
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-neutral-100 uppercase tracking-tight">
                                {mockProfile.favorite_club.title}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase tracking-wider font-semibold">
                                {mockProfile.favorite_club.metadata.league_name}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" icon={Pencil} disabled>
                        Change Club
                    </Button>
                </div>
            </Card>

            {/* Account Info Section */}
            <Card style={{ padding: '24px', marginBottom: '16px' }}>
                <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-4">Account</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Mail className="w-4 h-4 text-slate-400 dark:text-neutral-500" style={{ flexShrink: 0 }} />
                        <div>
                            <p className="text-xs text-slate-400 dark:text-neutral-500">Email</p>
                            <p className="text-sm text-slate-900 dark:text-neutral-100">{mockUser.email}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Calendar className="w-4 h-4 text-slate-400 dark:text-neutral-500" style={{ flexShrink: 0 }} />
                        <div>
                            <p className="text-xs text-slate-400 dark:text-neutral-500">Member since</p>
                            <p className="text-sm text-slate-900 dark:text-neutral-100">
                                {new Date(mockProfile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Bookmarks Section */}
            <Card style={{ padding: 0, marginBottom: '24px', overflow: 'hidden' }}>
                <div className="flex items-center justify-between p-4 opacity-60 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                            <Bookmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-neutral-100">Bookmarks</p>
                            <p className="text-xs text-slate-500 dark:text-neutral-400">Posts you've saved</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 dark:text-neutral-500" />
                </div>
            </Card>

            {/* Sign Out */}
            <Button variant="destructive" size="sm" disabled>
                Sign out
            </Button>
        </div>
    );
}
