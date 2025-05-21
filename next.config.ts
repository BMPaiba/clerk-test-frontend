import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [
      { module: /node_modules/ },
      { message: /export.*was not found in/ },
      { message: /Critical dependency: the request of a dependency is an expression/ },
      { message: /Module not found: Can't resolve/ },
    ];
    return config;
  },
};

export default nextConfig;
