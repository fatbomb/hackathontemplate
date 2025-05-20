import fs, { promises as fsPromises } from 'fs';
import path from 'path';

export async function hasFileWithExtension(path: string, extension: string): Promise<boolean> {
    try {
        const files = await fsPromises.readdir(path);
        return files.some((file: string) => file.endsWith(extension));
    } catch (error) {
        console.error(`Error reading directory ${path}:`, error);
        return false;
    }
}

export function getAllMdPaths (dir: string, base = ''): string[][]{
    let results: string[][] = [];

    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(base, entry.name);

      if (entry.isDirectory()) {
        results.push(...getAllMdPaths(fullPath, relPath));
      } else if (entry.isFile() && /\.(mdx?|MDX?)$/.test(entry.name)) {
        const slugArray = relPath.replace(/\.(mdx?|MDX?)$/, '').split(path.sep);
        results.push(slugArray);
      }
    });

    return results;
  };