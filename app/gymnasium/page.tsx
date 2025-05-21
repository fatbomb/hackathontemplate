// app/gymnasium/page.jsx
import { getPocketBase } from '@/lib/pocketbase';
import SubjectCard from '@/components/gymnasium/SubjectCard';
import { redirect, useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function fetchSubjects() {
  const pb = await getPocketBase();
  const subjects = await pb.collection('subjects').getFullList({
    sort: '-created',
    fields: 'id,title', // Ensure 'title' is included
  });
  return subjects.map(subject => ({
    id: subject.id,
    title: subject.title,
  }));
}

async function fetchTopics() {
  const pb = await getPocketBase();
  const topics = await pb.collection('topics').getFullList({
    sort: '-created',
  });
  return topics.map(topic => ({
    id: topic.id,
    title: topic.title,
    subject: topic.subject,
  }));
}

async function fetchGamePoints(userId:string) {
  const pb = await getPocketBase();
  const gamePoints = await pb.collection('game_points').getFullList({
    filter: `user="${userId}" && type="gymnasium"`,
  });
  return gamePoints.map(gamePoint => ({
    id: gamePoint.id,
    topic: gamePoint.topic,
    points: gamePoint.points,
    level: gamePoint.level,
  }));
}

export default async function GymnasiumPage() {
  // In a real app, you would get the userId from auth
  const pb = await getPocketBase();
  const userId = pb.authStore.model?.id || 'defaultUser';
    if (!userId) {
        redirect('/auth/login'); // This is the Next.js 13+ server-side redirect
    } 
  
  const subjects = await fetchSubjects();
  const topics = await fetchTopics();
  const gamePoints = await fetchGamePoints(userId);
  
  // Group topics by subject
  const topicsBySubject: Record<string, typeof topics> = {};
  subjects.forEach(subject => {
    topicsBySubject[subject.id] = topics.filter(topic => topic.subject === subject.id);
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto px-4 py-12 max-w-6xl">
        <header className="mb-12 text-center">
          <h1 className="mb-3 font-bold text-gray-900 text-3xl md:text-4xl">
            Learning Gymnasium
          </h1>
          <p className="mx-auto max-w-2xl text-gray-600">
            Explore subjects, master topics, and earn points by taking exams to level up your knowledge.
          </p>
        </header>
        
        <div className="gap-6 grid md:grid-cols-2 lg:grid-cols-3">
          {subjects.map(subject => (
            <SubjectCard 
              key={subject.id}
              subject={subject}
              topics={topicsBySubject[subject.id] || []}
              gamePoints={gamePoints}
              userId={userId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}