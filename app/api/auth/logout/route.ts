import { cookies } from 'next/headers';
import { getPocketBase } from '@/lib/pocketbase';
import { NextResponse } from 'next/server';

export async function POST() {
    const cookieStore = await cookies();
    const pb = await getPocketBase(cookieStore.toString());
    pb.authStore.clear();
    cookieStore.delete('pb_auth');
    return NextResponse.json({ success: true });
}