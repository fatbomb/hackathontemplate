// lib/mdx-remote.ts
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import 'katex/dist/katex.min.css'; // Required for styling

import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@radix-ui/react-dropdown-menu';

export async function renderMDX(content: string) {
  return await compileMDX({
    source: content,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex],
      },
    },
    components: { Image, Card, CardHeader, CardTitle, CardContent, Separator },
  });
}
