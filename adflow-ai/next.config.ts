import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '**.blackbox.ai',
      },
      {
        protocol: 'https',
        hostname: '**.railway.app',
      },
    ],
  },
  // Optional: Proxy Python backend requests
  async rewrites() {
    const pythonBackend = process.env.PYTHON_BACKEND_URL;
    if (pythonBackend) {
      return [
        {
          source: '/api/python/:path*',
          destination: `${pythonBackend}/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
