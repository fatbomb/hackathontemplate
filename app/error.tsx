'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="p-8 max-w-md text-center">
        <h2 className="mb-4 font-bold text-2xl">Something went wrong!</h2>
        <p className="mb-6">{error.message || 'An unexpected error occurred'}</p>
        <button
          onClick={() => reset()}
          className="bg-blue-600 hover:bg-blue-700 mr-2 px-4 py-2 rounded-md font-bold text-white"
        >
          Try again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md font-bold text-gray-800"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}