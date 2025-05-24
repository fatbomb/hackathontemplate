import { v2 as Translate } from '@google-cloud/translate';
import { ReactNode, isValidElement, cloneElement, ReactElement } from 'react';

interface TranslateOptions {
  keyFilename?: string;
}

interface ElementWithClassName {
  props: {
    className?: string;
    children?: ReactNode;
    [key: string]: unknown;
  };
}

const translate = new Translate.Translate({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
} as TranslateOptions);

export async function translateTextToBanglaServer(text: string): Promise<string> {
  if (!text.trim()) return '';
  try {
    const [translated] = await translate.translate(text, 'bn');
    return translated;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
}

export async function translateReactNodeToBanglaServer(node: ReactNode): Promise<ReactNode> {
  // Handle primitive types
  if (typeof node === 'string') {
    return await translateTextToBanglaServer(node);
  }

  if (typeof node === 'number' || typeof node === 'boolean' || node === null || node === undefined) {
    return node;
  }

  // Handle arrays
  if (Array.isArray(node)) {
    const translatedChildren = await Promise.all(
      node.map(async (child) => await translateReactNodeToBanglaServer(child))
    );
    return translatedChildren;
  }

  // Handle React elements
  if (isValidElement(node)) {
    const element = node as ReactElement<ElementWithClassName['props']>;

    // Skip translation for certain elements
    if (element.type === 'code') return element;
    
    const className = element.props.className;
    if (typeof className === 'string' && className.includes('katex')) {
      return element;
    }

    // Recursively translate children
    const translatedChildren = await translateReactNodeToBanglaServer(element.props.children);
    return cloneElement(element, { ...element.props, children: translatedChildren });
  }

  // Fallback for other cases
  return node;
}