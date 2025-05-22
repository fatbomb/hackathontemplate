//api/tts/route.ts
import { NextResponse } from 'next/server';
import textToSpeech from '@google-cloud/text-to-speech';

// Google Cloud TTS client
const client = new textToSpeech.TextToSpeechClient();

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json(
        { message: 'Missing text parameter' },
        { status: 400 }
      );
    }

    // Call Google Cloud Text-to-Speech API
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: { 
        languageCode: 'bn-IN', // Bengali language code
        ssmlGender: 'NEUTRAL'
      },
      audioConfig: { 
        audioEncoding: 'MP3',
        speakingRate: 0.9, // Slightly slower for better clarity
        pitch: 0 // Default pitch
      },
    });

    // Convert Buffer to ArrayBuffer
    const audioContent = response.audioContent;
    
    // Check if we have audio content
    if (!audioContent) {
      throw new Error('No audio content received from Text-to-Speech API');
    }

    // Return audio as response
    return new NextResponse(audioContent, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioContent.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error in TTS API:', error);
    return NextResponse.json(
      { message: 'Text-to-Speech failed', error: (error as Error).message },
      { status: 500 }
    );
  }
}