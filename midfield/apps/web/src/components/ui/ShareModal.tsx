"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Download, Copy, Check, Loader2, Sun, Moon } from "lucide-react";
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
    postId?: string;
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

// Custom Reddit Logo
function RedditIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.056 1.597.04.21.065.422.065.641 0 2.454-2.874 4.453-6.416 4.453-3.542 0-6.415-1.999-6.415-4.453 0-.192.02-.38.05-.565a1.753 1.753 0 0 1-1.026-1.583c0-.968.784-1.754 1.754-1.754.463 0 .883.18 1.189.47 1.187-.82 2.798-1.35 4.568-1.447l.886-4.156c.01-.042.04-.075.078-.087l3.353.746c.113-.374.457-.646.864-.646zm-6.255 7.15c-.69 0-1.252.56-1.252 1.25s.562 1.25 1.252 1.25c.69 0 1.252-.56 1.252-1.25s-.562-1.25-1.252-1.25zm4.5 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25c.69 0 1.252-.56 1.252-1.25s-.562-1.25-1.252-1.25zm-2.185 3.012c-.25 0-.491.03-.715.084a4.1 4.1 0 0 0-1.474-.46c-.22 0-.4.18-.4.4s.18.4.4.4c.01 0 .61.03 1.28.31.064.026.13.04.197.04.254 0 .491-.033.71-.09l.004.01c.07.031.146.046.222.046.22 0 .4-.18.4-.4s-.18-.4-.4-.4z" />
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
    postId,
}: ShareModalProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [downloadState, setDownloadState] = useState<ActionState>("idle");
    const [copyState, setCopyState] = useState<ActionState>("idle");
    const [isDarkMode, setIsDarkMode] = useState(true);

    const hasGenerated = useRef(false);

    // Generate image via server-side API (no CORS issues!)
    const generateImage = useCallback(async () => {
        setIsGenerating(true);
        // Don't clear imageUrl strictly here to avoid flickering on theme toggle
        // setImageUrl(null); 

        try {
            const response = await fetch('/api/share-card', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content,
                    authorUsername,
                    topicTitle: topicTitle || '',
                    topicType: topicType || 'player',
                    createdAt,
                    theme: isDarkMode ? 'dark' : 'light',
                    topicImageUrl,
                    authorAvatarUrl: authorAvatar,
                    clubName,
                    clubBadgeUrl,
                    topicPosition,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate image');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            // Clean up old URL if exists
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }

            setImageUrl(url);
        } catch (error) {
            console.error("Failed to generate image:", error);
        } finally {
            setIsGenerating(false);
        }
    }, [content, authorUsername, authorAvatar, topicTitle, topicImageUrl, topicType, createdAt, isDarkMode, clubName, clubBadgeUrl, topicPosition]);

    // Generate when modal opens
    useEffect(() => {
        if (isOpen && !hasGenerated.current) {
            generateImage();
            hasGenerated.current = true;
        } else if (!isOpen) {
            // Cleanup when modal closes
            hasGenerated.current = false;
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
                setImageUrl(null);
            }
            setDownloadState("idle");
            setCopyState("idle");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]); // Only depend on isOpen to prevent loops

    // Regenerate when theme changes
    useEffect(() => {
        if (isOpen && imageUrl) {
            // Only regenerate if already open and previously generated
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
        const text = encodeURIComponent(`" ${content.length > 140 ? content.substring(0, 137) + '...' : content} "\n\n${authorUsername}'s take on ${topicTitle || 'Midfield'}`);

        // Construct unique URL for this post if ID available
        let url = window.location.href;
        if (postId) {
            const urlObj = new URL(url);
            urlObj.searchParams.set('post', postId);
            url = urlObj.toString();
        }
        const shareUrl = encodeURIComponent(url);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`, '_blank');
    };

    // Reddit share handler
    const handleShareToReddit = () => {
        const title = encodeURIComponent(`${authorUsername}'s take on ${topicTitle || 'football'}: "${content.length > 100 ? content.substring(0, 97) + '...' : content}"`);

        // Construct unique URL for this post if ID available
        let url = window.location.href;
        if (postId) {
            const urlObj = new URL(url);
            urlObj.searchParams.set('post', postId);
            url = urlObj.toString();
        }
        const encodedUrl = encodeURIComponent(url);

        // Default to r/soccer as it's the biggest relevant community
        window.open(`https://www.reddit.com/r/soccer/submit?url=${encodedUrl}&title=${title}`, '_blank');
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
                                        className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-md font-medium bg-black text-white hover:bg-neutral-900 transition-colors border border-neutral-700 cursor-pointer text-xs sm:text-sm"
                                    >
                                        <XIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                                        <span>Post on X</span>
                                    </button>
                                    <button
                                        onClick={handleShareToReddit}
                                        className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-md font-medium bg-[#FF4500] text-white hover:brightness-110 transition-all border border-neutral-700 cursor-pointer text-xs sm:text-sm"
                                    >
                                        <RedditIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                                        <span>Post on Reddit</span>
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
