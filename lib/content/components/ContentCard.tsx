"use client";
import { Card, CardContent } from '@/components/ui/card';
import RichTextStyle from '@/styles/richTextStyle.module.css';
import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const translationCache = new Map<string, React.ReactNode>();

export function ContentCard({
  content,
  language,
}: {
  content: React.ReactNode;
  language: string;
}) {
  const [cont, setCont] = React.useState<React.ReactNode>(content);
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    const cacheKey = `${language}-${JSON.stringify(content)}`;

    async function translateNode(node: React.ReactNode): Promise<React.ReactNode> {
      if (typeof node === 'string') {
        const res = await fetch(`/api/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: node,
            to: language,
          }),
        });

        if (!res.ok) {
          console.error('Translation error:', await res.text());
          return node;
        }

        const data = await res.json();
        return data.translated;
      }

      if (Array.isArray(node)) {
        const translatedNodes = [];
        for (let i = 0; i < node.length; i++) {
          const translated = await translateNode(node[i]);
          translatedNodes.push(translated);
          if (i < node.length - 1) {
            translatedNodes.push(' ');
          }
        }
        return translatedNodes;
      }

      if (React.isValidElement(node)) {
        const element = node as React.ReactElement<any>;
        const props = element.props as any;
        const className = props.className || props.class || '';
        if (typeof className === 'string' && className.includes('katex')) {
          return node;
        }
        const children = await translateNode(props.children);
        return React.cloneElement(element, { ...props, children });
      }

      return node;
    }

    async function fetchTranslation() {
      setLoading(true);
      if (translationCache.has(cacheKey)) {
        setCont(translationCache.get(cacheKey)!);
        setLoading(false);
        return;
      }

      const translated = await translateNode(content);
      translationCache.set(cacheKey, translated);
      setCont(translated);
      setLoading(false);
    }

    if (language === 'en-US') {
      setCont(content);
    } else {
      fetchTranslation();
    }
  }, [content, language]);

  return (
    <Card className="w-full">
      <CardContent className={`${RichTextStyle.richtext} p-10 w-full`}>
        {loading ? (
          <div className="w-full h-full flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Translating...
          </div>
        ) : (
          cont
        )}
      </CardContent>
    </Card>
  );
}
