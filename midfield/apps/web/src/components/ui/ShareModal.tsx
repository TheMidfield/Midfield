"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Download, Copy, Check, Loader2, Sun, Moon, Instagram } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: string;
    authorUsername: string;
    authorAvatar?: string;
    createdAt: string;
    topicTitle?: string;
    topicImageUrl?: string;
    topicType?: string;
    clubName?: string;
    clubBadgeUrl?: string;
    topicPosition?: string;
}

type ActionState = "idle" | "loading" | "success";

// Custom X Logo (Twitter rebrand)
function XIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

export function ShareModal({
    isOpen,
    onClose,
    content,
    authorUsername,
    authorAvatar,
    createdAt,
    topicTitle,
    topicImageUrl,
    topicType,
    clubName,
    clubBadgeUrl,
    topicPosition,
}: ShareModalProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [downloadState, setDownloadState] = useState<ActionState>("idle");
    const [copyState, setCopyState] = useState<ActionState>("idle");
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Generate image via server-side API (no CORS issues!)
    const generateImage = useCallback(async () => {
        setIsGenerating(true);
        setImageUrl(null);

        try {
            const params = new URLSearchParams({
                content,
                authorUsername,
                topicTitle: topicTitle || '',
                topicType: topicType || 'player',
                createdAt,
                theme: isDarkMode ? 'dark' : 'light',
            });

            if (topicImageUrl) {
                params.set('topicImageUrl', topicImageUrl);
            }
            if (authorAvatar) {
                params.set('authorAvatarUrl', authorAvatar);
            }
            if (clubName) {
                params.set('clubName', clubName);
            }
            if (clubBadgeUrl) {
                params.set('clubBadgeUrl', clubBadgeUrl);
            }
            if (topicPosition) {
                params.set('topicPosition', topicPosition);
            }

            const response = await fetch(`/api/share-card?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to generate image');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setImageUrl(url);
        } catch (error) {
            console.error("Failed to generate image:", error);
        } finally {
            setIsGenerating(false);
        }
    }, [content, authorUsername, authorAvatar, topicTitle, topicImageUrl, topicType, createdAt, isDarkMode, clubName, clubBadgeUrl, topicPosition]);

    // Generate when modal opens
    useEffect(() => {
        if (isOpen) {
            generateImage();
        } else {
            // Cleanup blob URL when modal closes
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
            setImageUrl(null);
            setDownloadState("idle");
            setCopyState("idle");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Regenerate when theme changes
    useEffect(() => {
        if (isOpen) {
            generateImage();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDarkMode]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    // Download handler
    const handleDownload = async () => {
        if (!imageUrl || downloadState !== "idle") return;

        setDownloadState("loading");
        try {
            const link = document.createElement("a");
            link.download = `midfield-take-${Date.now()}.png`;
            link.href = imageUrl;
            link.click();
            setDownloadState("success");
            setTimeout(() => setDownloadState("idle"), 2000);
        } catch (error) {
            console.error("Download failed:", error);
            setDownloadState("idle");
        }
    };

    // Copy to clipboard handler
    const handleCopy = async () => {
        if (!imageUrl || copyState !== "idle") return;

        setCopyState("loading");
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            await navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob }),
            ]);
            setCopyState("success");
            setTimeout(() => setCopyState("idle"), 2000);
        } catch (error) {
            console.error("Copy failed:", error);
            setCopyState("idle");
        }
    };

    // X (Twitter) share handler
    const handleShareToX = () => {
        const text = encodeURIComponent(`My take on ${topicTitle || 'Midfield'}: ${content.substring(0, 100)}...`);
        const url = encodeURIComponent(window.location.href);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <div
                    className="absolute inset-0 bg-black/70 backdrop-blur-xl"
                    style={{ animation: "fadeIn 150ms ease-out" }}
                />

                {/* Modal */}
                <div
                    className="relative z-10"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        width: 'calc(100% - 2rem)',
                        maxWidth: '512px',
                        animation: "modalSpring 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                >
                    <div className="bg-neutral-900 border border-neutral-800 rounded-md overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-800">
                            <h2 className="text-base sm:text-lg font-semibold text-neutral-100 truncate pr-2">
                                Share Your Take
                            </h2>
                            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                <button
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors cursor-pointer"
                                    title={isDarkMode ? "Light mode" : "Dark mode"}
                                >
                                    {isDarkMode ? <Sun className="w-4 sm:w-5 h-4 sm:h-5" /> : <Moon className="w-4 sm:w-5 h-4 sm:h-5" />}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors cursor-pointer"
                                >
                                    <X className="w-4 sm:w-5 h-4 sm:h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="p-3 sm:p-4 md:p-6">
                            <div
                                className="relative rounded-md overflow-hidden bg-neutral-800 shadow-lg ring-1 ring-neutral-700"
                                style={{ width: '100%', aspectRatio: '1 / 1' }}
                            >
                                {isGenerating || !imageUrl ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                                            <span className="text-sm text-neutral-400">Generating...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <img
                                        src={imageUrl}
                                        alt="Preview"
                                        className="h-full object-contain"
                                        style={{ width: '100%' }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="px-3 pb-3 sm:px-4 sm:pb-4 md:px-6 md:pb-6">
                            <div className="flex flex-col gap-2 sm:gap-3">
                                {/* Social Actions - First Row */}
                                <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                                    <button
                                        onClick={handleShareToX}
                                        className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-md font-medium bg-black text-white hover:bg-neutral-900 transition-colors border border-neutral-700 cursor-pointer text-xs sm:text-sm"
                                    >
                                        <XIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                                        <span>Post on X</span>
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-md font-medium bg-gradient-to-r from-[#5B51D8] via-[#C13584] to-[#E1306C] text-white hover:brightness-110 transition-all border border-neutral-700 cursor-pointer text-xs sm:text-sm"
                                    >
                                        <Instagram className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                                        <span>Post on Instagram</span>
                                    </button>
                                </div>

                                {/* Primary Actions - Second Row */}
                                <div className="flex gap-2 sm:gap-3">
                                    <ActionButton
                                        icon={Download}
                                        label="Download"
                                        state={downloadState}
                                        onClick={handleDownload}
                                        disabled={!imageUrl || isGenerating}
                                    />
                                    <ActionButton
                                        icon={Copy}
                                        label="Copy"
                                        state={copyState}
                                        onClick={handleCopy}
                                        disabled={!imageUrl || isGenerating}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes modalSpring {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </>
    );
}

function ActionButton({
    icon: Icon,
    label,
    state,
    onClick,
    disabled,
}: {
    icon: typeof Download;
    label: string;
    state: ActionState;
    onClick: () => void;
    disabled: boolean;
}) {
    const isSuccess = state === "success";
    const isLoading = state === "loading";

    return (
        <button
            onClick={onClick}
            disabled={disabled || isLoading}
            className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-4 rounded-md font-medium transition-all cursor-pointer border-2",
                isSuccess
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                    : disabled
                        ? "bg-neutral-800/50 border-neutral-700/50 text-neutral-500 cursor-not-allowed"
                        : "bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400"
            )}
        >
            {isLoading ? <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" /> : isSuccess ? <Check className="w-4 sm:w-5 h-4 sm:h-5" /> : <Icon className="w-4 sm:w-5 h-4 sm:h-5" />}
            <span className="text-xs sm:text-sm">
                {isSuccess ? (label === "Copy" ? "Copied!" : label === "Download" ? "Downloaded!" : "Shared!") : label}
            </span>
        </button>
    );
}
