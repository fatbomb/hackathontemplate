import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface TOCSection {
  title: string;
  slug: string[];
}

interface SidebarTOCProps {
  meta: {
    title?: string;
    author?: string;
  };
  sections: TOCSection[];
  activeSlug: string[];
}

export function SidebarTOC({ meta, sections, activeSlug }: SidebarTOCProps) {
  return (
    <aside className="w-1/4">
      <Card className="h-full border border-muted-foreground">
        <CardHeader>
          <CardTitle className="text-lg">{meta.title}</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <ScrollArea className="h-[calc(100vh-8rem)] pr-2">
            <ul className="space-y-2">
              {sections.map((section, i) => {
                const sectionSlug = section.slug.join('/');
                const isActive = activeSlug.join('/') === sectionSlug;

                return (
                  <li key={i}>
                    <Link
                      href={`/tutorials/${sectionSlug}`}
                      className={cn(
                        'text-sm hover:underline transition-colors',
                        isActive
                          ? 'font-semibold text-primary'
                          : 'text-muted-foreground'
                      )}
                    >
                      {section.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    </aside>
  );
}
