import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/", destination: "/posts", permanent: false }];
  },
};

export default nextConfig;
