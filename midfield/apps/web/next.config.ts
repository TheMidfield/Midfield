import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '5mb', // Increase from 1mb default to support image uploads
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'bocldhavewgfxmbuycxy.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            },
            {
                protocol: 'https',
                hostname: 'r2.thesportsdb.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'www.thesportsdb.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'api.dicebear.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'media.api-sports.io',
                port: '',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;
