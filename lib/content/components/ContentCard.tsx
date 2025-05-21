"use client";
import { Card, CardContent } from '@/components/ui/card';
import RichTextStyle from '@/styles/richTextStyle.module.css';

export function ContentCard({ content }: {content: React.ReactNode}) {
  return (
    <Card className="w-full">
      <CardContent className={`${RichTextStyle.richtext} p-10`}>
        {content}
      </CardContent>
    </Card>
  );
}
