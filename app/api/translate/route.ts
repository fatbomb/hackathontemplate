import { NextRequest, NextResponse } from 'next/server';
import { v2 as Translate } from '@google-cloud/translate';
import { getGoogleServiceAPIKey } from '@/utils/googleServiceAPI';

const translate = new Translate.Translate({
  key: getGoogleServiceAPIKey(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, to } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const [translated] = await translate.translate(text, to || 'bn');
    return NextResponse.json({ translated });
  } catch (err) {
    console.error('Translation failed:', err);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}