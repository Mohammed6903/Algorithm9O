"use client"
import React, { useState, useEffect, FormEvent } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Type definitions for API responses
interface QuizMetadata {
  generated_at: string;
  board: string;
  class: string;
  subject: string;
  topic: string | null;
  student_level: string;
  student_ability: number;
}

interface Question {
  question_id: string;
  text: string;
  type: 'MCQ' | 'short' | 'long';
  options: string[];
  correct_answer: string;
  difficulty: string;
  marks: number;
  solution_steps: string;
  irt_a: number;
  irt_b: number;
}

interface Quiz {
  quiz_id: string;
  metadata: QuizMetadata;
  questions: Question[];
}

interface QuizResponse {
  task_id: string;
  status: string;
  message: string;
}

interface QuizResult {
  quiz_id: string;
  score: number;
  total_marks: number;
  percentage: number;
  updated_ability: number;
  updated_level: string;
}

interface StudentAbility {
  ability: number;
  level: string;
}

interface QuizHistory {
  [quizId: string]: {
    score: number;
    total_marks: number;
    questions: Question[];
    timestamp: string;
  };
}

const QuizPage: React.FC = () => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [ability, setAbility] = useState<StudentAbility>({ ability: 0, level: 'intermediate' });
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [result, setResult] = useState<QuizResult | null>(null);
  const [history, setHistory] = useState<QuizHistory>({});

  // Fetch initial data on mount
  useEffect(() => {
    fetchSubjects();
    fetchStudentAbility();
    fetchStudentHistory();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('http://localhost:8000/subjects');
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data: { subjects: string[] } = await response.json();
      setSubjects(data.subjects);
    } catch (error) {
      setErrorMessage('Error fetching subjects');
      setStatus('error');
    }
  };

  const fetchStudentAbility = async () => {
    try {
      const response = await fetch('http://localhost:8000/student-ability');
      if (!response.ok) throw new Error('Failed to fetch ability');
      const data: StudentAbility = await response.json();
      setAbility(data);
    } catch (error) {
      setErrorMessage('Error fetching student ability');
      setStatus('error');
    }
  };

  const fetchStudentHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/student-history');
      if (!response.ok) throw new Error('Failed to fetch history');
      const data: QuizHistory = await response.json();
      setHistory(data);
    } catch (error) {
      setErrorMessage('Error fetching student history');
      setStatus('error');
    }
  };

  const pollTaskStatus = async (taskId: string, endpoint: 'quiz-result' | 'evaluation-result') => {
    try {
      const response = await fetch(`http://localhost:8000/${endpoint}/${taskId}`);
      if (response.status === 200) { // Completed
        const data = await response.json();
        if (endpoint === 'quiz-result') {
          setQuiz(data as Quiz);
        } else {
          setResult(data as QuizResult);
          await fetchStudentAbility(); // Update ability
          await fetchStudentHistory(); // Update history
        }
        setStatus('completed');
      } else if (response.status === 500) { // Failed
        const errorData = await response.json();
        setStatus('error');
        setErrorMessage(errorData.detail);
      } else { // Still processing (202)
        setTimeout(() => pollTaskStatus(taskId, endpoint), 2000);
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(`Error polling ${endpoint}`);
    }
  };

  const handleGenerateQuiz = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) {
      setErrorMessage('Please select a subject');
      setStatus('error');
      return;
    }

    setStatus('processing');
    setErrorMessage('');
    setQuiz(null);
    setResponses({});
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: selectedSubject, topic: topic || undefined }),
      });
      if (!response.ok) throw new Error('Failed to generate quiz');
      const data: QuizResponse = await response.json();
      setTaskId(data.task_id);
      pollTaskStatus(data.task_id, 'quiz-result');
    } catch (error) {
      setStatus('error');
      setErrorMessage('Error generating quiz');
    }
  };

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitQuiz = async (e: FormEvent) => {
    e.preventDefault();
    if (!quiz || Object.keys(responses).length === 0) {
      setErrorMessage('Please answer at least one question');
      setStatus('error');
      return;
    }

    setStatus('processing');
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:8000/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz_id: quiz.quiz_id, responses }),
      });
      if (!response.ok) throw new Error('Failed to submit quiz');
      const data: QuizResponse = await response.json();
      setTaskId(data.task_id);
      pollTaskStatus(data.task_id, 'evaluation-result');
    } catch (error) {
      setStatus('error');
      setErrorMessage('Error submitting quiz');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="bg-white rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Quiz Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Error Alert */}
          {status === 'error' && (
            <Alert variant="warning">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Student Ability */}
          <div className="mb-4">
            <Label>Current Ability</Label>
            <p className="text-sm text-gray-700">
              Ability Score: {ability.ability.toFixed(2)} | Level: {ability.level}
            </p>
          </div>

          {/* Quiz Generation Form */}
          {!quiz && (
            <form onSubmit={handleGenerateQuiz} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select onValueChange={setSelectedSubject} value={selectedSubject}>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic (Optional)</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter a specific topic"
                />
              </div>

              <Button type="submit" className="w-full" disabled={status === 'processing'}>
                {status === 'processing' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  'Generate Quiz'
                )}
              </Button>
            </form>
          )}

          {/* Quiz Questions */}
          {quiz && (
            <form onSubmit={handleSubmitQuiz} className="space-y-4">
              <h3 className="text-lg font-medium">
                Quiz: {quiz.metadata.subject} - {quiz.metadata.topic || 'General'}
              </h3>
              {quiz.questions.map((question) => (
                <div key={question.question_id} className="p-4 border rounded-lg">
                  <p className="font-medium">{question.text}</p>
                  <p className="text-sm text-gray-500">
                    Type: {question.type} | Difficulty: {question.difficulty} | Marks: {question.marks}
                  </p>

                  {question.type === 'MCQ' ? (
                    <div className="mt-2 space-y-2">
                      {question.options.map((option, idx) => (
                        <div key={idx} className="flex items-center">
                          <input
                            type="radio"
                            name={question.question_id}
                            value={option}
                            checked={responses[question.question_id] === option}
                            onChange={(e) => handleResponseChange(question.question_id, e.target.value)}
                            className="mr-2"
                          />
                          <label>{option}</label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Input
                      type="text"
                      value={responses[question.question_id] || ''}
                      onChange={(e) => handleResponseChange(question.question_id, e.target.value)}
                      placeholder="Enter your answer"
                      className="mt-2"
                    />
                  )}
                </div>
              ))}

              <Button type="submit" className="w-full" disabled={status === 'processing'}>
                {status === 'processing' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Quiz'
                )}
              </Button>
            </form>
          )}

          {/* Quiz Result */}
          {result && (
            <div className="mt-4">
              <h3 className="text-lg font-medium">Quiz Result</h3>
              <p>Score: {result.score} / {result.total_marks} ({result.percentage.toFixed(2)}%)</p>
              <p>Updated Ability: {result.updated_ability.toFixed(2)} ({result.updated_level})</p>
            </div>
          )}

          {/* Quiz History */}
          {Object.keys(history).length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium">Quiz History</h3>
              {Object.entries(history).map(([quizId, details]) => (
                <div key={quizId} className="p-2 border-b">
                  <p>Quiz ID: {quizId}</p>
                  <p>Score: {details.score} / {details.total_marks}</p>
                  <p>Timestamp: {details.timestamp}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizPage;