import type { NextConfig } from "next";
import createMDX from '@next/mdx';
import RemarkMath from "remark-math";
import RehypeKatex from "rehype-katex";

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [RemarkMath],
    rehypePlugins: [RehypeKatex],
  }
})

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
        port: "",
        pathname: "/**",
        search: ''
      }
    ]
  },
  pageExtensions: ['tsx', 'jsx', 'ts', 'js', 'mdx', 'md'],
};

export default withMDX(nextConfig);
