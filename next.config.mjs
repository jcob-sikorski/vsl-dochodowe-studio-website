/** @type {import('next').NextConfig} */
const nextConfig = {
  // /see-you → /materialy → /przygotowanie. Old links (emails, CRM, links the
  // setters already sent) keep working; the query string is carried over.
  async redirects() {
    return [
      { source: "/see-you", destination: "/przygotowanie", permanent: true },
      { source: "/materialy", destination: "/przygotowanie", permanent: true },
    ];
  },

  // Hostnames allowed to load /_next/* assets from the dev server.
  // Dev-only: Next ignores this in production builds.
  allowedDevOrigins: [
    "vsl-dochodowe-studio-website.vercel.app",
    "vsl.dochodowestudio.com",
    "pasture-blunt-buckshot.ngrok-free.dev"
  ],

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