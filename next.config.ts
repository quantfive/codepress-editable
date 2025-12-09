import { createSWCPlugin } from "@codepress/codepress-engine/swc";
import CodePressWebpackPlugin from "@codepress/codepress-engine/webpack-plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    swcPlugins: [
      // Use the SWC plugin
      createSWCPlugin({
        repo_name: "quantfive/codepress-editable",
      }),
    ],
  },
  reactStrictMode: true,
  transpilePackages: ["@quantfive/codepress-browser-extension"],
  webpack: (config, { isServer, dev }) => {
    config.plugins.push(new CodePressWebpackPlugin({ isServer, dev }));
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.conditionNames = ["import", "module", "default"];
    return config;
  },
};

export default nextConfig;
