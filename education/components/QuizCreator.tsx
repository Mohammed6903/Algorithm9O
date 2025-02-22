"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { QuestionType } from "@prisma/client";
import { getTopics } from "@/app/actions/topicActions";

// Define the question structure for the form
type QuestionFormData = {
  questionText: string;
  questionType: QuestionType;
  correctAnswer: string;
  options: string[];
  points: number;
  topicId: string;
  difficulty: number;
};

export default function CreateQuizPage() {
  const router = useRouter();

  // Quiz form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number | "">(60);
  const [classId, setClassId] = useState(""); // Assuming a hardcoded or fetched classId for simplicity
  const [loading, setLoading] = useState(false);

  // Questions state
  const [questions, setQuestions] = useState<QuestionFormData[]>([
    {
      questionText: "",
      questionType: "multiple_choice" as QuestionType,
      correctAnswer: "",
      options: ["", "", "", ""], // Default 4 options for MCQ
      points: 1,
      topicId: "",
      difficulty: 1,
    },
  ]);

  // Topics for dropdown
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);

  // Fetch topics on mount
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const fetchedTopics = await getTopics();
        setTopics(fetchedTopics);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load topics");
      }
    };
    fetchTopics();
  }, []);

  // Handle adding a new question
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        questionType: "multiple_choice" as QuestionType,
        correctAnswer: "",
        options: ["", "", "", ""],
        points: 1,
        topicId: "",
        difficulty: 1,
      },
    ]);
  };

  // Handle question field changes
  const handleQuestionChange = (index: number, field: keyof QuestionFormData, value: any) => {
    const updatedQuestions = [...questions];
    if (field === "options") {
      updatedQuestions[index][field] = value;
    } else {
      updatedQuestions[index][field] = value as never;
    }
    setQuestions(updatedQuestions);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim() || !classId.trim()) {
      toast.error("Quiz title and class ID are required");
      return;
    }
    if (questions.some((q) => !q.questionText.trim() || !q.correctAnswer.trim() || !q.topicId)) {
      toast.error("All questions must have text, a correct answer, and a topic selected");
      return;
    }
    if (questions.some((q) => q.questionType === "multiple_choice" && q.options.some((opt) => !opt.trim()))) {
      toast.error("All multiple-choice options must be filled");
      return;
    }

    setLoading(true);
    try {
      const quizData = {
        title: title.trim(),
        description: description.trim() || undefined,
        durationMinutes: durationMinutes === "" ? undefined : Number(durationMinutes),
        classId,
        createdBy: "e939da36-91cb-40e9-b34d-7d740def08bcr",
        questions: questions.map((q) => ({
          questionText: q.questionText.trim(),
          questionType: q.questionType,
          correctAnswer: q.correctAnswer.trim(),
          options: q.questionType === "multiple_choice" ? q.options.map((opt) => opt.trim()) : undefined,
          points: q.points,
          topicId: q.topicId,
          difficulty: q.difficulty,
        })),
      };

      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizData),
      });

      if (!res.ok) throw new Error("Failed to create quiz");
      toast.success("Quiz created successfully");
      router.push("/dashboard/quizzes");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Create New Quiz</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Quiz Details</h2>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-600">
              Quiz Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Midterm Math Quiz"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-600">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the quiz"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="durationMinutes" className="block text-sm font-medium text-gray-600">
              Duration (Minutes)
            </label>
            <input
              type="number"
              id="durationMinutes"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value === "" ? "" : Number(e.target.value))}
              min="1"
              placeholder="e.g., 60"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="classId" className="block text-sm font-medium text-gray-600">
              Class ID
            </label>
            <input
              type="text"
              id="classId"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              placeholder="e.g., class-uuid"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">Enter the class ID this quiz belongs to.</p>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Questions</h2>
          {questions.map((question, index) => (
            <div key={index} className="border p-4 rounded-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Question Text</label>
                <input
                  type="text"
                  value={question.questionText}
                  onChange={(e) => handleQuestionChange(index, "questionText", e.target.value)}
                  placeholder="e.g., What is 2 + 2?"
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Question Type</label>
                <select
                  value={question.questionType}
                  onChange={(e) => handleQuestionChange(index, "questionType", e.target.value as QuestionType)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="short_answer">Short Answer</option>
                </select>
              </div>
              {question.questionType === "multiple_choice" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600">Options</label>
                  {question.options.map((opt, optIndex) => (
                    <input
                      key={optIndex}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...question.options];
                        newOptions[optIndex] = e.target.value;
                        handleQuestionChange(index, "options", newOptions);
                      }}
                      placeholder={`Option ${optIndex + 1}`}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                  ))}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-600">Correct Answer</label>
                <input
                  type="text"
                  value={question.correctAnswer}
                  onChange={(e) => handleQuestionChange(index, "correctAnswer", e.target.value)}
                  placeholder="e.g., 4"
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Topic</label>
                <select
                  value={question.topicId}
                  onChange={(e) => handleQuestionChange(index, "topicId", e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading || topics.length === 0}
                >
                  <option value="">Select a topic</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
                {topics.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">No topics available. Add topics first.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Points</label>
                <input
                  type="number"
                  value={question.points}
                  onChange={(e) => handleQuestionChange(index, "points", Number(e.target.value))}
                  min="1"
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Difficulty (1-10)</label>
                <input
                  type="number"
                  value={question.difficulty}
                  onChange={(e) => handleQuestionChange(index, "difficulty", Number(e.target.value))}
                  min="1"
                  max="10"
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition disabled:bg-green-400"
            disabled={loading}
          >
            Add Another Question
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-blue-400"
          disabled={loading}
        >
          {loading ? "Creating Quiz..." : "Create Quiz"}
        </button>
      </form>
    </div>
  );
}