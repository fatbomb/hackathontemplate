// app/gymnasium/page.jsx
import { getPocketBase } from '@/lib/pocketbase';
import SubjectCard from '@/components/gymnasium/SubjectCard';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import RequestSubjectModal from '@/components/gymnasium/RequestSubjectModal';

export const dynamic = 'force-dynamic';

async function fetchSubjects() {
  const pb = await getPocketBase();
  const subjects = await pb.collection('subjects').getFullList({
    sort: '-created',
    fields: 'id,title',
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

interface GamePoint {
    id: string;
    topic: string;
    points: number;
    level: number;
}

async function fetchGamePoints(userId: string): Promise<GamePoint[]> {
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
  const pb = await getPocketBase();
  const userId = pb.authStore.model?.id || 'defaultUser';
  
  if (!userId || userId === 'defaultUser') {
    redirect('/auth/login');
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
    <div className="min-h-screen">
      <div className="mx-auto px-4 py-12 max-w-7xl">
        <div className="flex md:flex-row flex-col md:justify-between md:items-center mb-10">
          <header className="mb-6 md:mb-0">
            <h1 className="font-bold text-3xl md:text-4xl">
              Learning Gymnasium
            </h1>
            <p className="mt-2 max-w-2xl">
              Explore subjects, master topics, and earn points by taking exams to level up your knowledge.
            </p>
          </header>

          <div className="flex space-x-4">
            <Link 
              href="/exams" 
              className="flex justify-center items-center shadow-md hover:shadow-lg rounded-lg text-md whitespace-nowrap transition-all duration-200 ease-in-out"
            >
              
              <button
                      type="submit"
                      className="flex flex-row bg-primary hover:bg-primary/90 disabled:opacity-70 px-4 py-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary font-medium text-primary-foreground text-sm transition-colors disabled:pointer-events-none"
                    ><svg className="mr-2 w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
                      My Exmas</button>
            </Link>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mb-10">
          <div className="shadow-sm p-6 border rounded-xl">
            <span className="font-medium">Subjects</span>
            <h3 className="mt-1 font-bold text-2xl">{subjects.length}</h3>
          </div>
          <div className="shadow-sm p-6 border rounded-xl">
            <span className="font-medium">Total Topics</span>
            <h3 className="mt-1 font-bold text-2xl">{topics.length}</h3>
          </div>
          <div className="shadow-sm p-6 border rounded-xl">
            <span className="font-medium">Points Earned</span>
            <h3 className="mt-1 font-bold text-2xl">
              {gamePoints.reduce((sum, point) => sum + (point.points || 0), 0)}
            </h3>
          </div>
          <div className="shadow-sm p-6 border rounded-xl">
            <span className="font-medium">Average Level</span>
            <h3 className="mt-1 font-bold text-2xl">
              {gamePoints.length > 0 
                ? Math.round(gamePoints.reduce((sum, point) => sum + (point.level || 0), 0) / gamePoints.length) 
                : 0}
            </h3>
          </div>
        </div>
        
        <h2 className="mb-6 font-semibold text-2xl">Available Subjects</h2>
        
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
          {subjects.map(subject => (
            <SubjectCard 
              key={subject.id}
              subject={subject}
              topics={topicsBySubject[subject.id] || []}
              gamePoints={gamePoints}
              userId={userId}
            />
          ))}
          
          <RequestSubjectModal userId={userId} />
        </div>
      </div>
    </div>
  );
}