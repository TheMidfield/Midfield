import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// 1080×1350 (4:5 portrait ratio for Instagram/social)
const WIDTH = 1080;
const HEIGHT = 1350;

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    } catch {
        return dateString;
    }
}

/**
 * Calculate dynamic font size based on content length
 */
function getContentFontSize(length: number): number {
    if (length < 50) return 64;
    if (length < 100) return 56;
    if (length < 200) return 48;
    if (length < 350) return 40;
    return 34;
}

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;

    // Extract params
    const content = searchParams.get('content') || '';
    const authorUsername = searchParams.get('authorUsername') || 'anonymous';
    const topicTitle = searchParams.get('topicTitle') || 'Topic';
    const topicType = searchParams.get('topicType') || 'player';
    const topicImageUrl = searchParams.get('topicImageUrl');
    const authorAvatarUrl = searchParams.get('authorAvatarUrl');
    const createdAt = searchParams.get('createdAt') || new Date().toISOString();
    const theme = searchParams.get('theme') || 'dark';

    const isDark = theme === 'dark';
    const isClub = topicType === 'club';

    // Theme colors - Clinical, modern palette
    const bg = isDark ? '#09090b' : '#fafafa';
    const cardBg = isDark ? '#18181b' : '#ffffff';
    const textPrimary = isDark ? '#fafafa' : '#09090b';
    const textSecondary = isDark ? '#a1a1aa' : '#71717a';
    const textMuted = isDark ? '#71717a' : '#a1a1aa';
    const borderColor = isDark ? '#27272a' : '#e4e4e7';
    const accent = '#10b981';

    const contentFontSize = getContentFontSize(content.length);

    // Get the base URL for the logo
    const origin = request.nextUrl.origin;
    const logoUrl = `${origin}/midfield-logo.png`;

    return new ImageResponse(
        (
            <div
                style={{
                    width: WIDTH,
                    height: HEIGHT,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: bg,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    padding: 48,
                }}
            >
                {/* Main Card */}
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: cardBg,
                        borderRadius: 32,
                        border: `2px solid ${borderColor}`,
                        overflow: 'hidden',
                    }}
                >
                    {/* Header - Entity Info */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 28,
                            padding: '40px 48px',
                            borderBottom: `1px solid ${borderColor}`,
                        }}
                    >
                        {/* Entity Image */}
                        <div
                            style={{
                                width: 100,
                                height: 100,
                                borderRadius: isClub ? 20 : 50,
                                backgroundColor: isDark ? '#27272a' : '#f4f4f5',
                                border: `2px solid ${borderColor}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                            }}
                        >
                            {topicImageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={topicImageUrl}
                                    width={100}
                                    height={100}
                                    style={{
                                        objectFit: 'cover',
                                        width: '100%',
                                        height: '100%',
                                    }}
                                    alt=""
                                />
                            ) : (
                                <span
                                    style={{
                                        fontSize: 48,
                                        fontWeight: 700,
                                        color: textMuted,
                                    }}
                                >
                                    {topicTitle.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>

                        {/* Topic Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <span
                                style={{
                                    fontSize: 44,
                                    fontWeight: 700,
                                    color: textPrimary,
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                {topicTitle}
                            </span>
                            <span
                                style={{
                                    fontSize: 22,
                                    fontWeight: 500,
                                    color: textSecondary,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                }}
                            >
                                {isClub ? 'Club' : 'Player'} Discussion
                            </span>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '48px 56px',
                            position: 'relative',
                        }}
                    >
                        {/* Accent Line */}
                        <div
                            style={{
                                position: 'absolute',
                                left: 48,
                                top: 48,
                                bottom: 48,
                                width: 4,
                                backgroundColor: accent,
                                borderRadius: 2,
                            }}
                        />

                        {/* Quote Content */}
                        <div
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                paddingLeft: 24,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: contentFontSize,
                                    lineHeight: 1.35,
                                    fontWeight: 500,
                                    color: textPrimary,
                                    wordBreak: 'break-word',
                                }}
                            >
                                "{content}"
                            </span>
                        </div>
                    </div>

                    {/* Author Section */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '32px 48px',
                            borderTop: `1px solid ${borderColor}`,
                            backgroundColor: isDark ? '#0f0f10' : '#f4f4f5',
                        }}
                    >
                        {/* Author Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            {/* Avatar */}
                            <div
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 16,
                                    backgroundColor: accent,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                }}
                            >
                                {authorAvatarUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={authorAvatarUrl}
                                        width={64}
                                        height={64}
                                        style={{
                                            objectFit: 'cover',
                                            width: '100%',
                                            height: '100%',
                                        }}
                                        alt=""
                                    />
                                ) : (
                                    <span
                                        style={{
                                            fontSize: 28,
                                            fontWeight: 700,
                                            color: '#ffffff',
                                        }}
                                    >
                                        {authorUsername.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>

                            {/* Username & Date */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span
                                    style={{
                                        fontSize: 26,
                                        fontWeight: 700,
                                        color: textPrimary,
                                    }}
                                >
                                    @{authorUsername}
                                </span>
                                <span
                                    style={{
                                        fontSize: 20,
                                        fontWeight: 500,
                                        color: textMuted,
                                    }}
                                >
                                    {formatDate(createdAt)}
                                </span>
                            </div>
                        </div>

                        {/* Midfield Logo */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                            }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={logoUrl}
                                width={160}
                                height={40}
                                style={{
                                    objectFit: 'contain',
                                    opacity: isDark ? 1 : 0.9,
                                }}
                                alt=""
                            />
                        </div>
                    </div>
                </div>

                {/* Footer - CTA */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingTop: 32,
                    }}
                >
                    <span
                        style={{
                            fontSize: 24,
                            fontWeight: 500,
                            color: textMuted,
                        }}
                    >
                        Join the conversation at{' '}
                        <span style={{ color: accent, fontWeight: 700 }}>midfield.app</span>
                    </span>
                </div>
            </div>
        ),
        {
            width: WIDTH,
            height: HEIGHT,
        }
    );
}
