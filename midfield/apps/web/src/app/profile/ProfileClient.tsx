"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Upload, User, Mail, Calendar, Check, X, Pencil } from "lucide-react";
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
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (message) {
            setShouldRender(true);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setVisible(true));
            });
        } else {
            setVisible(false);
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [message]);

    if (!shouldRender) return null;

    const isSuccess = type === 'success';

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
            <p className="text-sm font-medium text-slate-700 dark:text-neutral-200">{message}</p>
        </div>
    );
}

export function ProfileClient({ initialData }: ProfileClientProps) {
    const router = useRouter();
    const [profile, setProfile] = useState(initialData.profile);
    const [username, setUsername] = useState(profile?.username || "");
    const [isEditingUsername, setIsEditingUsername] = useState(false);
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
        setIsEditingUsername(true);
        setTimeout(() => usernameInputRef.current?.focus(), 50);
    };

    const handleUsernameSave = () => {
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
                showToast(result.error || "Update failed", 'error');
            }
        });
    };

    const handleUsernameCancel = () => {
        setUsername(profile.username);
        setIsEditingUsername(false);
    };

    const handleSignOut = () => {
        window.dispatchEvent(new CustomEvent('avatar-updated', { detail: { avatarUrl: null } }));
        startTransition(async () => { await signOut(); });
    };

    return (
        <div style={{ width: '100%', maxWidth: '672px' }}>
            <Toast message={toastMessage} type={toastType} />

            {/* Page Header */}
            <div style={{ marginBottom: '40px' }}>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">Profile</h1>
                <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">Manage your account settings</p>
            </div>

            {/* Profile Card */}
            <Card style={{ padding: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '32px', flexWrap: 'wrap' }}>
                    {/* Avatar Section */}
                    <div style={{ flexShrink: 0 }}>
                        <div style={{ position: 'relative', marginBottom: '16px' }}>
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" style={{ width: '112px', height: '112px', borderRadius: '8px', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '112px', height: '112px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-800 dark:to-neutral-700">
                                    <User className="w-12 h-12 text-slate-400 dark:text-neutral-500" />
                                </div>
                            )}
                            {isUploading && (
                                <div style={{ position: 'absolute', inset: 0, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="bg-black/60">
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                        <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" icon={Upload} disabled={isUploading || isPending}>
                            {isUploading ? "Uploading..." : "Change photo"}
                        </Button>
                    </div>

                    {/* Info Section */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        {/* Username */}
                        <div style={{ marginBottom: '24px' }}>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Username</label>
                            {isEditingUsername ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <input
                                        ref={usernameInputRef}
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        style={{ width: '200px', height: '40px', padding: '0 12px' }}
                                        className="text-sm font-medium bg-white dark:bg-neutral-800 border-2 border-emerald-500 rounded-md text-slate-900 dark:text-neutral-100 focus:outline-none"
                                        disabled={isPending}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleUsernameSave();
                                            if (e.key === 'Escape') handleUsernameCancel();
                                        }}
                                    />
                                    <Button onClick={handleUsernameSave} size="icon" disabled={isPending || username === profile.username}>
                                        <Check className="w-4 h-4" />
                                    </Button>
                                    <Button onClick={handleUsernameCancel} variant="outline" size="icon" disabled={isPending}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="text-xl font-bold text-slate-900 dark:text-neutral-100">@{profile.username}</span>
                                    <button onClick={handleUsernameEdit} className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1.5">3-20 characters, letters, numbers, underscores</p>
                        </div>

                        {/* Email */}
                        <div style={{ marginBottom: '24px' }}>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Email</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="text-slate-700 dark:text-neutral-300">
                                <Mail className="w-4 h-4 shrink-0 text-slate-400 dark:text-neutral-500" />
                                <span className="text-sm">{initialData.user.email}</span>
                            </div>
                        </div>

                        {/* Member Since */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Member Since</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="text-slate-700 dark:text-neutral-300">
                                <Calendar className="w-4 h-4 shrink-0 text-slate-400 dark:text-neutral-500" />
                                <span className="text-sm">{new Date(profile?.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Sign Out */}
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid' }} className="border-slate-200 dark:border-neutral-800">
                <Button onClick={handleSignOut} variant="destructive" size="sm" disabled={isPending}>
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
