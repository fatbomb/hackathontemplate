"use client";
import { Card, CardContent } from '@/components/ui/card';
import RichTextStyle from '@/styles/richTextStyle.module.css';
import React, { useEffect, ReactNode, ReactElement } from 'react';
import { Loader2 } from 'lucide-react';

const translationCache = new Map<string, ReactNode>();

interface TranslationResponse {
  translated: string;
}

interface TranslateRequest {
  text: string;
  to: string;
}

export function ContentCard({
  content,
  language,
}: {
  content: ReactNode;
  language: string;
}) {
  const [cont, setCont] = React.useState<ReactNode>(content);
  const [loading, setLoading] = React.useState(false);

  async function translateNode(node: ReactNode): Promise<ReactNode> {
    if (typeof node === 'string') {
      try {
        const res = await fetch(`/api/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: node,
            to: language,
          } satisfies TranslateRequest),
        });

        if (!res.ok) {
          throw new Error(`Translation failed: ${res.status}`);
        }

        const data = await res.json() as TranslationResponse;
        return data.translated;
      } catch (error) {
        console.error('Translation error:', error);
        return node;
      }
    }

    if (Array.isArray(node)) {
      const translatedNodes: ReactNode[] = [];
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
      const element = node as ReactElement<{ children?: ReactNode }>;
      const children = await translateNode(element.props.children);
      return React.cloneElement(element, {
        ...element.props,
        children,
      });
    }

    return node;
  }

  useEffect(() => {
    const cacheKey = `${language}-${JSON.stringify(content)}`;

    async function fetchTranslation() {
      setLoading(true);
      
      if (translationCache.has(cacheKey)) {
        setCont(translationCache.get(cacheKey)!);
        setLoading(false);
        return;
      }

      try {
        const translated = await translateNode(content);
        translationCache.set(cacheKey, translated);
        setCont(translated);
      } finally {
        setLoading(false);
      }
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
          <div className="flex justify-center items-center gap-2 w-full h-full text-muted-foreground">
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