import { cookies } from 'next/headers';
import { getPocketBase } from '@/lib/pocketbase';
import { Navbar } from './navbar';

export default async function NavbarWrapper() {
    const cookieStore = await cookies();
  const pb = await getPocketBase(cookieStore.toString());
  let isAuthed = false;
  let user = null;

  try {
    // Refresh auth if token exists
    if (pb.authStore.isValid) {
      await pb.collection('users').authRefresh();
      isAuthed = true;
      user = pb.authStore.model;
    }
  } catch (err) {
    pb.authStore.clear();
    isAuthed = false;
    user = null;
  }
  

  return <Navbar serverAuth={{ isAuthed, user }} />;
}