// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import {
    GoogleGenAI,
} from '@google/genai';
import mime from 'mime';
import { writeFile } from 'fs';

export function saveBinaryFile(fileName: string, content: Buffer) {
    writeFile(fileName, content, 'utf8', (err) => {
        if (err) {
            console.error(`Error writing file ${fileName}:`, err);
            return;
        }
        console.log(`File ${fileName} saved to file system.`);
    });
}

export async function GoogleTTS(text: string) {
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });
    const config = {
        temperature: 1,
        responseModalities: [
            'audio',
        ],
        speechConfig: {
            voiceConfig: {
                prebuiltVoiceConfig: {
                    voiceName: 'Zephyr',
                }
            }
        },
    };
    const model = 'gemini-2.5-flash-preview-tts';
    const contents = [
        {
            role: 'user',
            parts: [
                {
                    text: text,
                },
            ],
        },
    ];

    const response = await ai.models.generateContentStream({
        model,
        config,
        contents,
    });

    let audioBuffer: Buffer | null = null;
    let mimeType: string | null = null;
    let fileExtension: string | null = null;

    for await (const chunk of response) {
        if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
            continue;
        }
        if (chunk.candidates[0].content.parts[0].inlineData) {
            const inlineData = chunk.candidates[0].content.parts[0].inlineData;
            mimeType = inlineData.mimeType || '';
            fileExtension = mime.getExtension(mimeType) || 'wav';
            let buffer = Buffer.from(inlineData.data || '', 'base64');
            if (!mime.getExtension(mimeType)) {
                buffer = convertToWav(inlineData.data || '', mimeType);
            }
            audioBuffer = buffer;
            break;
        }
    }

    if (!audioBuffer || !mimeType) {
        throw new Error('No audio data received from Google TTS');
    }

    return {
        buffer: audioBuffer,
        mimeType,
        fileExtension,
    };
}

interface WavConversionOptions {
    numChannels: number,
    sampleRate: number,
    bitsPerSample: number
}

function convertToWav(rawData: string, mimeType: string) {
    const options = parseMimeType(mimeType)
    const wavHeader = createWavHeader(rawData.length, options);
    const buffer = Buffer.from(rawData, 'base64');

    return Buffer.concat([wavHeader, buffer]);
}

function parseMimeType(mimeType: string) {
    const [fileType, ...params] = mimeType.split(';').map(s => s.trim());
    const [_, format] = fileType.split('/');

    const options: Partial<WavConversionOptions> = {
        numChannels: 1,
    };

    if (format && format.startsWith('L')) {
        const bits = parseInt(format.slice(1), 10);
        if (!isNaN(bits)) {
            options.bitsPerSample = bits;
        }
    }

    for (const param of params) {
        const [key, value] = param.split('=').map(s => s.trim());
        if (key === 'rate') {
            options.sampleRate = parseInt(value, 10);
        }
    }

    return options as WavConversionOptions;
}

function createWavHeader(dataLength: number, options: WavConversionOptions) {
    const {
        numChannels,
        sampleRate,
        bitsPerSample,
    } = options;

    // http://soundfile.sapp.org/doc/WaveFormat

    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const buffer = Buffer.alloc(44);

    buffer.write('RIFF', 0);                      // ChunkID
    buffer.writeUInt32LE(36 + dataLength, 4);     // ChunkSize
    buffer.write('WAVE', 8);                      // Format
    buffer.write('fmt ', 12);                     // Subchunk1ID
    buffer.writeUInt32LE(16, 16);                 // Subchunk1Size (PCM)
    buffer.writeUInt16LE(1, 20);                  // AudioFormat (1 = PCM)
    buffer.writeUInt16LE(numChannels, 22);        // NumChannels
    buffer.writeUInt32LE(sampleRate, 24);         // SampleRate
    buffer.writeUInt32LE(byteRate, 28);           // ByteRate
    buffer.writeUInt16LE(blockAlign, 32);         // BlockAlign
    buffer.writeUInt16LE(bitsPerSample, 34);      // BitsPerSample
    buffer.write('data', 36);                     // Subchunk2ID
    buffer.writeUInt32LE(dataLength, 40);         // Subchunk2Size

    return buffer;
}
