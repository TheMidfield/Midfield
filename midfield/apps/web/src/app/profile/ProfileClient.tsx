"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Upload, User, Mail, Calendar, Check, X, Pencil, AlertCircle, Bookmark, ChevronRight, Shield, Loader2, MessageSquare, Heart, Hash, Award, Flame, Zap, Crown, Trophy, Medal } from "lucide-react";
import { uploadAvatar, updateProfile } from "./actions";
import { FavoriteClubSelector, type Club } from "@/components/onboarding/FavoriteClubSelector";
import { signOut } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/Dialog";

interface ProfileClientProps {
    initialData: {
        user: any;
        profile: any;
    };
}

function Toast({ message, type }: { message: string | null; type: 'success' | 'error' }) {
    const [visible, setVisible] = useState(false);
    const [currentMessage, setCurrentMessage] = useState<string | null>(null);
    const [currentType, setCurrentType] = useState<'success' | 'error'>('success');

    useEffect(() => {
        if (message) {
            // On enter: update content immediately, then animate in
            setCurrentMessage(message);
            setCurrentType(type);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setVisible(true));
            });
        } else {
            // On exit: animate out first
            setVisible(false);
        }
    }, [message, type]);

    // Clear content after exit animation completes
    useEffect(() => {
        if (!visible && !message && currentMessage) {
            const timer = setTimeout(() => setCurrentMessage(null), 300);
            return () => clearTimeout(timer);
        }
    }, [visible, message, currentMessage]);

    // Don't render if no content
    if (!currentMessage) return null;

    const isSuccess = currentType === 'success';

    return (
        <div
            style={{
                position: 'fixed',
                top: '96px',
                right: '24px',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                transform: visible ? 'translateY(0)' : 'translateY(-16px)',
                opacity: visible ? 1 : 0,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: visible ? 'auto' : 'none',
            }}
            className={`bg-white dark:bg-neutral-900 border ${isSuccess ? 'border-emerald-300 dark:border-emerald-700' : 'border-red-300 dark:border-red-700'}`}
        >
            <div
                style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                className={isSuccess ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-red-100 dark:bg-red-900/50'}
            >
                {isSuccess ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                    <X className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                )}
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-neutral-200" style={{ whiteSpace: 'nowrap' }}>{currentMessage}</p>
        </div>
    );
}

export function ProfileClient({ initialData }: ProfileClientProps) {
    const router = useRouter();
    const [profile, setProfile] = useState(initialData.profile || {
        username: initialData.user?.user_metadata?.username || initialData.user?.email?.split('@')[0] || "User",
        display_name: initialData.user?.user_metadata?.full_name || "",
        avatar_url: initialData.user?.user_metadata?.avatar_url || null,
        created_at: initialData.user?.created_at || new Date().toISOString(),
        favorite_club_id: null
    });
    const [username, setUsername] = useState(profile?.username || "");
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [isEditingClub, setIsEditingClub] = useState(false);
    const [favoriteClubId, setFavoriteClubId] = useState(profile?.favorite_club_id || null);
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const usernameInputRef = useRef<HTMLInputElement>(null);
    const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
    const [hoveredBadgeTitle, setHoveredBadgeTitle] = useState<string | null>(null);

    const BADGE_INFO: Record<string, { title: string, description: string, icon: any, color: string, bg: string, border: string, text: string }> = {
        'trendsetter': {
            title: 'Trendsetter',
            description: 'You started the conversation! Awarded for being the first to post a take on any topic.',
            icon: Zap,
            color: 'emerald',
            bg: 'bg-emerald-100 dark:bg-emerald-900/30',
            border: 'border-emerald-200 dark:border-emerald-800',
            text: 'text-emerald-600 dark:text-emerald-400'
        },
        'original-10': {
            title: 'Starting XI',
            description: 'Legendary status. You were one of the first 11 users to join Midfield.',
            icon: Crown,
            color: 'amber',
            bg: 'bg-amber-100 dark:bg-amber-900/30',
            border: 'border-amber-200 dark:border-amber-800',
            text: 'text-amber-600 dark:text-amber-400'
        },
        'club-100': {
            title: 'Club 100',
            description: 'Early adopter. You were among the first 100 users on the platform.',
            icon: Trophy,
            color: 'purple',
            bg: 'bg-purple-100 dark:bg-purple-900/30',
            border: 'border-purple-200 dark:border-purple-800',
            text: 'text-purple-600 dark:text-purple-400'
        },
        'club-1000': {
            title: 'Club 1k',
            description: 'Founding Member. You joined with the first 1000 users.',
            icon: Medal,
            color: 'blue',
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            border: 'border-blue-200 dark:border-blue-800',
            text: 'text-blue-600 dark:text-blue-400'
        }
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(null), 3000);
    };


    // Helper: Client-side compression
    const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    URL.revokeObjectURL(img.src);
                    return reject(new Error('Canvas context not available'));
                }

                // Max dimensions (500x500 is plenty for avatar)
                const MAX_WIDTH = 500;
                const MAX_HEIGHT = 500;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    URL.revokeObjectURL(img.src);
                    if (blob) resolve(blob);
                    else reject(new Error('Compression failed'));
                }, 'image/jpeg', 0.8); // 80% quality JPEG
            };
            img.onerror = (err) => {
                URL.revokeObjectURL(img.src);
                reject(err);
            };
        });
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // Allow larger raw files for client-side compression
            showToast('Image must be less than 5MB', 'error');
            return;
        }

        setIsUploading(true);

        try {
            const compressedBlob = await compressImage(file);
            // Create a new file from blob to preserve name extension (force .jpg)
            const compressedFile = new File([compressedBlob], "avatar.jpg", { type: "image/jpeg" });

            const formData = new FormData();
            formData.append("avatar", compressedFile);

            startTransition(async () => {
                const result = await uploadAvatar(formData);
                setIsUploading(false);

                if (result.success) {
                    showToast("Photo updated", 'success');
                    setProfile((prev: any) => ({ ...prev, avatar_url: result.avatarUrl }));
                    window.dispatchEvent(new CustomEvent('avatar-updated', { detail: { avatarUrl: result.avatarUrl } }));
                    router.refresh();
                } else {
                    showToast(result.error || "Upload failed", 'error');
                }
            });
        } catch (err) {
            console.error(err);
            setIsUploading(false);
            showToast("Failed to process image", 'error');
        }
    };

    // Check username availability with debouncing
    useEffect(() => {
        if (!isEditingUsername || username === profile.username) {
            setUsernameAvailable(null);
            return;
        }

        const trimmed = username.trim();

        // Validate format first
        if (trimmed.length < 3 || trimmed.length > 20 || !/^[a-zA-Z0-9_]+$/.test(trimmed)) {
            setUsernameError("3-20 characters, letters/numbers/underscores only");
            setUsernameAvailable(null);
            return;
        }

        setUsernameError(null);
        const timeoutId = setTimeout(async () => {
            setIsCheckingUsername(true);
            const supabase = createClient();
            const { data: existing } = await supabase
                .from('users')
                .select('id')
                .ilike('username', trimmed)
                .neq('id', initialData.user.id)
                .maybeSingle();

            setIsCheckingUsername(false);
            setUsernameAvailable(!existing);
            if (existing) {
                setUsernameError("Username is already taken");
            }
        }, 500); // Debounce 500ms

        return () => clearTimeout(timeoutId);
    }, [username, isEditingUsername, profile.username, initialData.user.id]);

    const handleUsernameEdit = () => {
        setUsername(profile.username);
        setUsernameError(null);
        setUsernameAvailable(null);
        setIsEditingUsername(true);
        setTimeout(() => usernameInputRef.current?.focus(), 50);
    };

    const handleUsernameSave = () => {
        if (username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username)) {
            setUsernameError("3-20 characters, letters/numbers/underscores only");
            return;
        }

        if (username === profile.username) {
            setIsEditingUsername(false);
            return;
        }

        if (usernameAvailable === false) {
            setUsernameError("Username is already taken");
            return;
        }

        startTransition(async () => {
            const result = await updateProfile({ username });

            if (result.success) {
                showToast("Username updated", 'success');
                setProfile((prev: any) => ({ ...prev, username }));
                setIsEditingUsername(false);
                setUsernameAvailable(null);
                router.refresh();
            } else {
                setUsernameError(result.error || "Update failed");
            }
        });
    };

    const handleUsernameCancel = () => {
        setUsername(profile.username);
        setUsernameError(null);
        setUsernameAvailable(null);
        setIsEditingUsername(false);
    };

    const handleSignOut = () => {
        window.dispatchEvent(new CustomEvent('avatar-updated', { detail: { avatarUrl: null } }));
        startTransition(async () => { await signOut(); });
    };

    return (
        <div style={{ width: '100%', maxWidth: '880px', margin: '0 auto', padding: '32px 16px' }}>
            <Toast message={toastMessage} type={toastType} />

            {/* Page Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">Profile</h1>
                <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">Manage your account settings</p>
            </div>

            {/* Bento Grid Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>

                {/* Identity Card - Avatar + Username + Club */}
                <Card className="col-span-6 md:col-span-2 md:row-span-2" style={{ padding: '20px' }}>
                    {/* Avatar */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '16px' }}>
                        <div style={{ position: 'relative', marginBottom: '12px' }}>
                            {profile?.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt="Profile"
                                    style={{ width: '80px', height: '80px', borderRadius: '6px', objectFit: 'cover' }}
                                />
                            ) : (
                                <div
                                    style={{ width: '80px', height: '80px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    className="bg-slate-100 dark:bg-neutral-800 border-2 border-slate-200 dark:border-neutral-700"
                                >
                                    <User className="w-8 h-8 text-slate-400 dark:text-neutral-500" />
                                </div>
                            )}
                            {isUploading && (
                                <div style={{ position: 'absolute', inset: 0, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="bg-black/60">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                        <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" icon={Upload} disabled={isUploading || isPending} className="active:text-emerald-600 active:border-emerald-600 active:bg-emerald-50 dark:active:bg-emerald-900/10 transition-colors">
                            {isUploading ? "Uploading..." : "Change photo"}
                        </Button>
                    </div>

                    {/* Username */}
                    {/* Username */}
                    <div style={{ borderTop: '1px solid', paddingTop: '24px', marginTop: '12px' }} className="border-slate-200 dark:border-neutral-700">
                        <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Username</p>
                        {isEditingUsername ? (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                    <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">@</span>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <input
                                            ref={usernameInputRef}
                                            type="text"
                                            value={username}
                                            onChange={(e) => { setUsername(e.target.value); setUsernameError(null); }}
                                            className={`h-9 px-2 pr-8 text-sm font-medium bg-white dark:bg-neutral-800 border-2 rounded-md text-slate-900 dark:text-neutral-100 focus:outline-none transition-colors ${usernameError
                                                ? 'border-red-400 dark:border-red-600 focus:border-red-500'
                                                : usernameAvailable === true
                                                    ? 'border-emerald-400 dark:border-emerald-600 focus:border-emerald-500'
                                                    : 'border-slate-300 dark:border-neutral-700 focus:border-emerald-500'
                                                }`}
                                            style={{ width: '100%' }}
                                            disabled={isPending}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleUsernameSave();
                                                if (e.key === 'Escape') handleUsernameCancel();
                                            }}
                                            maxLength={20}
                                        />
                                        <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }}>
                                            {isCheckingUsername ? (
                                                <Loader2 className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 animate-spin" />
                                            ) : usernameAvailable === true && username !== profile.username ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                            ) : usernameAvailable === false || usernameError ? (
                                                <X className="w-3.5 h-3.5 text-red-500" />
                                            ) : null}
                                        </div>
                                    </div>
                                </div>

                                {usernameError ? (
                                    <p className="text-[10px] text-red-500 font-medium mb-2">{usernameError}</p>
                                ) : usernameAvailable === true && username !== profile.username ? (
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mb-2">Available</p>
                                ) : null}

                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                                    <Button onClick={handleUsernameCancel} variant="outline" size="sm" disabled={isPending}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleUsernameSave}
                                        size="sm"
                                        disabled={isPending || username === profile.username || usernameAvailable === false || isCheckingUsername}
                                        style={{ minWidth: '100px' }}
                                    >
                                        {isPending ? "..." : "Save Changes"}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <p className="text-base font-bold text-slate-900 dark:text-neutral-100">@{profile.username}</p>
                                <Button
                                    onClick={handleUsernameEdit}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900 dark:hover:text-neutral-100 active:text-emerald-600 transition-colors" // Consistent styling
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Stats Card */}
                <Card className="col-span-6 md:col-span-4" style={{ padding: '20px' }}>
                    <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-4">Activity</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div className="w-10 h-10 rounded-md bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-2">
                                <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-neutral-100">
                                {profile?.posts?.[0]?.count ?? 0}
                            </p>
                            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-neutral-400 mt-1">Takes Posted</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div className="w-10 h-10 rounded-md bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-2">
                                <Hash className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-neutral-100">
                                {profile?.activity_stats?.topics_interacted ?? 0}
                            </p>
                            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-neutral-400 mt-1">Discussions</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div className="w-10 h-10 rounded-md bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-2">
                                <Heart className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-neutral-100">
                                {profile?.activity_stats?.reactions_received ?? 0}
                            </p>
                            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-neutral-400 mt-1">Reactions Received</p>
                        </div>
                    </div>
                </Card>

                {/* Favorite Club Card */}
                <Card className="col-span-6 sm:col-span-3 md:col-span-2" style={{ padding: '16px' }}>
                    <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Favorite Club</p>

                    {/* Club Selection Modal */}
                    <Dialog open={isEditingClub} onOpenChange={setIsEditingClub}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Choose your badge</DialogTitle>
                                <DialogDescription>
                                    Select your favorite club to display on your profile.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="py-4">
                                <FavoriteClubSelector
                                    initialClubId={favoriteClubId}
                                    onSelect={(club) => setFavoriteClubId(club?.id || null)}
                                />
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button
                                    onClick={() => {
                                        setFavoriteClubId(profile.favorite_club_id);
                                        setIsEditingClub(false);
                                    }}
                                    variant="outline"
                                    size="sm"
                                    disabled={isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (favoriteClubId === profile.favorite_club_id) {
                                            setIsEditingClub(false);
                                            return;
                                        }
                                        startTransition(async () => {
                                            const result = await updateProfile({ favorite_club_id: favoriteClubId });
                                            if (result.success) {
                                                showToast("Club updated", 'success');
                                                setProfile((prev: any) => ({ ...prev, favorite_club_id: favoriteClubId }));
                                                setIsEditingClub(false);
                                                router.refresh();
                                                // Hard reload to update layout logo if needed
                                                setTimeout(() => window.location.reload(), 500);
                                            } else {
                                                showToast("Update failed", 'error');
                                            }
                                        });
                                    }}
                                    size="sm"
                                    disabled={isPending}
                                >
                                    {isPending ? "Saving..." : "Save Badge"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <div>
                        {profile?.favorite_club ? (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    {profile.favorite_club.metadata?.badge_url || profile.favorite_club.metadata?.logo_url ? (
                                        <img
                                            src={profile.favorite_club.metadata?.badge_url || profile.favorite_club.metadata?.logo_url}
                                            alt={profile.favorite_club.title}
                                            className="w-8 h-8 object-contain"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-md bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                                            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                    )}
                                    <div style={{ minWidth: 0 }}>
                                        <p className="text-xs font-bold text-slate-900 dark:text-neutral-100 uppercase tracking-tight truncate">
                                            {profile.favorite_club.title}
                                        </p>
                                        {profile.favorite_club.metadata?.league_name && (
                                            <p className="text-[9px] text-slate-400 dark:text-neutral-500 uppercase tracking-wider truncate">
                                                {profile.favorite_club.metadata.league_name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Button onClick={() => setIsEditingClub(true)} variant="outline" size="sm" icon={Pencil} className="active:text-emerald-600 active:border-emerald-600 active:bg-emerald-50 dark:active:bg-emerald-900/10 transition-colors">
                                    Change
                                </Button>
                            </div>
                        ) : (
                            <div>
                                <p className="text-xs text-slate-500 dark:text-neutral-400 mb-2">Not set</p>
                                <Button onClick={() => setIsEditingClub(true)} variant="outline" size="sm" icon={Shield} className="active:text-emerald-600 active:border-emerald-600 active:bg-emerald-50 dark:active:bg-emerald-900/10 transition-colors">
                                    Select
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Badges Card */}
                <Card className="col-span-6 sm:col-span-3 md:col-span-2" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Badges</p>
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">More Soon!</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap', minHeight: '40px' }}>
                        {Object.keys(BADGE_INFO).map((badgeKey) => {
                            const isEarned = profile?.badges?.includes(badgeKey);
                            const info = BADGE_INFO[badgeKey];
                            const Icon = info.icon;

                            if (isEarned) {
                                return (
                                    <button
                                        key={badgeKey}
                                        onClick={() => setSelectedBadge(badgeKey)}
                                        onMouseEnter={() => setHoveredBadgeTitle(info.title)}
                                        onMouseLeave={() => setHoveredBadgeTitle(null)}
                                        className={`group relative rounded-xl ${info.bg} border ${info.border} transition-all duration-300 active:scale-95 lg:active:scale-100 cursor-pointer ring-0 hover:ring-2 hover:ring-offset-1 hover:ring-offset-white dark:hover:ring-offset-neutral-900 ${info.text.replace('text-', 'ring-').split(' ')[0]}`}
                                        style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        title={info.title}
                                    >
                                        <Icon className={`w-5 h-5 ${info.text} transition-transform duration-300 group-hover:-rotate-6`} strokeWidth={1.5} />
                                    </button>
                                );
                            }

                            // Placeholder / Rune Holder for unearned badges
                            return (
                                <div
                                    key={`placeholder-${badgeKey}`}
                                    className="rounded-xl bg-slate-50 dark:bg-neutral-800/20 border border-slate-200/50 dark:border-neutral-800/50 flex items-center justify-center opacity-40"
                                    style={{ width: '40px', height: '40px' }}
                                    onMouseEnter={() => setHoveredBadgeTitle(`Locked: ${info.title}`)}
                                    onMouseLeave={() => setHoveredBadgeTitle(null)}
                                >
                                    <Icon className="w-5 h-5 text-slate-300 dark:text-neutral-700" strokeWidth={1} />
                                </div>
                            );
                        })}
                    </div>

                    {/* Elegant footer text reveal */}
                    <div className="mt-1 flex flex-col items-center justify-center h-6">
                        <p className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-300 ${hoveredBadgeTitle ? 'text-slate-900 dark:text-neutral-100' : 'text-slate-400 dark:text-neutral-600'}`}>
                            {hoveredBadgeTitle || `${profile?.badges?.length || 0} BADGES`}
                        </p>
                    </div>
                </Card>

                {/* Badge Detail Modal */}
                <Dialog open={!!selectedBadge} onOpenChange={(open) => !open && setSelectedBadge(null)}>
                    <DialogContent>
                        {selectedBadge && BADGE_INFO[selectedBadge] && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', maxWidth: '100%' }}>
                                <div
                                    className={`${BADGE_INFO[selectedBadge].bg} border ${BADGE_INFO[selectedBadge].border}`}
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
                                        const Icon = BADGE_INFO[selectedBadge].icon;
                                        return <Icon className={`w-10 h-10 ${BADGE_INFO[selectedBadge].text}`} strokeWidth={1.5} />;
                                    })()}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '24px', width: '100%' }}>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">{BADGE_INFO[selectedBadge].title}</h2>
                                    <p className="text-base text-slate-500 dark:text-neutral-400" style={{ maxWidth: '280px', lineHeight: '1.5' }}>
                                        {BADGE_INFO[selectedBadge].description}
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setSelectedBadge(null)}
                                    size="lg"
                                    style={{ width: '100%', maxWidth: '200px' }}
                                >
                                    Nice!
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Account Info Card */}
                <Card className="col-span-6 sm:col-span-3 md:col-span-3" style={{ padding: '16px' }}>
                    <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                        <p className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Email</p>
                    </div>
                    <p className="text-sm text-slate-900 dark:text-neutral-100 font-medium truncate">{initialData.user.email}</p>
                </Card>

                {/* Member Since Card */}
                <Card className="col-span-6 sm:col-span-3 md:col-span-3" style={{ padding: '16px' }}>
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                        <p className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Joined</p>
                    </div>
                    <p className="text-sm text-slate-900 dark:text-neutral-100 font-medium">
                        {new Date(profile?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </Card>

                {/* My Takes Card - Side by side with Bookmarks */}
                <Card className="col-span-6 sm:col-span-3" style={{ padding: 0, overflow: 'hidden' }}>
                    <a
                        href="/profile/takes"
                        className="flex items-center justify-between p-4 h-full hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
                                <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">My Takes</p>
                                <p className="text-xs text-slate-500 dark:text-neutral-400">View your post history</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 dark:text-neutral-600 group-hover:text-emerald-500 transition-colors" />
                    </a>
                </Card>

                {/* Bookmarks Card */}
                <Card className="col-span-6 sm:col-span-3" style={{ padding: 0, overflow: 'hidden' }}>
                    <a
                        href="/profile/bookmarks"
                        className="flex items-center justify-between p-4 h-full hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
                                <Bookmark className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Bookmarks</p>
                                <p className="text-xs text-slate-500 dark:text-neutral-400">View your saved reads</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 dark:text-neutral-600 group-hover:text-indigo-500 transition-colors" />
                    </a>
                </Card>

                {/* Sign Out Card */}
                <Card className="col-span-6" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                    <div className="flex flex-col">
                        <p className="text-sm font-bold text-slate-900 dark:text-neutral-100">Sign Out</p>
                        <p className="text-xs text-slate-500 dark:text-neutral-400">End your current session</p>
                    </div>
                    <Button
                        onClick={handleSignOut}
                        variant="destructive"
                        size="sm"
                    >
                        Sign out
                    </Button>
                </Card>

            </div >
        </div >
    );
}
