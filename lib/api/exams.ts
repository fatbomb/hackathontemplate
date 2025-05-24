import { getPocketBase } from '@/lib/pocketbase';
import { cookies } from 'next/headers';

export async function fetchExamsData() {
  try {
    const cookieStore = await cookies();
    const pb = await getPocketBase(cookieStore.toString());

    if (!pb.authStore.isValid) {
      try {
        await pb.collection('users').authRefresh();
      } catch {
        return { error: 'Session expired' };
      }
    }

    const userId = pb.authStore.model?.id;
    if (!userId) {
      return { error: 'User not found' };
    }

    const [exams, userExams] = await Promise.all([
      pb.collection('exams').getFullList({
        filter: `user_id = "${userId}"`,
        sort: '-created'
      }),
      pb.collection('user_exams').getFullList({
        filter: `user_id = "${userId}"`,
        expand: 'exam_id'
      })
    ]);
    // console.log('Fetched exams:', exams);
    // console.log('Fetched user exams:', userExams);

    return {
      exams: exams.map(rec => ({
        id: rec.id,
        user_id: rec.user_id,
        exam_name: rec.exam_name,
        input_text: rec.input_text,
        difficulty: rec.difficulty,
        topic: rec.topic,
        type: rec.type,
        time_limit: rec.time_limit,
        created: rec.created,
      })),
      userExams: userExams.map(ue => ({
        id: ue.id,
        user_id: ue.user_id,
        exam_id: ue.exam_id,
        status: ue.status,
        score: ue.score,
        expand: ue.expand,
      })),
      error: null
    };
  } catch (error) {
    console.error('Error fetching exams:', error);
    return { 
      exams: [],
      userExams: [],
      error: 'Failed to load exams' 
    };
  }
}