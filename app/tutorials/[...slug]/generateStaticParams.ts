import { getAllMdPaths } from "@/utils/directory";
import path from "path";
export async function generateStaticParams() {
  const basePath = path.join(process.cwd(), 'subjects');

  const paths = getAllMdPaths(basePath);
  return paths.map((slug) => ({ slug }));
}