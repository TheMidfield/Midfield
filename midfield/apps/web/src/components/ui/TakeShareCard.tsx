"use client";

import { User } from "lucide-react";
import { formatDate } from "@midfield/utils";
import { forwardRef } from "react";

interface TakeShareCardProps {
    content: string;
    authorUsername: string;
    authorAvatar?: string;
    createdAt: string;
    topicTitle?: string;
    topicImageUrl?: string;
    topicType?: string;
    isDarkMode?: boolean;
}

/**
 * TakeShareCard — Premium CSS-only visual template for shareable images
 * Dimensions: 1080×1350 (4:5 portrait ratio)
 * No external images - uses styled initials and CSS gradients for reliability
 */
export const TakeShareCard = forwardRef<HTMLDivElement, TakeShareCardProps>(
    function TakeShareCard({ content, authorUsername, createdAt, topicTitle, topicType, isDarkMode = true }, ref) {
        const isClub = topicType === 'club';

        // Dynamic font size based on content length
        const getContentFontSize = () => {
            const len = content.length;
            if (len < 50) return 72;
            if (len < 100) return 60;
            if (len < 200) return 52;
            if (len < 350) return 44;
            return 36;
        };

        const contentFontSize = getContentFontSize();

        // Theme colors
        const bg = isDarkMode ? "#0a0a0a" : "#ffffff";
        const textPrimary = isDarkMode ? "#fafafa" : "#171717";
        const textSecondary = isDarkMode ? "#a3a3a3" : "#525252";
        const textMuted = isDarkMode ? "#737373" : "#737373";
        const border = isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
        const accent = "#10b981";
        const accentBg = isDarkMode ? "rgba(16, 185, 129, 0.05)" : "rgba(16, 185, 129, 0.08)";
        const glowOpacity = isDarkMode ? 0.2 : 0.15;

        return (
            <div
                ref={ref}
                style={{
                    width: 1080,
                    height: 1350,
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: bg,
                    color: textPrimary,
                    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 8,
                }}
            >
                {/* Emerald gradient glow - top left */}
                <div
                    style={{
                        position: "absolute",
                        top: -300,
                        left: -300,
                        width: 800,
                        height: 800,
                        background: `radial-gradient(circle, rgba(16, 185, 129, ${glowOpacity}) 0%, transparent 60%)`,
                        pointerEvents: "none",
                    }}
                />

                {/* Emerald gradient glow - bottom right */}
                <div
                    style={{
                        position: "absolute",
                        bottom: -200,
                        right: -200,
                        width: 600,
                        height: 600,
                        background: `radial-gradient(circle, rgba(16, 185, 129, ${glowOpacity * 0.5}) 0%, transparent 60%)`,
                        pointerEvents: "none",
                    }}
                />

                {/* Header with entity */}
                <div
                    style={{
                        padding: "48px 64px",
                        borderBottom: `2px solid ${border}`,
                        position: "relative",
                        zIndex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 32,
                    }}
                >
                    {/* Entity Initial Badge - CSS only */}
                    <div
                        style={{
                            width: 160,
                            height: 160,
                            borderRadius: isClub ? 20 : 80,
                            background: isDarkMode
                                ? "linear-gradient(135deg, #1a1a1a 0%, #262626 100%)"
                                : "linear-gradient(135deg, #f5f5f5 0%, #e5e5e5 100%)",
                            border: `4px solid ${accent}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 80,
                                fontWeight: 800,
                                color: accent,
                            }}
                        >
                            {topicTitle?.charAt(0)?.toUpperCase() || "M"}
                        </span>
                    </div>

                    {/* Topic name */}
                    <div style={{ flex: 1 }}>
                        <h1
                            style={{
                                fontSize: 80,
                                fontWeight: 800,
                                color: textPrimary,
                                margin: 0,
                                letterSpacing: "-0.02em",
                                lineHeight: 1.1,
                            }}
                        >
                            {topicTitle}
                        </h1>
                        <p style={{
                            fontSize: 28,
                            color: textMuted,
                            margin: "12px 0 0 0",
                            fontWeight: 500
                        }}>
                            {isClub ? "Club Discussion" : "Player Discussion"}
                        </p>
                    </div>
                </div>

                {/* Main content area */}
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        padding: "48px 64px",
                        position: "relative",
                        zIndex: 1,
                    }}
                >
                    {/* Quote decorative marks */}
                    <div
                        style={{
                            fontSize: 180,
                            lineHeight: 0.7,
                            color: `rgba(16, 185, 129, ${isDarkMode ? 0.25 : 0.15})`,
                            fontFamily: "Georgia, serif",
                            marginBottom: 16,
                            marginLeft: -20,
                        }}
                    >
                        "
                    </div>

                    {/* Take content - DYNAMIC SIZE */}
                    <p
                        style={{
                            fontSize: contentFontSize,
                            lineHeight: 1.4,
                            fontWeight: 600,
                            color: textPrimary,
                            margin: 0,
                            flex: 1,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                        }}
                    >
                        {content}
                    </p>
                </div>

                {/* Author section */}
                <div
                    style={{
                        padding: "36px 64px",
                        borderTop: `2px solid ${border}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 24,
                        position: "relative",
                        zIndex: 1,
                        backgroundColor: accentBg,
                    }}
                >
                    {/* User Avatar - CSS gradient with initial */}
                    <div
                        style={{
                            width: 88,
                            height: 88,
                            borderRadius: 12,
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <span style={{
                            fontSize: 44,
                            fontWeight: 800,
                            color: "#ffffff"
                        }}>
                            {authorUsername?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                    </div>

                    {/* Username and date */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span
                            style={{
                                fontSize: 36,
                                fontWeight: 700,
                                color: accent,
                            }}
                        >
                            @{authorUsername}
                        </span>
                        <span style={{ fontSize: 26, color: textMuted }}>
                            {formatDate(new Date(createdAt))}
                        </span>
                    </div>
                </div>

                {/* Footer - Midfield branding */}
                <div
                    style={{
                        padding: "32px 64px",
                        borderTop: `2px solid ${border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        position: "relative",
                        zIndex: 1,
                        backgroundColor: isDarkMode ? "rgba(16, 185, 129, 0.03)" : "rgba(16, 185, 129, 0.05)",
                    }}
                >
                    {/* Logo - Pure CSS */}
                    <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                        <div
                            style={{
                                width: 120,
                                height: 120,
                                borderRadius: 24,
                                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <span style={{
                                fontSize: 72,
                                fontWeight: 800,
                                color: "#ffffff"
                            }}>
                                M
                            </span>
                        </div>
                        <span
                            style={{
                                fontSize: 64,
                                fontWeight: 800,
                                letterSpacing: "-0.02em",
                                background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            Midfield
                        </span>
                    </div>

                    {/* CTA */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: 4,
                        }}
                    >
                        <span style={{ fontSize: 28, color: textSecondary }}>
                            Join the conversation
                        </span>
                        <span
                            style={{
                                fontSize: 48,
                                fontWeight: 800,
                                color: accent,
                                letterSpacing: "-0.01em",
                            }}
                        >
                            midfield.app
                        </span>
                    </div>
                </div>
            </div>
        );
    }
);
