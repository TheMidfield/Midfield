import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

// 1080×1350 (4:5 portrait ratio)
const WIDTH = 1080;
const HEIGHT = 1080;

/**
 * Format date to match app format
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
 * Calculate dynamic font size for quote content
 * Ensures consistent visual weight and space occupation
 */
function getContentFontSize(length: number): number {
    // Increased sizes for better visual weight
    // Very short takes (tweet-length)
    if (length < 40) return 64;
    // Short takes
    if (length < 80) return 56;
    // Medium-short takes
    if (length < 140) return 48;
    // Medium takes
    if (length < 200) return 42;
    // Medium-long takes
    if (length < 280) return 36;
    // Long takes
    if (length < 400) return 32;
    // Very long takes
    return 28;
}

export async function POST(request: NextRequest) {
    const body = await request.json();

    // Extract params from body
    const {
        content = '',
        authorUsername = 'anonymous',
        topicTitle = 'Topic',
        topicType = 'player',
        topicImageUrl,
        authorAvatarUrl,
        createdAt = new Date().toISOString(),
        theme = 'dark',
        clubName,
        clubBadgeUrl,
        topicPosition
    } = body;

    const isDark = theme === 'dark';
    const isClub = topicType === 'club';

    // App color palette - exact match (Referencing globals.css)
    // Dark: Neutral #1A1A1A / #1D1D1D | Light: Slate/White #f8fafc / #ffffff
    const bg = isDark ? '#0a0a0a' : '#f8fafc'; // --body-background
    const cardBg = isDark ? '#171717' : '#ffffff'; // --card
    const footerBg = isDark ? '#0f0f0f' : '#f1f5f9'; // Slate 100 for light mode footer
    const textPrimary = isDark ? '#fafafa' : '#0f172a'; // --foreground
    const textSecondary = isDark ? '#a3a3a3' : '#64748b'; // --muted-foreground
    const textMuted = isDark ? '#737373' : '#94a3b8'; // Lighter slate for date/metadata
    const border = isDark ? '#262626' : '#a3aebaff'; // Slate 300 for clearer visibility
    const accent = '#10b981'; // --primary / --color-midfield-green
    const accentBg = isDark ? '#022c22' : '#ecfdf5'; // Emerald 50
    const watermarkOpacity = isDark ? 0.04 : 0.08; // Stronger watermark in light mode

    const contentFontSize = getContentFontSize(content.length);
    const origin = request.nextUrl.origin;
    // Optimization: Load logo from FS to avoid internal fetch issues
    const logoPath = path.join(process.cwd(), 'public/midfield-logo.png');
    let logoUrl = `${origin}/midfield-logo.png`;

    // Try to load local logo as base64 for robustness
    try {
        const logoPathLocal = path.join(process.cwd(), 'apps/web/public/midfield-logo.png'); // Try repo path first
        if (fs.existsSync(logoPathLocal)) {
            const logoBuffer = fs.readFileSync(logoPathLocal);
            logoUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        } else if (fs.existsSync(logoPath)) {
            // Fallback to runtime cwd
            const logoBuffer = fs.readFileSync(logoPath);
            logoUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        }
    } catch (e) {
        console.warn("Could not load logo locally, falling back to URL", e);
    }

    // Load fonts
    let fonts: any[] = [];

    try {
        const cwd = process.cwd();

        // Define possible file variants and locations to search
        const findFontFile = (filename: string, subpaths: string[]) => {
            const searchPaths = [
                // In apps/web (typical runtime CWD)
                path.join(cwd, 'public/fonts'),
                path.join(cwd, 'src/assets/fonts'),
                // From root (if running from monorepo root)
                path.join(cwd, 'apps/web/public/fonts'),
                path.join(cwd, 'apps/web/src/assets/fonts'),
            ];

            for (const basePath of searchPaths) {
                for (const subpath of subpaths) {
                    const fullPath = path.join(basePath, subpath, filename);
                    if (fs.existsSync(fullPath)) {
                        return fullPath;
                    }
                }
                // Also check direct children of base path
                const directPath = path.join(basePath, filename);
                if (fs.existsSync(directPath)) {
                    return directPath;
                }
            }
            return null;
        };

        const loadFontBuffer = (filename: string, subpaths: string[]) => {
            const fontPath = findFontFile(filename, subpaths);
            if (!fontPath) throw new Error(`Font file not found: ${filename}`);
            // Convert Buffer to ArrayBuffer for Satori compatibility
            return new Uint8Array(fs.readFileSync(fontPath)).buffer;
        };

        // Load fonts with fallback search
        const dmSansRegular = loadFontBuffer('DMSans-Regular.ttf', ['DM_Sans/static', 'DM_Sans']);
        const dmSansBold = loadFontBuffer('DMSans-Bold.ttf', ['DM_Sans/static', 'DM_Sans']);
        const onestMedium = loadFontBuffer('Onest-Medium.ttf', ['Onest/static', 'Onest']);
        const onestBold = loadFontBuffer('Onest-Bold.ttf', ['Onest/static', 'Onest']);

        fonts = [
            { name: 'DM Sans', data: dmSansRegular, style: 'normal', weight: 400 },
            { name: 'DM Sans', data: dmSansBold, style: 'normal', weight: 700 },
            { name: 'Onest', data: onestMedium, style: 'normal', weight: 500 },
            { name: 'Onest', data: onestBold, style: 'normal', weight: 700 },
        ];
    } catch (e: any) {
        console.error("ShareCard: Font loading failed (FS)", e);
        // Fail gracefully to system fonts if something goes wrong
    }

    return new ImageResponse(
        (
            <div
                style={{
                    width: WIDTH,
                    height: HEIGHT,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: bg,
                    fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    padding: 40,
                }}
            >
                {/* Main Card */}
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: cardBg,
                        borderRadius: 12,
                        border: `1px solid ${border}`,
                        overflow: 'hidden',
                    }}
                >
                    {/* HEADER ZONE - Entity Header Style */}
                    <div
                        style={{
                            display: 'flex',
                            padding: isClub ? '48px 56px 48px 56px' : '0px 56px 0 56px',
                            borderBottom: `1px solid ${border}`,
                            gap: 40,
                            alignItems: isClub ? 'center' : 'flex-end', // Center align for clubs
                            position: 'relative',
                            overflow: 'hidden', // Contain the watermark
                        }}
                    >
                        {/* Watermark - Only for clubs/teams */}
                        {isClub && topicImageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={topicImageUrl}
                                width={600}
                                height={600}
                                style={{
                                    position: 'absolute',
                                    right: -150,
                                    top: -150,
                                    opacity: watermarkOpacity,
                                    transform: 'rotate(15deg)',
                                    pointerEvents: 'none',
                                }}
                                alt=""
                            />
                        )}

                        {/* Player/Club Image */}
                        <div
                            style={{
                                display: 'flex',
                                position: 'relative',
                                width: isClub ? 200 : 250,
                                height: isClub ? 200 : 340,
                                alignItems: 'flex-end',
                                justifyContent: 'center',
                                marginBottom: isClub ? 0 : -44,
                            }}
                        >
                            {topicImageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={topicImageUrl}
                                    width={isClub ? 200 : 250}
                                    height={isClub ? 200 : 340}
                                    style={{
                                        objectFit: 'contain',
                                        objectPosition: isClub ? 'center' : 'bottom',
                                        display: 'block',
                                    }}
                                    alt=""
                                />
                            ) : (
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: isDark ? '#262626' : '#f5f5f5',
                                        borderRadius: isClub ? 24 : 12,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 84,
                                        fontWeight: 700,
                                        color: textMuted,
                                        fontFamily: '"Onest", -apple-system, sans-serif',
                                        marginBottom: 48,
                                    }}
                                >
                                    {topicTitle.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Entity Info */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 24,
                                flex: 1,
                                justifyContent: 'center',
                                marginBottom: isClub ? 0 : 34, // Reset text lift for clubs
                            }}
                        >
                            {/* Title */}
                            <h1
                                style={{
                                    fontSize: 56,
                                    fontWeight: 700,
                                    color: textPrimary,
                                    margin: 0,
                                    lineHeight: 1.05,
                                    letterSpacing: '-0.02em',
                                    fontFamily: '"Onest", -apple-system, sans-serif',
                                }}
                            >
                                {topicTitle}
                            </h1>

                            {/* Club Badge & Name (Prominent) + Metadata */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                                {/* CLUB ENTITY - League Badge */}
                                {/* PLAYER ENTITY - Club Info */}
                                {!isClub && clubName && clubBadgeUrl && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={clubBadgeUrl}
                                            width={44}
                                            height={44}
                                            style={{ objectFit: 'contain' }}
                                            alt=""
                                        />
                                        <span
                                            style={{
                                                fontSize: 32,
                                                color: textSecondary,
                                                fontWeight: 500,
                                                fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            }}
                                        >
                                            {clubName}
                                        </span>
                                    </div>
                                )}

                                {/* Badges row */}
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    {/* Type badge */}
                                    <div
                                        style={{
                                            backgroundColor: isDark ? '#262626' : '#f5f5f5',
                                            color: textSecondary,
                                            padding: '8px 16px',
                                            borderRadius: 8,
                                            fontSize: 20,
                                            fontWeight: 600,
                                            textTransform: 'capitalize',
                                            fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        }}
                                    >
                                        {isClub ? 'Club' : 'Player'}
                                    </div>

                                    {/* Position / League badge */}
                                    {(topicPosition || !isClub) && (
                                        <div
                                            style={{
                                                backgroundColor: accentBg,
                                                color: accent,
                                                padding: '8px 16px',
                                                borderRadius: 8,
                                                fontSize: 20,
                                                fontWeight: 600,
                                                fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            }}
                                        >
                                            {topicPosition || 'Player'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TAKE ZONE - Expanded & Refined */}
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '48px 56px',
                        }}
                    >
                        {/* Top: Avatar, Username, Date */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center', // This ensures vertical centering for the whole row
                                gap: 16,
                                marginBottom: 32,
                            }}
                        >
                            {/* Avatar */}
                            <div
                                style={{
                                    width: 80,
                                    height: 80,
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
                                        width={80}
                                        height={80}
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
                                            fontSize: 36,
                                            fontWeight: 700,
                                            color: '#ffffff',
                                            fontFamily: '"Onest", -apple-system, sans-serif',
                                        }}
                                    >
                                        {authorUsername.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>

                            {/* Username & Date */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span
                                    style={{
                                        fontSize: 36,
                                        fontWeight: 600,
                                        color: accent,
                                        fontFamily: '"Onest", -apple-system, sans-serif',
                                    }}
                                >
                                    @{authorUsername}
                                </span>
                                <span style={{ color: isDark ? '#404040' : '#d4d4d8', fontSize: 24, marginTop: 4, marginLeft: 12 }}>•</span>
                                <span
                                    style={{
                                        fontSize: 28,
                                        color: textMuted,
                                        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        marginTop: 2,
                                    }}
                                >
                                    {formatDate(createdAt)}
                                </span>
                            </div>
                        </div>

                        {/* Take content - full width, no indent */}
                        <p
                            style={{
                                fontSize: contentFontSize,
                                lineHeight: 1.4,
                                color: textPrimary,
                                margin: 0,
                                fontWeight: 400,
                                whiteSpace: 'pre-wrap',
                                fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            }}
                        >
                            {content}
                        </p>
                    </div>

                    {/* FOOTER */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '40px 56px',
                            borderTop: `1px solid ${border}`,
                            backgroundColor: footerBg,
                        }}
                    >
                        {/* Logo + Wordmark */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={logoUrl}
                                width={48}
                                height={48}
                                style={{
                                    objectFit: 'contain',
                                }}
                                alt=""
                            />
                            <span
                                style={{
                                    fontSize: 36,
                                    fontWeight: 700,
                                    color: textPrimary,
                                    letterSpacing: '-0.02em',
                                    fontFamily: '"Onest", -apple-system, sans-serif',
                                }}
                            >
                                Midfield
                            </span>
                        </div>

                        {/* Slogan & Domain */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                            <span
                                style={{
                                    fontSize: 24,
                                    color: textSecondary,
                                    fontWeight: 500,
                                    fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                }}
                            >
                                Join the conversation
                            </span>
                            <span
                                style={{
                                    fontSize: 24,
                                    color: accent,
                                    fontWeight: 600,
                                    fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                }}
                            >
                                midfield.one
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            width: WIDTH,
            height: HEIGHT,
            fonts: fonts.length > 0 ? fonts : undefined,
        }
    );
}
