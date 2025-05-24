import { notFound } from 'next/navigation';
import { renderMDX } from '@/lib/mdx-remote';
import { getDoc } from '@/lib/content/get-doc';
import { getTutorialTOC } from '@/lib/content/get-tutorial-toc';
import { SidebarTOC } from '@/lib/content/components/SidebarTOC';
import { markdownToText } from '@/lib/content/markdownToText';
import ReadableContentCard from '@/lib/content/components/ReadableContentCard';
import { translateReactNodeToBanglaServer, translateTextToBanglaServer } from '@/lib/content/translate';

interface SubjectPageProps {
  params:Promise< {
    slug: string[];
  }>;
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const slug = (await params).slug;
  const doc = await getDoc(slug);
  if (!doc) return notFound();

  const mdxText = markdownToText(doc.content);

  const mdxContent = await renderMDX(doc.content);
  const tutorialSlug = slug.slice(0, -1);
  const { meta, sections } = await getTutorialTOC(tutorialSlug);

  
  const mdxTextBn = await translateTextToBanglaServer(mdxText);
  const mdxContentBn = await translateReactNodeToBanglaServer(mdxContent.content);
  
  // console.log("mdxContentBn", JSON.stringify(mdxContentBn));

  return (
    <div className="flex gap-6 mx-6 my-3">
      <SidebarTOC meta={meta} sections={sections} activeSlug={slug} />
      <ReadableContentCard textEn={mdxText} textBn={mdxTextBn} contentBn={mdxContentBn} contentEn={mdxContent.content}/>
    </div>
  );
}
