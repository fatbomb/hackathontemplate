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
  
  // Add transpilation configuration for framer-motion
  transpilePackages: ['framer-motion'],
  
  // Optional: Add webpack configuration to handle problematic exports
  webpack: (config) => {
    // Handle 'export *' issue in framer-motion
    config.module.rules.push({
      test: /node_modules\/framer-motion/,
      sideEffects: false,
    });
    
    return config;
  },
};

export default withMDX(nextConfig);