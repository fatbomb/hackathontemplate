import { notFound } from 'next/navigation';
import { renderMDX } from '@/lib/mdx-remote';
import { getDoc } from '@/lib/content/get-doc';
import { getTutorialTOC } from '@/lib/content/get-tutorial-toc';
import { SidebarTOC } from '@/lib/content/components/SidebarTOC';
import { ContentCard } from '@/lib/content/components/ContentCard';

interface SubjectPageProps {
  params: {
    slug: string[];
  };
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const slug = (await params).slug;
  const doc = await getDoc(slug);
  if (!doc) return notFound();

  const mdxContent = await renderMDX(doc.content);
  const tutorialSlug = slug.slice(0, -1);
  const { meta, sections } = await getTutorialTOC(tutorialSlug);

  return (
    <div className="flex gap-6 mx-6 my-3">
      <SidebarTOC meta={meta} sections={sections} activeSlug={slug} />
      <ContentCard>{mdxContent.content}</ContentCard>
    </div>
  );
}
