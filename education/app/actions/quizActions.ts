// app/actions/quizActions.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createQuizAction(formData: FormData) {
  'use server'
  
  try {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const durationMinutes = parseInt(formData.get('durationMinutes') as string);
    const classId = formData.get('classId') as string;
    const createdBy = formData.get('createdBy') as string;
    const questions = JSON.parse(formData.get('questions') as string);

    const response = await prisma.quiz.create({
      data: {
        title,
        description,
        durationMinutes,
        createdBy,
        isAiGenerated: false,
        questions: {
          create: questions.map((q: any) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            correctAnswer: q.correctAnswer,
            options: q.options ? JSON.stringify(q.options) : null,
            points: q.points,
            topicId: q.topicId,
            difficulty: q.difficulty
          }))
        }
      },
      include: {
        questions: true
      }
    });
    
    return { success: true, data: response };
  } catch (error) {
    console.error("Error creating quiz:", error);
    return { success: false, error: 'Failed to create quiz' };
  }
}

export async function getQuizzesAction() {
  'use server'
  
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        questions: true,
        creator: true,
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return { success: true, data: quizzes };
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return { success: false, error: 'Failed to fetch quizzes' };
  }
}

export async function deleteQuizAction(formData: FormData) {
  'use server'
  
  try {
    const id = formData.get('id') as string;
    await prisma.quiz.delete({
      where: { id }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return { success: false, error: 'Failed to delete quiz' };
  }
}

export async function submitQuizAction(formData: FormData) {
  'use server'
  
  try {
    const quizId = formData.get('quizId') as string;
    const studentId = formData.get('studentId') as string;
    const answers = JSON.parse(formData.get('answers') as string);

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true }
    });

    if (!quiz) {
      return { success: false, error: 'Quiz not found' };
    }

    let totalPoints = 0;
    let earnedPoints = 0;

    quiz.questions.forEach(question => {
      totalPoints += question.points;
      if (answers[question.id] === question.correctAnswer) {
        earnedPoints += question.points;
      }
    });

    const score = (earnedPoints / totalPoints) * 100;

    const submission = await prisma.quizSubmission.create({
      data: {
        quizId,
        studentId,
        score,
        answers: JSON.stringify(answers)
      }
    });

    return { success: true, data: submission };
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return { success: false, error: 'Failed to submit quiz' };
  }
}