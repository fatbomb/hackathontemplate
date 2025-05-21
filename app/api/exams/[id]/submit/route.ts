import { NextResponse } from 'next/server';
import { getCurrentUser, getPocketBase } from '@/lib/pocketbase';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pb = await getPocketBase(request.headers.get('cookie') || '');

    if (!pb.authStore.isValid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userExamId, answers, timeSpent, clientTimeStamp } = await request.json();

    // Verify the exam belongs to this user
    const userExam = await pb.collection('user_exams').getOne(userExamId);
    if (userExam.user_id !== pb.authStore.model?.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to this exam' },
        { status: 403 }
      );
    }

    // Calculate results
    const questions = await pb.collection('questions').getFullList({
      filter: `exam_id = "${params.id}"`
    });
    const exam = await pb.collection('exams').getOne(params.id);

    let correctCount = 0;
    const questionResults = questions.map((question, index) => {
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
    }
    let topicRecord;
    try {
      const topicRecords = await pb.collection('topics').getList(1, 1, {
        filter: `title="${exam.topic_name}" && subject="${subjectRecord.id}"`
      });
      topicRecord = topicRecords.items[0];
    } catch (error) {
      // Topic not found, create it
      topicRecord = await pb.collection('topics').create({
        title: exam.topic_name,
        subject: subjectRecord.id
      });
    }
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const records = await pb.collection('game_points').getList(1, 1, {
      filter: `topic="${topicRecord.id}" && user="${user.id}" && type="gymnasium"`,
      expand: 'user,topic'
    });
    

    if (records.items.length > 0) {
      const existingRecord = records.items[0];
      // Update existing record
      const pointsToAdd = 50 - existingRecord.level * 5;
      let newPoints = existingRecord.points + pointsToAdd;
      const newLevel = newPoints >= 100 ? Math.min(existingRecord.level + 1, 10) : existingRecord.level;
      newPoints = newPoints >= 100 ? newPoints - 100 : newPoints;

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

        return NextResponse.json({
          success: true,
          subject: subjectRecord,
          topic: topicRecord
        });

      } catch (error) {
        console.error("Full error:", {
          status: (error as any)?.status,
          data: (error as any)?.response?.data,
          message: (error instanceof Error) ? error.message : 'Unknown error'
        });
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
      answers: answers,
      completed_at: new Date().toISOString(),
      time_spent: timeSpent
    });

    return NextResponse.json({
      score,
      questions: questionResults
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to submit exam' },
      { status: 500 }
    );
  }
}