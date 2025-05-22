import { cookies } from 'next/headers';
import { getPocketBase } from '@/lib/pocketbase';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = await cookies();
    const pb = await getPocketBase(cookieStore.toString());
    const isAuthed = pb.authStore.isValid;
    return NextResponse.json({
        isAuthed,
        user: isAuthed ? pb.authStore.record?.id : null
    });
}