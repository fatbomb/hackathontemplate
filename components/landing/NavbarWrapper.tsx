import { cookies } from 'next/headers';
import { getPocketBase,getCurrentUser } from '@/lib/pocketbase';
import { Navbar } from './navbar';
import { User } from '@/types';

export default async function NavbarWrapper() {
    const cookieStore = await cookies();
  const pb = await getPocketBase(cookieStore.toString());
  let isAuthed = false;
  let user: User | null = null;

  try {
    // Refresh auth if token exists
    if (pb.authStore.isValid) {
      await pb.collection('users').authRefresh();
      isAuthed = true;
      const recordModel = await getCurrentUser();
      console.log('recordModel', recordModel);
      user = recordModel
        ? {id:recordModel.id, email: recordModel.email, name: recordModel.name } as User
        : null;
    }
  } catch (err) {
    pb.authStore.clear();
    isAuthed = false;
    user = null;
  }
  

  return <Navbar serverAuth={{ isAuthed, user }} />;
}