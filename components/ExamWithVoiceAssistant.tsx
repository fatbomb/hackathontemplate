import { useState, useEffect, useRef, FC } from 'react';
import { Volume2, VolumeOff, Mic, MicOff } from 'lucide-react';
import languageDetect from 'languagedetect';
import { ExamResult, ClientQuestion } from '@/types';

interface Exam {
  id: string;
  exam_name: string;
  difficulty: string;
  time_limit: number;
  questions: ClientQuestion[];
}

interface ExamWithVoiceAssistantProps {
  exam: Exam;
  selectedAnswers: Map<string, number>;
  setSelectedAnswers: React.Dispatch<React.SetStateAction<Map<string, number>>>;
  examSubmitted: boolean;
  examResult: ExamResult | null;
  handleSubmitExam: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
    bengaliTTSAudios?: HTMLAudioElement[];
  }
}

const ExamWithVoiceAssistant: FC<ExamWithVoiceAssistantProps> = ({
  exam,
  selectedAnswers,
  setSelectedAnswers,
  examSubmitted,
  examResult,
  handleSubmitExam
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(exam.time_limit * 60);
  const [narrationEnabled, setNarrationEnabled] = useState<boolean>(false);
  const [voiceControlEnabled, setVoiceControlEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);

  const currentQuestion = exam.questions[currentQuestionIndex];
  const detector = new languageDetect();

  // Timer functionality
  useEffect(() => {
    if (timeLeft <= 0 || examSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, examSubmitted]);

  // Auto-submit when time expires
  useEffect(() => {
    if (timeLeft <= 0 && !examSubmitted) {
      handleSubmitExam();
    }
  }, [timeLeft, examSubmitted, handleSubmitExam]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, optionIndex: number): void => {
    setSelectedAnswers((prev) => {
      const newAnswers = new Map(prev);
      newAnswers.set(questionId, optionIndex);
      return newAnswers;
    });

    // Narrate selection if enabled
    if (narrationEnabled) {
      const option = currentQuestion.options[optionIndex];
      speakText(`Selected option ${String.fromCharCode(65 + optionIndex)}: ${option}`);
    }
  };

  // Detect language of text
  const detectLanguage = (text: string): string => {
    const detections = detector.detect(text, 1);
    if (detections.length > 0) {
      const detectedLang = detections[0][0].toLowerCase();
      if (detectedLang === 'english') {
        return 'en-US';
      } else {
        return 'bn-BD';
      }
    }
    return 'en-US'; // Default
  };

  // Text to speech functionality
  const speakText = async (text: string): Promise<void> => {
    if (!text || currentlyPlaying) return;

    try {
      setIsLoading(true);
      setCurrentlyPlaying(true);

      const language = detectLanguage(text);

      const response = await fetch('/api/narrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, language }),
      });

      if (!response.ok) {
        throw new Error('Text-to-speech failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      } else {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.play();

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setCurrentlyPlaying(false);
        };
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setCurrentlyPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Narrate current question
  const narrateCurrentQuestion = (): void => {
    if (!narrationEnabled) return;

    const questionText = ` ${currentQuestion.question_statement}`;
    const optionsText = currentQuestion.options.map((option, index) =>
      `Option ${String.fromCharCode(65 + index)}: ${option}`
    ).join('. ');
    const explainationText = examResult?.questions.find(q => q.id === currentQuestion.id)?.explanation || '';
    speakText(`${questionText}. ${optionsText} `);
    speakText(explainationText);
  };

  // Effect to narrate questions when they change or when narration is enabled
  useEffect(() => {
    if (narrationEnabled) {
      narrateCurrentQuestion();
    }
  }, [currentQuestionIndex, narrationEnabled]);

  // Voice recognition setup
  useEffect(() => {
    // Only set up voice recognition if it's enabled and supported
    if (!voiceControlEnabled) return;

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.trim().toLowerCase();

        switch (true) {
          case /next|next question/.test(command):
            if (currentQuestionIndex < exam.questions.length - 1) {
              setCurrentQuestionIndex((prev) => prev + 1);
            } else {
              speakText("This is the last question. Say 'submit' to submit your exam.");
            }
            break;

          case /previous|back/.test(command):
            if (currentQuestionIndex > 0) {
              setCurrentQuestionIndex((prev) => prev - 1);
            } else {
              speakText("This is the first question.");
            }
            break;

          case /select|choose/.test(command): {
            const optionMatches = command.match(/option [a-d]|[a-d]/i);
            if (optionMatches) {
              const option = optionMatches[0].replace(/option /i, '').toLowerCase();
              const optionIndex = option.charCodeAt(0) - 97;

              if (optionIndex >= 0 && optionIndex < currentQuestion.options.length) {
                handleAnswerSelect(currentQuestion.id, optionIndex);
                speakText(`Selected option ${option.toUpperCase()}`);
              }
            }
            break;
          }

          case /read|repeat/.test(command):
            narrateCurrentQuestion();
            break;

          case /submit/.test(command):
            if (currentQuestionIndex === exam.questions.length - 1) {
              handleSubmitExam();
              speakText("Exam submitted!");
            } else {
              speakText("Please go to the last question to submit the exam.");
            }
            break;

          case /go to question/.test(command): {
            const matches = command.match(/\d+/);
            if (matches) {
              const questionNum = parseInt(matches[0], 10);
              if (questionNum > 0 && questionNum <= exam.questions.length) {
                setCurrentQuestionIndex(questionNum - 1);
                speakText(`Going to question ${questionNum}`);
              } else {
                speakText(`Please specify a valid question number between 1 and ${exam.questions.length}`);
              }
            }
            break;
          }

          default:
            speakText("Command not recognized. Please try again.");
        }
      };

      recognition.onend = () => {
        // Restart recognition if voice control is still enabled
        if (voiceControlEnabled) {
          recognition.start();
        }
      };

      recognition.start();
      speechRecognitionRef.current = recognition;

      // Announce that voice control is active
      speakText("Voice control activated. You can say commands like 'next', 'previous', 'select A', 'read question', or 'submit'.");

      return () => {
        recognition.stop();
      };
    } else {
      alert("Your browser doesn't support speech recognition. Voice controls are disabled.");
      setVoiceControlEnabled(false);
    }
  }, [voiceControlEnabled]);

  // Clean up audio resources
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, []);

  // Toggle narration
  const toggleNarration = (): void => {
    setNarrationEnabled(prev => !prev);
    if (!narrationEnabled) {
      speakText("Narration enabled. The current question will be read aloud.");
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        setCurrentlyPlaying(false);
      }
      speakText("Narration disabled.");
    }
  };

  // Toggle voice control
  const toggleVoiceControl = (): void => {
    setVoiceControlEnabled(prev => !prev);
    // The voice control will be initialized/stopped by the effect
  };

  return (
    <div className="bg-background shadow-md mx-auto p-2 lg:w-[50dvw] lg:p-6 rounded-lg border border-border">

{examSubmitted && examResult && (
        <div className="bg-muted/80 my-8 p-6 rounded-md text-center border border-border">
          <h2 className="mb-4 font-bold text-2xl text-foreground">Exam Results</h2>
          <p className="text-xl text-foreground">Your score: <span className="font-bold">{examResult.score.toFixed(1)}%</span></p>
          <p className="mt-2 text-muted-foreground">
            {examResult.score >= 70 ? 'Great job! 🎉' : 'Keep practicing, you can do better! 💪'}
          </p>
          <button
            onClick={() => window.location.href = '/exams'}
            className="bg-primary hover:bg-primary/90 mt-4 px-4 py-2 rounded-md font-bold text-primary-foreground border border-primary transition-colors"
            aria-label="Back to exams"
          >
            Back to Exams
          </button>
        </div>
      )}

      <div className="flex w-full max-lg:flex-col gap-2 lg:justify-between items-center mb-6">
        <h1 className="font-bold text-2xl text-foreground">{exam.exam_name}</h1>
        <div className="flex flex-col gap-2 max-lg:flex-row-reverse max-lg:justify-between items-end w-full">
          <div className="text-md">
            Time left: <span className={timeLeft < 60 ? 'text-destructive' : 'text-primary'}>{formatTime(timeLeft)}</span>
          </div>
          {/* Accessibility Controls */}
          <div className="flex gap-2">
            <button
              onClick={toggleNarration}
              className={`p-1 rounded-full transition-colors border border-border ${narrationEnabled ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}
              aria-label={narrationEnabled ? "Disable narration" : "Enable narration"}
              title={narrationEnabled ? "Disable narration" : "Enable narration"}
            >
              {narrationEnabled ? <Volume2 className='w-4 h-4' /> : <VolumeOff className='w-4 h-4' />}
            </button>
            <button
              onClick={toggleVoiceControl}
              className={`p-1 rounded-full transition-colors border border-border ${voiceControlEnabled ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}
              aria-label={voiceControlEnabled ? "Disable voice control" : "Enable voice control"}
              title={voiceControlEnabled ? "Disable voice control" : "Enable voice control"}
            >
              {voiceControlEnabled ? <Mic className='w-4 h-4' /> : <MicOff className='w-4 h-4' />}
            </button>
          </div>
        </div>
      </div>

      <div className="">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-sm text-foreground">Question {currentQuestionIndex + 1} of {exam.questions.length}</h2>
          <div className="text-foreground text-sm">Difficulty: <span className="font-medium">{exam.difficulty}</span></div>
        </div>

        <div className="p-4 border rounded-md bg-accent">
          <p className="mb-4 text-lg text-foreground">{currentQuestion.question_statement}</p>

          <div className="space-y-3">
            {currentQuestion.options.map((option, optionIndex) => {
              const isSelected = selectedAnswers.get(currentQuestion.id) === optionIndex;
              let resultClass = '';

              if (examSubmitted && examResult) {
                const resultQuestion = examResult.questions.find(q => q.id === currentQuestion.id);
                if (resultQuestion) {
                  if (optionIndex === Number(resultQuestion.correctAnswer)) {
                    resultClass = 'border-success bg-success/20 text-success-foreground';
                  } else if (isSelected && optionIndex !== Number(resultQuestion.correctAnswer)) {
                    resultClass = 'border-destructive bg-destructive/20 text-destructive-foreground';
                  }
                }
              }

              return (
                <div
                  key={optionIndex}
                  onClick={() => handleAnswerSelect(currentQuestion.id, optionIndex)}
                  className={`p-3 border-2 border-muted-foreground rounded-md cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground
            ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'text-foreground'}
            ${resultClass}`}
                  role="button"
                  aria-pressed={isSelected}
                  tabIndex={0}
                  onKeyPress={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleAnswerSelect(currentQuestion.id, optionIndex);
                    }
                  }}
                >
                  <span className="font-medium">{String.fromCharCode(65 + optionIndex)}. </span>
                  {option}
                </div>
              );
            })}
          </div>

          {examSubmitted && examResult && (
            <div className="bg-muted/80 mt-6 p-4 rounded-md border border-border">
              <h3 className="mb-2 font-semibold text-foreground">Explanation:</h3>
              <p className="text-muted-foreground">{examResult.questions.find(q => q.id === currentQuestion.id)?.explanation}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between lg:m-4 m-2">
        <button
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
          className="bg-muted hover:bg-accent/60 disabled:opacity-50 px-4 py-2 rounded-md font-bold text-foreground border border-border transition-colors"
          aria-label="Previous question"
        >
          Previous
        </button>

        {currentQuestionIndex < exam.questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.min(exam.questions.length - 1, prev + 1))}
            className="bg-muted hover:bg-accent/60 px-4 py-2 rounded-md font-bold text-foreground border border-border transition-colors"
            aria-label="Next question"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => handleSubmitExam()}
            disabled={examSubmitted}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 px-4 py-2 rounded-md font-bold text-primary-foreground border border-primary transition-colors"
            aria-label="Submit exam"
          >
            {examSubmitted ? 'Exam Submitted' : 'Submit Exam'}
          </button>
        )}
      </div>

      {!examSubmitted && (
        <div className="mt-6">
          <div className="flex flex-wrap gap-2">
            {exam.questions.map((question, index) => {
              const isAnswered = selectedAnswers.has(question.id);

              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`h-8 w-8 flex items-center justify-center rounded-full border border-border transition-colors
            ${currentQuestionIndex === index ? 'border-primary bg-primary text-primary-foreground' : ''} 
            ${isAnswered ? 'bg-muted text-foreground' : 'bg-background text-muted-foreground'}`}
                  aria-label={`Go to question ${index + 1}`}
                  aria-current={currentQuestionIndex === index ? 'page' : undefined}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Instructions for voice control */}
      {voiceControlEnabled && (
        <div className="bg-primary/10 mt-6 p-4 rounded-md border border-primary/30 text-foreground">
          <h3 className="mb-2 font-semibold">Voice Commands Available:</h3>
          <ul className="space-y-1 pl-5 list-disc">
            <li>&quot;Next&quot; or &quot;Next question&quot; - Move to next question</li>
            <li>&quot;Previous&quot; or &quot;Back&quot; - Move to previous question</li>
            <li>&quot;Select A/B/C/D&quot; - Choose an answer option</li>
            <li>&quot;Read question&quot; or &quot;Repeat&quot; - Read the current question</li>
            <li>&quot;Go to question [number]&quot; - Navigate to specific question</li>
            <li>&quot;Submit&quot; - Submit your exam (on last question)</li>
          </ul>
        </div>
      )}

      {/* Loading indicator for narration */}
      {isLoading && (
        <div className="right-4 bottom-4 fixed bg-primary shadow-lg px-4 py-2 rounded-md text-primary-foreground border border-primary">
          Loading audio...
        </div>
      )}
    </div>
  );
};

export default ExamWithVoiceAssistant;