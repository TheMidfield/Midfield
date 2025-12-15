import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '5mb', // Increase from 1mb default to support image uploads
        },
    },
};

export default nextConfig;
