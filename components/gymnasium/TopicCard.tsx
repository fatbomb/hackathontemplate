// components/TopicCard.jsx
'use client';

import { motion } from 'framer-motion';
import GamePointsBadge from './GamePointsBadge';
import GenerateExamButton from './GenerateExamButton';

interface Topic {
  title: string;
  description?: string;
  subject: string;
  id: string;
}

interface TopicCardProps {
  subject: string;
  topic: Topic;
  gamePoints?: { points: number; level: number };
  userId: string;
}

export default function TopicCard({ subject, topic, gamePoints }: TopicCardProps) {
  const points = gamePoints?.points || 0;
  const level = gamePoints?.level || 1;

  return (
    <motion.div
      className="bg-white dark:bg-gray-900 shadow-sm p-4 border border-gray-100 dark:border-gray-800 rounded-lg"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">{topic.title}</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">{topic.description || 'Practice this topic to earn points'}</p>
        </div>
        <GamePointsBadge points={points} level={level} />
      </div>

      <div className="mt-4">
        <GenerateExamButton subjectId={subject} topicId={topic.title} level={level} />
      </div>
    </motion.div>
  );
}