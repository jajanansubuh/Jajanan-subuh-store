import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Allow specific development origins (e.g. ngrok) to access Next dev resources.
  // Replace the example below with your actual ngrok or tunnel domain.
  allowedDevOrigins: ['https://your-ngrok-subdomain.ngrok-free.app'],
};

export default nextConfig;
