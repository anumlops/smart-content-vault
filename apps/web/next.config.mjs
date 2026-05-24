/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  transpilePackages: ["@content-archive/shared"],
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  optimizeFonts: false,
};

export default nextConfig;
