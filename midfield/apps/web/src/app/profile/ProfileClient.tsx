"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Upload, User, Mail, Calendar, Check, X, Pencil, AlertCircle } from "lucide-react";
import { uploadAvatar, updateProfile } from "./actions";
import { signOut } from "@/app/auth/actions";

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
                right: '96px',
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
                {isSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <X className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />}
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-neutral-200" style={{ whiteSpace: 'nowrap' }}>{currentMessage}</p>
        </div>
    );
}

export function ProfileClient({ initialData }: ProfileClientProps) {
    const router = useRouter();
    const [profile, setProfile] = useState(initialData.profile);
    const [username, setUsername] = useState(profile?.username || "");
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const usernameInputRef = useRef<HTMLInputElement>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            showToast('Image must be less than 2MB', 'error');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("avatar", file);

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
    };

    const handleUsernameEdit = () => {
        setUsername(profile.username);
        setUsernameError(null);
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

        startTransition(async () => {
            const result = await updateProfile({ username });

            if (result.success) {
                showToast("Username updated", 'success');
                setProfile((prev: any) => ({ ...prev, username }));
                setIsEditingUsername(false);
                router.refresh();
            } else {
                setUsernameError(result.error || "Update failed");
            }
        });
    };

    const handleUsernameCancel = () => {
        setUsername(profile.username);
        setUsernameError(null);
        setIsEditingUsername(false);
    };

    const handleSignOut = () => {
        window.dispatchEvent(new CustomEvent('avatar-updated', { detail: { avatarUrl: null } }));
        startTransition(async () => { await signOut(); });
    };

    return (
        <div style={{ width: '100%', maxWidth: '600px' }}>
            <Toast message={toastMessage} type={toastType} />

            {/* Page Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">Profile</h1>
                <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">Manage your account settings</p>
            </div>

            {/* Avatar Section */}
            <Card style={{ padding: '24px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '80px', height: '80px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-800 dark:to-neutral-700">
                                <User className="w-8 h-8 text-slate-400 dark:text-neutral-500" />
                            </div>
                        )}
                        {isUploading && (
                            <div style={{ position: 'absolute', inset: 0, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="bg-black/60">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                    <div style={{ flex: 1 }}>
                        <p className="text-sm font-medium text-slate-900 dark:text-neutral-100 mb-1">Profile photo</p>
                        <p className="text-xs text-slate-500 dark:text-neutral-400 mb-3">JPG, PNG or GIF. Max 2MB.</p>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                        <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" icon={Upload} disabled={isUploading || isPending}>
                            {isUploading ? "Uploading..." : "Change photo"}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Username Section */}
            <Card style={{ padding: '24px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Username</p>

                        {/* Fixed height container to prevent layout shift */}
                        <div style={{ minHeight: '80px' }}>
                            {isEditingUsername ? (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <span className="text-slate-400 dark:text-neutral-500 text-lg">@</span>
                                        <input
                                            ref={usernameInputRef}
                                            type="text"
                                            value={username}
                                            onChange={(e) => { setUsername(e.target.value); setUsernameError(null); }}
                                            style={{ width: '180px', height: '36px', padding: '0 10px' }}
                                            className={`text-sm font-medium bg-white dark:bg-neutral-800 border-2 rounded-md text-slate-900 dark:text-neutral-100 focus:outline-none transition-colors ${usernameError ? 'border-red-400 dark:border-red-600' : 'border-emerald-500'}`}
                                            disabled={isPending}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleUsernameSave();
                                                if (e.key === 'Escape') handleUsernameCancel();
                                            }}
                                        />
                                    </div>
                                    {usernameError && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                            <AlertCircle className="w-3.5 h-3.5 text-red-500" style={{ flexShrink: 0 }} />
                                            <span className="text-xs text-red-500">{usernameError}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Button onClick={handleUsernameSave} size="sm" disabled={isPending || username === profile.username}>
                                            {isPending ? "Saving..." : "Save"}
                                        </Button>
                                        <Button onClick={handleUsernameCancel} variant="outline" size="sm" disabled={isPending}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">@{profile.username}</p>
                                    <Button onClick={handleUsernameEdit} variant="outline" size="sm" icon={Pencil}>
                                        Edit username
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Account Info Section */}
            <Card style={{ padding: '24px', marginBottom: '24px' }}>
                <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-4">Account</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Mail className="w-4 h-4 text-slate-400 dark:text-neutral-500" style={{ flexShrink: 0 }} />
                        <div>
                            <p className="text-xs text-slate-400 dark:text-neutral-500">Email</p>
                            <p className="text-sm text-slate-900 dark:text-neutral-100">{initialData.user.email}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Calendar className="w-4 h-4 text-slate-400 dark:text-neutral-500" style={{ flexShrink: 0 }} />
                        <div>
                            <p className="text-xs text-slate-400 dark:text-neutral-500">Member since</p>
                            <p className="text-sm text-slate-900 dark:text-neutral-100">
                                {new Date(profile?.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Sign Out */}
            <Button onClick={handleSignOut} variant="destructive" size="sm" disabled={isPending}>
                Sign out
            </Button>
        </div>
    );
}
