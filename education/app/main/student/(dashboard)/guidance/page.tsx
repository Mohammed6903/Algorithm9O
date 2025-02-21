"use client";
import React, { useState } from 'react';
import { BookOpen, Target, Star, ChevronDown, ChevronUp } from 'lucide-react';

interface TestResult {
  score: number;
  total: number;
  weakAreas: string[];
  strengths: string[];
}

export default function PerformanceImprovementPage() {
  const [testResult] = useState<TestResult>({
    score: 72,
    total: 100,
    weakAreas: ['Fractions', 'Geometry'],
    strengths: ['Algebra', 'Word Problems'],
  });
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const percentage = (testResult.score / testResult.total) * 100;

  const getPerformanceMessage = () => {
    if (percentage >= 90) return "Outstanding work! You're excelling—keep pushing the boundaries!";
    if (percentage >= 70) return "Great effort! You're on the right track—let's polish those weaker spots.";
    return "You're building a foundation—let's focus on boosting your skills!";
  };

  const studyTips = {
    Fractions: [
      "Practice breaking numbers into parts with real-world examples (e.g., slicing a pizza).",
      "Watch Khan Academy videos on fraction basics.",
      "Try 10 fraction problems daily to build confidence.",
    ],
    Geometry: [
      "Draw shapes and label angles to visualize concepts.",
      "Explore interactive tools like GeoGebra.",
      "Focus on key formulas (e.g., area, perimeter) and practice applying them.",
    ],
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text mb-4 drop-shadow-md">
          Performance Booster
        </h1>
        <p className="text-gray-300 text-center mb-8">
          Unlock your potential with tailored guidance post-test!
        </p>

        {/* Score Overview */}
        <div className="p-6 bg-gray-800/90 rounded-xl shadow-[0_10px_20px_rgba(99,102,241,0.4)] border border-indigo-500/30 mb-6 transform transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-indigo-300">Your Latest Test</h2>
              <p className="text-gray-400 mt-1">Score: {testResult.score}/{testResult.total} ({percentage.toFixed(1)}%)</p>
            </div>
            <div className="text-center">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#444"
                    strokeWidth="2.8"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2.8"
                    strokeDasharray={`${percentage}, 100`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-indigo-300">
                  {percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-gray-200 italic">{getPerformanceMessage()}</p>
        </div>

        {/* Strengths */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('strengths')}
            className="w-full flex items-center justify-between p-4 bg-gray-700/70 rounded-lg shadow-[0_5px_15px_rgba(79,70,229,0.3)] hover:bg-gray-600/80 transition-all duration-300"
          >
            <div className="flex items-center">
              <Star className="h-6 w-6 text-yellow-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-200">Your Strengths</h3>
            </div>
            {expandedSection === 'strengths' ? <ChevronUp /> : <ChevronDown />}
          </button>
          {expandedSection === 'strengths' && (
            <ul className="mt-2 p-4 bg-gray-800/90 rounded-lg border border-indigo-500/30 space-y-2">
              {testResult.strengths.map((strength, index) => (
                <li key={index} className="text-gray-300 flex items-center">
                  <span className="h-2 w-2 bg-indigo-400 rounded-full mr-2"></span>
                  {strength} - Keep shining in this area!
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Weak Areas with Tips */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('weakAreas')}
            className="w-full flex items-center justify-between p-4 bg-gray-700/70 rounded-lg shadow-[0_5px_15px_rgba(79,70,229,0.3)] hover:bg-gray-600/80 transition-all duration-300"
          >
            <div className="flex items-center">
              <Target className="h-6 w-6 text-red-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-200">Areas to Improve</h3>
            </div>
            {expandedSection === 'weakAreas' ? <ChevronUp /> : <ChevronDown />}
          </button>
          {expandedSection === 'weakAreas' && (
            <div className="mt-2 p-4 bg-gray-800/90 rounded-lg border border-indigo-500/30">
              {testResult.weakAreas.map((area, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <p className="text-indigo-300 font-semibold">{area}</p>
                  <ul className="mt-2 space-y-1 text-gray-300">
                    {studyTips[area as keyof typeof studyTips]?.map((tip, i) => (
                      <li key={i} className="flex items-start">
                        <span className="h-2 w-2 bg-purple-400 rounded-full mr-2 mt-1.5"></span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resources */}
        <div className="p-6 bg-gray-800/90 rounded-xl shadow-[0_10px_20px_rgba(99,102,241,0.4)] border border-indigo-500/30">
          <div className="flex items-center mb-4">
            <BookOpen className="h-6 w-6 text-indigo-400 mr-2" />
            <h3 className="text-xl font-semibold text-gray-200">Next Steps</h3>
          </div>
          <p className="text-gray-300 mb-4">Explore these to level up:</p>
          <ul className="space-y-2">
            <li>
              <a href="https://www.khanacademy.org" target="_blank" className="text-indigo-400 hover:underline">
                Khan Academy - Free lessons & practice
              </a>
            </li>
            <li>
              <a href="https://www.geogebra.org" target="_blank" className="text-indigo-400 hover:underline">
                GeoGebra - Interactive math tools
              </a>
            </li>
            <li>
              <a href="https://quizlet.com" target="_blank" className="text-indigo-400 hover:underline">
                Quizlet - Flashcards & study games
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}