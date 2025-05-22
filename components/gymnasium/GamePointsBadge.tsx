// components/GamePointsBadge.jsx
'use client';

interface GamePointsBadgeProps {
  points: number;
  level: number;
}

export default function GamePointsBadge({ points, level }: GamePointsBadgeProps) {
  return (
    <div className="flex flex-col items-end space-y-1.5">
      <div className="flex items-center bg-indigo-50 px-2.5 py-1 rounded-full font-medium text-indigo-700 text-xs">
        <svg className="mr-1 w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13.5 3.25a.75.75 0 0 1 .75.75V4h.75a.75.75 0 0 1 0 1.5H14v.75a.75.75 0 0 1-1.5 0V5.5h-.75a.75.75 0 0 1 0-1.5h.75v-.75a.75.75 0 0 1 .75-.75ZM5.75 2.5a.75.75 0 0 1 .75.75v1h1a.75.75 0 0 1 0 1.5h-1v1a.75.75 0 0 1-1.5 0v-1h-1a.75.75 0 0 1 0-1.5h1v-1a.75.75 0 0 1 .75-.75Zm7 7a.75.75 0 0 1 .75.75v1h1a.75.75 0 0 1 0 1.5h-1v1a.75.75 0 0 1-1.5 0v-1h-1a.75.75 0 0 1 0-1.5h1v-1a.75.75 0 0 1 .75-.75ZM9 4a5 5 0 1 0 0 10A5 5 0 0 0 9 4Zm-6.5 5a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Z" />
        </svg>
        Level {level}
      </div>
      <div className="flex items-center bg-amber-50 px-2.5 py-1 rounded-full font-medium text-amber-700 text-xs">
        <svg className="mr-1 w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
        {points} Points
      </div>
    </div>
  );
}