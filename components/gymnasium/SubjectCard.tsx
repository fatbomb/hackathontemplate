// components/SubjectCard.jsx
'use client';

import { useState } from 'react';
import TopicCard from './TopicCard';
import { motion, AnimatePresence } from 'framer-motion';
import { title } from 'process';

interface Subject {
  title: string;
  id: string;
}

interface Topic {
  id: string;
    title: string;
    subject: string;
}

interface GamePoint {
  topic: string;
  points: number;
  level: number;
}

interface SubjectCardProps {
  subject: Subject;
  topics: Topic[];
  gamePoints: GamePoint[];
  userId: string;
}

export default function SubjectCard({ subject, topics, gamePoints, userId }: SubjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Calculate total points for this subject
  const totalPoints = topics.reduce((sum, topic) => {
    const pointsRecord = gamePoints.find(p => p.topic === topic.id);
    return sum + (pointsRecord?.points || 0);
  }, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden"
      whileHover={{ 
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
        translateY: -5
      }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className="p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-gray-800 text-xl">{subject.title}</h2>
            <p className="mt-1 text-gray-500 text-sm">
              {topics.length} {topics.length === 1 ? 'topic' : 'topics'} available
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-amber-50 px-3 py-1.5 rounded-full font-medium text-amber-700 text-sm">
              <svg className="mr-1.5 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {totalPoints} Points
            </div>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-gray-100 border-t overflow-hidden"
          >
            <div className="space-y-4 bg-gray-50 p-5">
              {topics.length > 0 ? 
                topics.map((topic, index) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                  >
                    <TopicCard
                        subject={subject.title}
                      topic={topic}
                      gamePoints={gamePoints.find(p => p.topic === topic.id)}
                      userId={userId}
                    />
                  </motion.div>
                )) : 
                <p className="py-4 text-gray-500 text-center">No topics available</p>
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}