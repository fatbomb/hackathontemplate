import { GoogleTTS } from '@/utils/googleTTS';
import { NextResponse } from 'next/server';

export async function POST(request: Request){
    try{
        const { text } = await request.json();

        // const client = new textToSpeech.TextToSpeechClient({
        //     credentials: getGoogleServiceAccount(),
        //     projectId: process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID
        // });

        const response = await GoogleTTS(text)

        const audioContent = response.buffer;

        if(!audioContent){
            return NextResponse.json({error: 'No audio content'}, { status: 400 });
        }

        return new NextResponse(Buffer.from(audioContent as Buffer), {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Disposition': 'inline; filename="speech.mp3"',
            },
        });

    }catch(e){
        console.error(e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}