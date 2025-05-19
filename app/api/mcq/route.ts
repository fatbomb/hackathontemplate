import { NextRequest, NextResponse } from 'next/server';
import { AIService, ExamService, QuestionService, UserExamService, TaskProgressService } from '@/services/api';
import { MCQGenerationParams } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const data: MCQGenerationParams = await request.json();
    const { refined_text, difficulty, num_questions, exam_name, time_limit, topic_name } = data;
    
    // Validate input data
    if (!refined_text || !difficulty || !num_questions || !exam_name || !topic_name) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    
    // Create a task to track progress
    const progressId = await TaskProgressService.createTask();
    
    // Extract user ID from auth token or provide a static one for testing
    const userId = request.headers.get('authorization')?.split(' ')[1] || 'test-user-id';
    
    // Generate the MCQ prompt
    const prompt = `Generate exactly ${num_questions + 3} mcq questions for the topic ${topic_name} from the following text with difficulty '${difficulty}': ${refined_text}. 
      Respond strictly in valid JSON format without any additional text. 
      The response must be a JSON object inside a list ([]) with keys: 'question', 'options' (list of 4 choices), 'answer' (correct answer as text), and 'explanation'.
      Do not include any introduction, explanation, or any other text—only return the JSON output.`;
    
    // In a real implementation, you would call your AI service here
    // This is just a mockup for demonstration
    const aiResponse = await AIService.generateMCQQuestions({
      refined_text,
      difficulty,
      num_questions,
      topic_name
    });
    
    // Process the AI response
    const allGeneratedQuestions = AIService.processResponse(JSON.stringify(aiResponse), num_questions);
    
    if (!allGeneratedQuestions.length) {
      await TaskProgressService.updateTask(progressId, 'failed');
      return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
    }
    
    // Create the exam
    const newExam = await ExamService.createExam({
      exam_name,
      refined_text,
      difficulty,
      type: 'mcq',
      time_limit,
      created_at: new Date().toISOString()
    });
    
    // Create questions for the exam
    for (const q of allGeneratedQuestions) {
      await QuestionService.createQuestion({
        exam_id: newExam.id,
        question_statement: q.question,
        options: q.options,
        correct_answer: q.answer,
        explanation: q.explanation
      });
    }
    
    // Assign exam to user
    const newUserExam = await UserExamService.assignExamToUser(userId, newExam.id);
    
    // Mark task as completed
    await TaskProgressService.deleteTask(progressId);
    
    return NextResponse.json({
      message: "Exam and questions saved successfully!",
      exam_id: newExam.id,
      user_exam_id: newUserExam.id
    });
    
  } catch (error) {
    console.error('Error in MCQ generation:', error);
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}