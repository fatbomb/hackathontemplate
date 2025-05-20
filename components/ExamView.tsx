import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ClientQuestion, ExamResult } from '@/types';

interface ExamViewProps {
  examId: string;
  userExamId: string;
}

export default function ExamView({ examId, userExamId }: ExamViewProps) {
  const [exam, setExam] = useState<{
    id: string;
    exam_name: string;
    difficulty: string;
    time_limit: number;
    questions: ClientQuestion[];
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<string, number>>(new Map());
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const examStartTime = useRef(Date.now());
  const timerId = useRef<NodeJS.Timeout | null>(null);
  const submissionInProgress = useRef(false);

  // Load exam data
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/exams/${examId}?userExamId=${userExamId}`, {
          headers: {
        'Authorization': `Bearer ${localStorage.getItem('pb_auth')}`
          }
        });
        const examData = response.data.exam;
        
        setExam(examData);
        setTimeLeft(examData.time_limit * 60); // Convert minutes to seconds
        examStartTime.current = Date.now();
      } catch (err) {
        setError('Failed to load exam data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExamData();
    
    // Cleanup function
    return () => {
      if (!examSubmitted && exam && !submissionInProgress.current) {
        handleSubmitExam(true); // Silent submission
      }
      
      if (timerId.current) {
        clearInterval(timerId.current);
      }
    };
  }, [examId, userExamId]);

  // Timer effect with anti-tamper measures
  useEffect(() => {
    if (!loading && exam && !examSubmitted && timeLeft > 0) {
      const serverTimeLimit = exam.time_limit * 60;
      const endTime = examStartTime.current + serverTimeLimit * 1000;
      
      timerId.current = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        
        if (remaining <= 0) {
          if (timerId.current) clearInterval(timerId.current);
          handleSubmitExam();
          return;
        }
        
        setTimeLeft(remaining);
      }, 1000);
      
      // Additional anti-tamper: listen for visibility changes
      document.addEventListener("visibilitychange", handleVisibilityChange);
      
      return () => {
        if (timerId.current) clearInterval(timerId.current);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }
  }, [loading, exam, examSubmitted]);

  // Handle tab visibility changes (detect tab switching)
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      console.log('Tab visibility changed - user may be switching tabs');
      // You could track suspicious behavior here
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    if (examSubmitted) return;
    
    const newSelectedAnswers = new Map(selectedAnswers);
    newSelectedAnswers.set(questionId, answerIndex);
    setSelectedAnswers(newSelectedAnswers);
  };

  // Submit exam
  const handleSubmitExam = async (silent = false) => {
    if (examSubmitted || !exam || submissionInProgress.current) return;
    
    submissionInProgress.current = true;
    try {
      if (!silent) setLoading(true);
      
      // Calculate time spent
      const timeSpent = exam.time_limit * 60 - timeLeft;
      
      // Convert map to array for submission
      const answersArray = Array.from(selectedAnswers).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer
      }));
      
      const response = await axios.post(`/api/exams/${examId}/submit`, {
        userExamId,
        answers: answersArray,
        timeSpent,
        clientTimeStamp: Date.now()
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('pb_auth')}`
        }
      });
      
      setExamResult(response.data);
      setExamSubmitted(true);
      
      if (timerId.current) {
        clearInterval(timerId.current);
      }
    } catch (err) {
      if (!silent) {
        setError('Failed to submit exam');
        console.error(err);
      }
    } finally {
      if (!silent) setLoading(false);
      submissionInProgress.current = false;
    }
  };

  // Format time (mm:ss)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (loading) return <div className="py-10 text-center">Loading exam...</div>;
  if (error) return <div className="py-10 text-red-500 text-center">{error}</div>;
  if (!exam) return <div className="py-10 text-center">No exam data found</div>;

  const currentQuestion = exam.questions[currentQuestionIndex];

  return (
    <div className="bg-white shadow-md mx-auto p-6 rounded-lg max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-bold text-2xl">{exam.exam_name}</h1>
        <div className="font-semibold text-lg">
          Time left: <span className={timeLeft < 60 ? 'text-red-500' : ''}>{formatTime(timeLeft)}</span>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <h2 className="font-semibold text-xl">Question {currentQuestionIndex + 1} of {exam.questions.length}</h2>
          <div>Difficulty: <span className="font-medium">{exam.difficulty}</span></div>
        </div>
        
        <div className="p-4 border rounded-md">
          <p className="mb-4 text-lg">{currentQuestion.question_statement}</p>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, optionIndex) => {
              const isSelected = selectedAnswers.get(currentQuestion.id) === optionIndex;
              let resultClass = '';
              
              if (examSubmitted && examResult) {
                const resultQuestion = examResult.questions.find(q => q.id === currentQuestion.id);
                if (resultQuestion) {
                  if (optionIndex === resultQuestion.correctAnswer) {
                    resultClass = 'border-green-500 bg-green-50';
                  } else if (isSelected && optionIndex !== resultQuestion.correctAnswer) {
                    resultClass = 'border-red-500 bg-red-50';
                  }
                }
              }
              
              return (
                <div 
                  key={optionIndex}
                  onClick={() => handleAnswerSelect(currentQuestion.id, optionIndex)}
                  className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 
                    ${isSelected ? 'border-blue-500 bg-blue-50' : ''}
                    ${resultClass}`}
                >
                  <span className="font-medium">{String.fromCharCode(65 + optionIndex)}. </span>
                  {option}
                </div>
              );
            })}
          </div>
          
          {examSubmitted && examResult && (
            <div className="bg-gray-50 mt-6 p-4 rounded-md">
              <h3 className="mb-2 font-semibold">Explanation:</h3>
              <p>{examResult.questions.find(q => q.id === currentQuestion.id)?.explanation}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
          className="bg-gray-200 hover:bg-gray-300 disabled:opacity-50 px-4 py-2 rounded-md font-bold text-gray-800"
        >
          Previous
        </button>
        
        {currentQuestionIndex < exam.questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.min(exam.questions.length - 1, prev + 1))}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md font-bold text-gray-800"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => handleSubmitExam()}
            disabled={examSubmitted}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-md font-bold text-white"
          >
            {examSubmitted ? 'Exam Submitted' : 'Submit Exam'}
          </button>
        )}
      </div>
      
      {examSubmitted && examResult && (
        <div className="bg-gray-50 mt-8 p-6 rounded-md text-center">
          <h2 className="mb-4 font-bold text-2xl">Exam Results</h2>
          <p className="text-xl">Your score: <span className="font-bold">{examResult.score.toFixed(1)}%</span></p>
          <p className="mt-2">
            {examResult.score >= 70 ? 'Great job! 🎉' : 'Keep practicing, you can do better! 💪'}
          </p>
          <button
            onClick={() => window.location.href = '/exams'}
            className="bg-blue-600 hover:bg-blue-700 mt-4 px-4 py-2 rounded-md font-bold text-white"
          >
            Back to Exams
          </button>
        </div>
      )}
      
      {!examSubmitted && (
        <div className="mt-6">
          <div className="flex flex-wrap gap-2">
            {exam.questions.map((question, index) => {
              const isAnswered = selectedAnswers.has(question.id);
              
              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`h-8 w-8 flex items-center justify-center rounded-full border 
                    ${currentQuestionIndex === index ? 'border-blue-500 bg-blue-500 text-white' : ''} 
                    ${isAnswered ? 'bg-gray-200' : 'bg-white'}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}