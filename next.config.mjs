/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets the ngrok tunnel load /_next/* assets during local dev.
  // Dev-only: Next ignores this in production builds.
  allowedDevOrigins: ["pasture-blunt-buckshot.ngrok-free.dev"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "assets.cdn.filesafe.space",
      },
    ],
  },
};

export default nextConfig;