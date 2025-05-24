import { NextResponse } from 'next/server';
import { getCurrentUser, getPocketBase } from '@/lib/pocketbase';
import { ServerQuestion } from '@/types';

export async function POST(
  request: Request,
  { params }: { params: Promise< { id: string }> }
) {
  try {
    const pb = await getPocketBase(request.headers.get('cookie') || '');
    const { id: examId } = await params;
    console.log("Exam ID:", examId);

    if (!pb.authStore.isValid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userExamId, answers, timeSpent } = await request.json();

    // Verify the exam belongs to this user
    const userExam = await pb.collection('user_exams').getOne(userExamId);
    if (userExam.user_id !== pb.authStore.model?.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to this exam' },
        { status: 403 }
      );
    }

    // Calculate results
    const questions: ServerQuestion[] = await pb.collection('questions').getFullList({
      filter: `exam_id = "${examId}"`
    });
    const exam = await pb.collection('exams').getOne(examId);
    // console.log("Exam:", exam);
    // console.log("Questions:", questions);

    let correctCount = 0;
    const questionResults = questions.map((question: ServerQuestion, index: number) => {
      const userAnswer = answers[index]?.selectedAnswer;
      const isCorrect = Number(userAnswer) === Number(question.correct_answer);
      if (isCorrect) correctCount++;
      return {
        id: question.id,
        correctAnswer: question.correct_answer,
        userAnswer,
        isCorrect,
        explanation: question.explaination
      };
    });


    const score = (correctCount / questions.length) * 100;
    let subjectRecord;
    try {
      const subjectRecords = await pb.collection('subjects').getList(1, 1, {
        filter: `title="${exam.subject}"`
      });
      subjectRecord = subjectRecords.items[0];
    } catch (error) {
      // Subject not found, create it
      subjectRecord = await pb.collection('subjects').create({
        title: exam.subject
      });
      console.log("Subject Record:", error);
    }
    // console.log("Subject Record:", subjectRecord);
    let topicRecord;
    try {
      const topicRecords = await pb.collection('topics').getList(1, 1, {
        filter: `title="${exam.topic}" && subject="${subjectRecord.id}"`
      });
      topicRecord = topicRecords.items[0];
    } catch (error) {
      // Topic not found, create it
      topicRecord = await pb.collection('topics').create({
        title: exam.topic,
        subject: subjectRecord.id
      });
      console.log("Topic Record:", error);
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    console.log("User ID:", user);
    console.log("topic ID:", topicRecord);

    const records = await pb.collection('game_points').getList(1, 1, {
      filter: `topic="${topicRecord.id}" && user="${userExam.user_id}" && type="gymnasium"`,
      expand: 'user,topic'
    });
    

    if (records.items.length > 0) {
      const existingRecord = records.items[0];
      // Update existing record
      const pointsToAdd = (50 - existingRecord.level * 5)*correctCount;
      let newPoints = existingRecord.points + pointsToAdd;
      const newLevel = newPoints >= 100 ? Math.min(existingRecord.level + Math.floor(newPoints / 100), 10) : existingRecord.level;
      newPoints = newPoints%100;

      await pb.collection('game_points').update(existingRecord.id, {
        points: newPoints,
        level: newLevel
      });
    } else {
      // Create new record
      // Fetch the topic related to the topic_name
      try {
        // 1. Find or create the subject

        console.log("Subject Record:", subjectRecord);

        // 2. Find or create the topic (linked to subject)

        console.log("Topic Record:", topicRecord);
        // 3. Create game_points record
        await pb.collection('game_points').create({
          topic: topicRecord.id,
          subject: subjectRecord.id,
          points: 20,
          level: 1,
          user: user.id,
          type: 'gymnasium'
        });


      } catch (error) {
        console.error("Error occurred while processing game points:", error);
        return NextResponse.json(
          { error: "Failed to process game points" },
          { status: 500 }
        );
      }
    }

    // Save the result
    await pb.collection('user_exams').update(userExamId, {
      status: 'completed',
      score,
      completed_at: new Date().toISOString(),
      time_spent: timeSpent
    });
    for (const answer of answers) {
      await pb.collection('user_answers').create({
        user_exam_id: userExamId,
        question_id: answer.questionId,
        selected_answer: answer.selectedAnswer
      });
    }

    return NextResponse.json({
      score,
      questions: questionResults
    });

  } catch (error) {
    console.error('Error submitting exam:', error);
    return NextResponse.json(
      { error: 'Failed to submit exam' },
      { status: 500 }
    );
    
  }
}