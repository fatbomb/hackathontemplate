import { NextResponse } from 'next/server';
import { askGemini } from '@/lib/gemini';  // <-- make sure askBanglaBot is exported from here

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question = body.question?.trim();

    if (!question) {
      return NextResponse.json(
        { error: 'কোনো প্রশ্ন দেওয়া হয়নি।' },
        { status: 400 }
      );
    }

    const answer = await askGemini(question);

    return NextResponse.json({ answer });
  } catch (error: unknown) {
    console.error('Error in /api/chat:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'কিছু সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
