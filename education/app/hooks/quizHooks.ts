// app/hooks/useQuiz.ts
'use client'

import { useState } from 'react';
import { createQuizAction, getQuizzesAction, deleteQuizAction, submitQuizAction } from '@/app/actions/quizActions';
import { toast } from 'react-hot-toast';

export function useQuiz() {
  const [isLoading, setIsLoading] = useState(false);

  const createQuiz = async (quizData: any) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', quizData.title);
      formData.append('description', quizData.description || '');
      formData.append('durationMinutes', quizData.durationMinutes.toString());
      formData.append('classId', quizData.classId);
      formData.append('createdBy', quizData.createdBy);
      formData.append('questions', JSON.stringify(quizData.questions));

      const result = await createQuizAction(formData);
      
      if (result.success) {
        toast.success('Quiz created successfully');
        return result.data;
      } else {
        toast.error(result.error || 'Failed to create quiz');
        return null;
      }
    } catch (error) {
      toast.error('An error occurred while creating the quiz');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getQuizzes = async () => {
    setIsLoading(true);
    try {
      const result = await getQuizzesAction();
      
      if (result.success) {
        return result.data;
      } else {
        toast.error(result.error || 'Failed to fetch quizzes');
        return [];
      }
    } catch (error) {
      toast.error('An error occurred while fetching quizzes');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const deleteQuiz = async (id: string) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('id', id);

      const result = await deleteQuizAction(formData);
      
      if (result.success) {
        toast.success('Quiz deleted successfully');
        return true;
      } else {
        toast.error(result.error || 'Failed to delete quiz');
        return false;
      }
    } catch (error) {
      toast.error('An error occurred while deleting the quiz');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const submitQuiz = async (quizId: string, studentId: string, answers: Record<string, string>) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('quizId', quizId);
      formData.append('studentId', studentId);
      formData.append('answers', JSON.stringify(answers));

      const result = await submitQuizAction(formData);
      
      if (result.success) {
        toast.success('Quiz submitted successfully');
        return result.data;
      } else {
        toast.error(result.error || 'Failed to submit quiz');
        return null;
      }
    } catch (error) {
      toast.error('An error occurred while submitting the quiz');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createQuiz,
    getQuizzes,
    deleteQuiz,
    submitQuiz
  };
}