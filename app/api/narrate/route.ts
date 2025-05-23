import { getGoogleServiceAccount } from '@/utils/googleServiceAPI';
import textToSpeech from '@google-cloud/text-to-speech';
import { NextResponse } from 'next/server';

const client = new textToSpeech.TextToSpeechClient({
    credentials: getGoogleServiceAccount(),
    projectId: process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID || '',
});

export async function POST(request: Request){
    try{
        const { text, language } = await request.json();

        const [ response ] = await client.synthesizeSpeech({
            input: { text },
            voice: { 
                languageCode: language,
                ssmlGender: 'FEMALE'
            },
            audioConfig: { audioEncoding: 'MP3' },
        });

        const audioContent = response.audioContent;

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