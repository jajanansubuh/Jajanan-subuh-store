/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Allow specific development origins (e.g. ngrok) to access Next dev resources.
  // Replace the example below with your actual ngrok or tunnel domain.
  allowedDevOrigins: ["https://your-ngrok-subdomain.ngrok-free.app"],
};

module.exports = nextConfig;
