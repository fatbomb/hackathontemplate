// app/actions/logout.ts
'use server';

import { getPocketBase } from '@/lib/pocketbase'
import { cookies } from 'next/headers';

export async function logout() {
  const pb = await getPocketBase();

  pb.authStore.clear();
  // Clear cookie manually if you set it yourself
  (await cookies()).delete('pb_auth');
}
