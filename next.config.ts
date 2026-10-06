import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Playwright builds into a separate folder so `npm run build` / `.next` stay untouched.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  async redirects() {
    return [{ source: "/", destination: "/posts", permanent: false }];
  },
};

export default nextConfig;
