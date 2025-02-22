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
import { RadioGroupItem, RadioGroup } from '@/components/ui/radio-group';

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
  type: 'MCQ' | 'short' | 'true false';
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
  
  const renderQuestionInput = (question: Question) => {
    switch (question.type) {
      case 'MCQ':
        return (
          <RadioGroup
            value={responses[question.question_id] || ""}
            onValueChange={(value) => handleResponseChange(question.question_id, value)}
            className="mt-2 space-y-2"
          >
            {question.options.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.question_id}-${idx}`} />
                <Label htmlFor={`${question.question_id}-${idx}`} className="cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      
      case 'true false':
        return (
          <RadioGroup
            value={responses[question.question_id] || ""}
            onValueChange={(value) => handleResponseChange(question.question_id, value)}
            className="mt-2 flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`${question.question_id}-true`} />
              <Label htmlFor={`${question.question_id}-true`} className="cursor-pointer">
                True
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`${question.question_id}-false`} />
              <Label htmlFor={`${question.question_id}-false`} className="cursor-pointer">
                False
              </Label>
            </div>
          </RadioGroup>
        );
      
      case 'short':
        return (
          <Input
            type="text"
            value={responses[question.question_id] || ''}
            onChange={(e) => handleResponseChange(question.question_id, e.target.value)}
            placeholder="Enter your answer"
            className="mt-2"
          />
        );
      
      default:
        return null;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
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
          {status === 'error' && (
            <Alert variant="warning">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="mb-6 bg-blue-50 p-4 rounded-lg">
            <Label className="text-blue-700">Current Ability</Label>
            <p className="text-sm text-blue-600">
              Ability Score: <span className="font-semibold">{ability.ability.toFixed(2)}</span> | 
              Level: <span className="font-semibold">{ability.level}</span>
            </p>
          </div>

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

              <Button 
                type="submit" 
                className="w-full"
                disabled={status === 'processing'}
              >
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

          {quiz && (
            <form onSubmit={handleSubmitQuiz} className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-medium text-gray-800">
                  {quiz.metadata.subject} - {quiz.metadata.topic || 'General'}
                </h3>
                <p className="text-sm text-gray-600">
                  Generated at: {new Date(quiz.metadata.generated_at).toLocaleString()}
                </p>
              </div>

              {quiz.questions.map((question, index) => (
                <div key={question.question_id} className="bg-white border rounded-lg p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                      <span className="text-sm text-gray-500">
                        {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-800 font-medium mb-4">{question.text}</p>
                  {renderQuestionInput(question)}
                </div>
              ))}

              <Button 
                type="submit" 
                className="w-full"
                disabled={status === 'processing'}
              >
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

          {result && (
            <div className="mt-6 bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-green-800 mb-3">Quiz Result</h3>
              <div className="space-y-2">
                <p className="text-green-700">
                  Score: <span className="font-semibold">{result.score}</span> / {result.total_marks} 
                  <span className="ml-2">({result.percentage.toFixed(2)}%)</span>
                </p>
                <p className="text-green-700">
                  Updated Ability: <span className="font-semibold">{result.updated_ability.toFixed(2)}</span>
                  <span className="ml-2">({result.updated_level})</span>
                </p>
              </div>
            </div>
          )}

          {Object.keys(history).length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Quiz History</h3>
              <div className="space-y-3">
                {Object.entries(history).map(([quizId, details]) => (
                  <div key={quizId} className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Quiz ID: {quizId}</p>
                    <p className="text-sm font-medium">
                      Score: {details.score} / {details.total_marks}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(details.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizPage;