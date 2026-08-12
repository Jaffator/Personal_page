import createMDX from "@next/mdx";
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
  /**
   * `.mdx` joins the page extensions so Case Study prose compiles as source,
   * per ADR 0002. The documents themselves are not routes — they are imported
   * by the Case Study layout — but the loader has to recognise the extension
   * either way.
   */
  pageExtensions: ["ts", "tsx", "mdx"],
};

/**
 * No remark or rehype plugins, deliberately. The prose documents author
 * paragraphs, emphasis and links and nothing else; heading levels come from
 * the layout rather than from `#` in the source (see `app/_case-study/`), so
 * there is no slugger, no autolink and no table of contents to configure.
 * Adding a plugin here is adding a second place a Case Study's structure is
 * decided.
 */
const withMDX = createMDX({});

export default withMDX(nextConfig);
