import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface DocData {
  content: string;
  frontmatter: Record<string, any>;
}

export async function getDoc(slug: string[]): Promise<DocData | null> {
  const basePath = path.join(process.cwd(), 'subjects');
  const fileBase = path.join(basePath, ...slug);
  const filePath =
    fs.existsSync(fileBase + '.md') ? fileBase + '.md'
    : fs.existsSync(fileBase + '.mdx') ? fileBase + '.mdx'
    : null;

  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { content, data } = matter(raw);

  return {
    content,
    frontmatter: data,
  };
}
