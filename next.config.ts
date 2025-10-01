// @ts-expect-error no types published for this module
import createSWCPlugin from "@quantfive/codepress-engine/swc";
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
};

export default nextConfig;
