"use client";
import React, { useState } from 'react';
import { Loader, Send } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

const QuizGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [subjectText, setSubjectText] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  const handleGenerateQuiz = () => {
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);

      setQuizQuestions([
        {
          question: 'What is renewable energy?',
          options: ['Energy from fossil fuels', 'Energy from renewable resources', 'Nuclear energy', 'All of the above'],
          answer: 'Energy from renewable resources',
        },
        {
          question: 'Which is an example of renewable energy?',
          options: ['Solar energy', 'Coal', 'Natural gas', 'Nuclear'],
          answer: 'Solar energy',
        },
        {
          question: 'What is a key benefit of renewable energy?',
          options: ['Unlimited supply', 'High pollution', 'Non-sustainable', 'High costs'],
          answer: 'Unlimited supply',
        },
      ]);
    }, 3000);
  };

  return (
    <div className="flex min-h-screen items-start justify-between bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      {/* Input Section */}
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg transform transition duration-500 ease-out mr-6">
        <h1 className="text-2xl font-bold text-blue-600 text-center mb-4">Generate Quiz</h1>

        <p className="text-gray-600 mb-4 text-center">
          Enter the subject text to generate a quiz!
        </p>

        <textarea
          value={subjectText}
          onChange={(e) => setSubjectText(e.target.value)}
          placeholder="Enter text or notes on the subject..."
          rows={6}
          className="w-full p-4 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        ></textarea>

        <div className="mt-6">
          <button
            onClick={handleGenerateQuiz}
            disabled={!subjectText.trim() || isGenerating}
            className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-semibold text-white transition transform ${
              isGenerating || !subjectText.trim()
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader className="mr-2 h-5 w-5 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Generate Quiz
              </>
            )}
          </button>
        </div>

        {isGenerating && (
          <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded-lg animate-pulse">
            <p>Connecting to AI model... Please wait while we generate the quiz.</p>
          </div>
        )}
      </div>

      {/* Quiz Display Section */}
      <div
        className={`flex-1 p-6 bg-white rounded-lg shadow-lg transition duration-700 ease-in-out transform ${
          quizQuestions.length > 0 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
        }`}
      >
        <h2 className="text-xl font-semibold text-blue-600 mb-4">Generated Quiz</h2>
        
        {quizQuestions.map((question, index) => (
          <div key={index} className="mb-6">
            <p className="font-semibold text-gray-700 mb-2">{index + 1}. {question.question}</p>
            <ul className="space-y-1">
              {question.options.map((option, i) => (
                <li key={i} className={`px-4 py-2 rounded-lg ${option === question.answer ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-800'}`}>
                  {option}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizGenerator;
