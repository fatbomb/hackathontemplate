import { useState, useEffect } from 'react';
import { ExamService, QuestionService } from '@/services/api';
import { Exam, Question } from '@/types';

interface ExamViewProps {
  examId: string;
}

export default function ExamView({ examId }: ExamViewProps) {
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoading(true);
        const examData = await ExamService.getExam(examId);
        const questionData = await QuestionService.getQuestionsByExamId(examId);
        
        setExam(examData);
        setQuestions(questionData);
        setSelectedAnswers(new Array(questionData.length).fill(-1));
        setTimeLeft(examData.time_limit * 60); // Convert minutes to seconds
      } catch (err) {
        setError('Failed to load exam data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExamData();
  }, [examId]);

  // Timer effect
  useEffect(() => {
    if (!loading && exam && !examSubmitted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [loading, exam, examSubmitted, timeLeft]);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (examSubmitted) return;
    
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleSubmitExam = () => {
    if (examSubmitted) return;
    
    // Calculate score
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correctAnswers++;
      }
    });
    
    const finalScore = (correctAnswers / questions.length) * 100;
    setScore(finalScore);
    setExamSubmitted(true);
    
    // In a real app, you would save this to the backend
    // updateUserExam(userId, examId, finalScore);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (loading) return <div className="py-10 text-center">Loading exam...</div>;
  if (error) return <div className="py-10 text-red-500 text-center">{error}</div>;
  if (!exam || questions.length === 0) return <div className="py-10 text-center">No exam data found</div>;

  const currentQuestion = questions[currentQuestionIndex];

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
          <h2 className="font-semibold text-xl">Question {currentQuestionIndex + 1} of {questions.length}</h2>
          <div>Difficulty: <span className="font-medium">{exam.difficulty}</span></div>
        </div>
        
        <div className="p-4 border rounded-md">
          <p className="mb-4 text-lg">{currentQuestion.question_statement}</p>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, optionIndex) => (
              <div 
                key={optionIndex}
                onClick={() => handleAnswerSelect(currentQuestionIndex, optionIndex)}
                className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 
                  ${selectedAnswers[currentQuestionIndex] === optionIndex ? 'border-blue-500 bg-blue-50' : ''}
                  ${examSubmitted && optionIndex === currentQuestion.correct_answer ? 'border-green-500 bg-green-50' : ''}
                  ${examSubmitted && selectedAnswers[currentQuestionIndex] === optionIndex && 
                    optionIndex !== currentQuestion.correct_answer ? 'border-red-500 bg-red-50' : ''}`}
              >
                <span className="font-medium">{String.fromCharCode(65 + optionIndex)}. </span>
                {option}
              </div>
            ))}
          </div>
          
          {examSubmitted && (
            <div className="bg-gray-50 mt-6 p-4 rounded-md">
              <h3 className="mb-2 font-semibold">Explanation:</h3>
              <p>{currentQuestion.explanation}</p>
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
        
        {currentQuestionIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md font-bold text-gray-800"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmitExam}
            disabled={examSubmitted}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-md font-bold text-white"
          >
            {examSubmitted ? 'Exam Submitted' : 'Submit Exam'}
          </button>
        )}
      </div>
      
      {examSubmitted && (
        <div className="bg-gray-50 mt-8 p-6 rounded-md text-center">
          <h2 className="mb-4 font-bold text-2xl">Exam Results</h2>
          <p className="text-xl">Your score: <span className="font-bold">{score.toFixed(1)}%</span></p>
          <p className="mt-2">
            {score >= 70 ? 'Great job! 🎉' : 'Keep practicing, you can do better! 💪'}
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
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`h-8 w-8 flex items-center justify-center rounded-full border 
                  ${currentQuestionIndex === index ? 'border-blue-500 bg-blue-500 text-white' : ''} 
                  ${selectedAnswers[index] >= 0 ? 'bg-gray-200' : 'bg-white'}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}