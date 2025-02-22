'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { startDebateDuel } from '@/app/actions/debateAction';
import { getProfileAction } from '@/app/actions/userDbActions';

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [stance, setStance] = useState('');
  const [argumentCards, setArgumentCards] = useState<string[]>([]);
  const [duelStarted, setDuelStarted] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [debateHistory, setDebateHistory] = useState<{ user: string; ai: string }[]>([]);
  const [availableCards, setAvailableCards] = useState<string[]>(['Logic']);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<string>('');
  const [scorecard, setScorecard] = useState<{ logic: number; evidence: number; persuasion: number } | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [debateId, setDebateId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const topics = [
    'Should homework be banned?',
    'Is social media good for teens?',
    'Should AI replace teachers?',
    'Custom topic',
  ];

  const debateTopic = selectedTopic === 'Custom topic' && customTopic ? customTopic : selectedTopic;

  const addCard = (card: string) => {
    if (argumentCards.length < 3 && !argumentCards.includes(card) && availableCards.includes(card)) {
      setArgumentCards([...argumentCards, card]);
      setAvailableCards(availableCards.filter(c => c !== card)); // Remove used card
    }
  };

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

  // Sound effect functions
  const playAiResponseSound = () => {
    const audio = new Audio('/sounds/whoosh.mp3'); // Add this file to public/sounds/
    audio.play().catch(err => console.error('Sound error:', err));
  };

  const playEndDebateSound = () => {
    const audio = new Audio('/sounds/celebration.mp3'); // Add this file to public/sounds/
    audio.play().catch(err => console.error('Sound error:', err));
  };

 const speakAiResponse = (text: string) => {
  if ('speechSynthesis' in window) {
    const sentences = text.split('. ').filter(s => s.trim());
    sentences.forEach((sentence, index) => {
      const utterance = new SpeechSynthesisUtterance(sentence + '.');
      const voices = speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang === 'en-US' && v.name.includes('Female')) || voices[0];
      if (voice) utterance.voice = voice;
      utterance.pitch = 1;
      utterance.rate = 1;
      utterance.volume = 1;
      if (index > 0) utterance.onstart = () => setTimeout(() => speechSynthesis.speak(utterance), 500); // 0.5s pause
      else speechSynthesis.speak(utterance);
    });
  } else {
    console.warn('Text-to-Speech not supported in this browser.');
  }
};

  const startDuel = async () => {
    if (!debateTopic || !stance || argumentCards.length === 0) {
      setError("Please select a topic, stance, and at least one argument card.");
      return;
    }

    setIsLoading(true); // Show loader
    try {
      const studentProfile = await getProfileAction();
      if (!studentProfile?.id) {
        setError("Failed to retrieve student ID. Please log in.");
        return;
      }
      const studentId = studentProfile.id;

      const { data } = await axios.post<{ ai_response: string }>(
        `${BASE_URL}/debate`,
        {
          topic: debateTopic,
          stance,
          cards: argumentCards,
          user_input: argumentCards.join(', '),
          action: 'start',
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const aiResponseFromServer = data.ai_response;
      setAiResponse(aiResponseFromServer);
      setDebateHistory([{ user: argumentCards.join(', '), ai: aiResponseFromServer }]);
      setDuelStarted(true);

      const result = await startDebateDuel(debateTopic, stance, argumentCards, aiResponseFromServer, studentId);
      setDebateId(result.id);
      setError(null);

      // Speak the AI response
      speakAiResponse(aiResponseFromServer);
    } catch (error) {
      console.error("Error starting debate:", error);
      setError("Failed to start debate. Please try again.");
    } finally {
      setIsLoading(false); // Hide loader
      playAiResponseSound(); // Play sound when AI responds
    }
  };

  const continueDebate = async () => {
    if (!userInput.trim()) {
      setError("Please enter a response before continuing.");
      return;
    }

    setIsLoading(true); // Show loader
    try {
      const studentProfile = await getProfileAction();
      if (!studentProfile?.id) {
        setError("Failed to retrieve student ID. Please log in.");
        return;
      }
      const studentId = studentProfile.id;

      const newCards = ['Stats', 'Emotion', 'Ethics'].filter(c => !argumentCards.includes(c) && !availableCards.includes(c));
      if (newCards.length > 0) {
        setAvailableCards([...availableCards, newCards[0]]); // Add one card at a time
      }

      const { data } = await axios.post<{ ai_response: string }>(
        `${BASE_URL}/debate`,
        {
          topic: debateTopic,
          stance,
          cards: argumentCards,
          user_input: userInput,
          action: 'continue',
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const aiResponseFromServer = data.ai_response;
      setAiResponse(aiResponseFromServer);
      setDebateHistory([...debateHistory, { user: userInput, ai: aiResponseFromServer }]);
      setUserInput('');

      await startDebateDuel(
        debateTopic,
        stance,
        argumentCards,
        aiResponseFromServer,
        studentId,
        debateId || ""
      );
      setError(null);

      // Speak the AI response
      speakAiResponse(aiResponseFromServer);
    } catch (error) {
      console.error("Error continuing debate:", error);
      setError("Failed to continue debate. Please try again.");
    } finally {
      setIsLoading(false); // Hide loader
      playAiResponseSound(); // Play sound when AI responds
    }
  };

  const endDebate = async () => {
    setIsLoading(true); // Show loader
    try {
      const studentProfile = await getProfileAction();
      if (!studentProfile?.id) {
        setError("Failed to retrieve student ID. Please log in.");
        return;
      }
      const studentId = studentProfile.id;

      const { data } = await axios.post<{
        review: string;
        scorecard: { logic: number; evidence: number; persuasion: number };
        suggestions: string[];
      }>(
        `${BASE_URL}/debate`,
        {
          topic: debateTopic,
          stance,
          cards: argumentCards,
          user_input: '',
          action: 'end',
        },
        { headers: { "Content-Type": "application/json" } }
      );

      setReview(data.review);
      setScorecard(data.scorecard);
      setSuggestions(data.suggestions);
      setDuelStarted(false);
      setError(null);

      // Speak the review
      speakAiResponse(data.review);
      // Optionally speak suggestions
      data.suggestions.forEach(suggestion => speakAiResponse(suggestion));
    } catch (error) {
      console.error("Error ending debate:", error);
      setError("Failed to end debate. Please try again.");
    } finally {
      setIsLoading(false); // Hide loader
      playEndDebateSound(); // Play celebratory sound when ending
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center">
      <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-10 animate-pulse">
        Debate Duel Arena
      </h1>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
        </div>
      )}

      {!duelStarted ? (
        <div className="w-full max-w-3xl space-y-8">
          {/* Topic Spinner */}
          <div className="relative">
            <label className="text-2xl font-bold text-blue-300 mb-4 block">
              Select Your Arena
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full p-4 bg-gray-800 border-4 border-blue-500 rounded-full text-white text-lg font-semibold focus:outline-none focus:border-purple-500 transition-all duration-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            >
              <option value="">Choose a topic</option>
              {topics.map((topic) => (
                <option key={topic} value={topic} className="bg-gray-800">
                  {topic}
                </option>
              ))}
            </select>
            {selectedTopic === 'Custom topic' && (
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Craft your own arena"
                className="w-full mt-4 p-4 bg-gray-800 border-4 border-purple-500 rounded-full text-white focus:outline-none focus:border-pink-500 transition-all duration-500"
              />
            )}
          </div>

          {/* Stance Toggle */}
          <div>
            <label className="text-2xl font-bold text-blue-300 mb-4 block">
              Pick Your Side
            </label>
            <div className="flex gap-6 justify-center">
              <button
                onClick={() => setStance('For')}
                className={`px-8 py-4 rounded-full text-xl font-bold transition-all duration-300 ${stance === 'For'
                  ? 'bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.7)]'
                  : 'bg-gray-700 hover:bg-blue-500 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                  }`}
              >
                For
              </button>
              <button
                onClick={() => setStance('Against')}
                className={`px-8 py-4 rounded-full text-xl font-bold transition-all duration-300 ${stance === 'Against'
                  ? 'bg-pink-600 shadow-[0_0_15px_rgba(236,72,153,0.7)]'
                  : 'bg-gray-700 hover:bg-pink-500 hover:shadow-[0_0_10px_rgba(236,72,153,0.5)]'
                  }`}
              >
                Against
              </button>
            </div>
          </div>

          {/* Argument Card Builder (Initial) */}
          <div>
            <label className="text-2xl font-bold text-blue-300 mb-4 block">
              Build Your Argument (Initial)
            </label>
            <div className="flex flex-wrap gap-4">
              {availableCards.map((card) => (
                <button
                  key={card}
                  onClick={() => addCard(card)}
                  disabled={argumentCards.includes(card)}
                  className={`px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg shadow-lg hover:scale-105 transition-all duration-300 ${argumentCards.includes(card)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                    }`}
                >
                  {card}
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-4">
              {argumentCards.map((card) => (
                <div
                  key={card}
                  className="px-4 py-2 bg-gray-800 border-2 border-purple-500 rounded-lg text-sm animate-flip"
                >
                  {card}
                </div>
              ))}
            </div>
          </div>

          {/* Duel Button */}
          <button
            onClick={startDuel}
            className="w-full py-5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-2xl font-bold rounded-full hover:scale-105 transition-all duration-500 animate-pulse shadow-[0_0_20px_rgba(139,92,246,0.7)]"
          >
            Enter the Duel
          </button>

          {/* Error Message */}
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      ) : (
        <div className="w-full max-w-4xl animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User Side */}
            <div className="p-6 bg-gray-800 rounded-xl border-4 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.5)] transform hover:rotate-2 transition-all duration-300">
              <h2 className="text-3xl font-bold text-blue-400 mb-4">
                Your Strike
              </h2>
              <p className="text-lg">{debateTopic}</p>
              <p className="text-xl text-blue-300">{stance}</p>
              <div className="mt-4 flex gap-2">
                {argumentCards.map((card) => (
                  <span
                    key={card}
                    className="px-3 py-1 bg-blue-600 rounded-full text-sm"
                  >
                    {card}
                  </span>
                ))}
              </div>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Respond to the AI..."
                className="w-full mt-4 p-4 bg-gray-700 border-2 border-purple-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* AI Side */}
            <div className="p-6 bg-gray-800 rounded-xl border-4 border-pink-500 shadow-[0_0_25px_rgba(236,72,153,0.5)] transform hover:-rotate-2 transition-all duration-300">
              <h2 className="text-3xl font-bold text-pink-400 mb-4">
                AI Counter-Strike
              </h2>
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-spin-slow shadow-[0_0_30px_rgba(236,72,153,0.7)]"></div>
              <p className="text-lg mt-4">
                {aiResponse || 'AI response loading...'}
              </p>
              {/* Optional: Button to replay AI voice */}
              <button
                onClick={() => speakAiResponse(aiResponse)}
                className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
              >
                Replay AI Voice
              </button>
            </div>
          </div>

          {/* Continue/End Buttons */}
          <div className="mt-4 flex gap-4 justify-center">
            <button
              onClick={continueDebate}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-md"
            >
              Continue Debate
            </button>
            <button
              onClick={endDebate}
              className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all duration-300 shadow-md"
            >
              End Debate
            </button>
          </div>

          {/* Debate History */}
          {debateHistory.length > 0 && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg border-2 border-purple-500">
              <h3 className="text-2xl font-bold text-purple-400 mb-2">Debate History</h3>
              {debateHistory.map((entry, index) => (
                <div key={index} className="mb-2">
                  <p className="text-blue-300">You: {entry.user}</p>
                  <p className="text-pink-300">AI: {entry.ai}</p>
                  {/* Optional: Button to replay AI voice for this entry */}
                  <button
                    onClick={() => speakAiResponse(entry.ai)}
                    className="mt-1 px-3 py-1 bg-purple-300 text-white rounded-lg text-sm hover:bg-purple-400 transition-all"
                  >
                    Replay AI Voice
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Review and Scorecard (After Ending) */}
          {review && (
            <div className="mt-6 p-6 bg-gray-800 rounded-xl border-4 border-purple-500 shadow-[0_0_25px_rgba(139,92,246,0.5)] animate-slide-up">
              <h2 className="text-3xl font-bold text-purple-400 mb-4">Debate Review</h2>
              <p className="text-lg">{review}</p>
              {scorecard && (
                <div className="mt-4">
                  <h3 className="text-2xl font-bold text-purple-300">Scorecard</h3>
                  <p>Logic: {scorecard.logic}/10</p>
                  <p>Evidence: {scorecard.evidence}/10</p>
                  <p>Persuasion: {scorecard.persuasion}/10</p>
                  {/* Button to replay review voice */}
                  <button
                    onClick={() => speakAiResponse(review)}
                    className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
                  >
                    Replay Review Voice
                  </button>
                </div>
              )}
              {suggestions.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-2xl font-bold text-purple-300">Improvement Suggestions</h3>
                  <ul className="list-disc pl-5">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="text-lg">{suggestion}</li>
                    ))}
                  </ul>
                  {/* Button to replay suggestions voice */}
                  <button
                    onClick={() => suggestions.forEach(s => speakAiResponse(s))}
                    className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
                  >
                    Replay Suggestions Voice
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      )}
    </div>
  );
}