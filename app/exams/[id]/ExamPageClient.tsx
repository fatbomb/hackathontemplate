'use client';

import { useState } from 'react';
import ExamView from '@/components/ExamView';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';

interface ExamPageClientProps {
  initialUserExamId: string | null;
  initialError: string | null;
  examId: string;
}

export default function ExamPageClient({
  initialUserExamId,
  initialError,
  examId
}: ExamPageClientProps) {

  const [userExamId, setUserExamId] = useState(initialUserExamId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);
  // const [retryCount, setRetryCount] = useState(0);

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/exam/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ examId }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to initialize exam');
      }

      const { userExamId } = await response.json();
      setUserExamId(userExamId);
      
      // Update URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('userExamId', userExamId);
      window.history.replaceState({}, '', newUrl.toString());
    } catch (err) {
      console.error('Error initializing exam:', err);
      setError( 'Failed to initialize exam');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 min-h-[60vh]">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">Preparing your exam...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 p-4 min-h-[60vh]">
        <div className="space-y-2 text-center">
          <h3 className="font-medium text-destructive text-lg">Error loading exam</h3>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
        <Button onClick={handleRetry} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!userExamId) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 p-4 min-h-[60vh]">
        <div className="space-y-2 text-center">
          <h3 className="font-medium text-lg">Unable to start exam</h3>
          <p className="text-muted-foreground text-sm">
            Please check your connection and try again
          </p>
        </div>
        <Button onClick={handleRetry} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return(<div className='items-center p-4 min-h-screen'> <ExamView examId={examId} userExamId={userExamId} /></div>);
}