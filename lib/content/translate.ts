import { v2 as Translate } from '@google-cloud/translate';
import { ReactNode, isValidElement, cloneElement } from 'react';

const translate = new Translate.Translate({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export async function translateTextToBanglaServer(text: string): Promise<string> {
  if (!text.trim()) return '';
  const [translated] = await translate.translate(text, 'bn');
  return translated;
}

export async function translateReactNodeToBanglaServer(node: ReactNode): Promise<ReactNode> {
  if (typeof node === 'string') {
    return await translateTextToBanglaServer(node);
  }

  if (typeof node === 'number' || typeof node === 'boolean' || node === null || node === undefined) {
    return node;
  }

  if (Array.isArray(node)) {
    const translatedChildren = await Promise.all(
      node.map(async (child) => await translateReactNodeToBanglaServer(child))
    );
    return translatedChildren;
  }

  if (isValidElement(node)) {
    const element = node as React.ReactElement<any>;

    if (element.type === 'code') return element;
    if (
      typeof element.props.className === 'string' &&
      element.props.className.includes('katex')
    ) {
      return element;
    }

    const children = element.props.children;
    const translatedChildren = await translateReactNodeToBanglaServer(children);
    return cloneElement(element, { ...element.props, children: translatedChildren });
  }

  return node;
}
