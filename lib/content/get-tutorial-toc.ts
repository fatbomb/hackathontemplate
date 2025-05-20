import fs from 'fs';
import path from 'path';

export interface TOCSection {
  title: string;
  slug: string[];
}

export interface TutorialTOC {
  meta: {
    title?: string;
    author?: string;
  };
  sections: TOCSection[];
}

export async function getTutorialTOC(slug: string[]): Promise<TutorialTOC> {
  const folder = path.join(process.cwd(), 'subjects', ...slug);
  const metaPath = path.join(folder, 'meta.json');

  const meta = fs.existsSync(metaPath)
    ? JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
    : { title: slug.at(-1), author: 'Unknown' };

  const files = fs
    .readdirSync(folder)
    .filter(file => /\.(mdx?|MDX?)$/.test(file))
    .sort();

  const sections: TOCSection[] = files.map(file => {
    const filePath = path.join(folder, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const title = content
      .split('\n')
      .find(line => /^# /.test(line))
      ?.replace(/^# /, '')
      .trim() || file;

    return {
      title,
      slug: [...slug, file.replace(/\.(mdx?|MDX?)$/, '')],
    };
  });

  return { meta, sections };
}
