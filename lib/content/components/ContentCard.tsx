import { Card, CardContent } from '@/components/ui/card';
import RichTextStyle from '@/styles/richTextStyle.module.css';

interface ContentCardProps {
  children: React.ReactNode;
}

export function ContentCard({ children }: ContentCardProps) {
  return (
    <Card className="w-3/4">
      <CardContent className={`${RichTextStyle.richtext} p-10`}>
        {children}
      </CardContent>
    </Card>
  );
}
