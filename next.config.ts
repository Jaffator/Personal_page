import type { NextConfig } from "next";

/**
 * Statically exported, per ADR 0001: the case for Next.js here rests on it
 * producing a static site. Anything that needs a running server invalidates
 * that decision rather than being configured around.
 */
const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
