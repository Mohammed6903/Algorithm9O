"use client";

import { useState } from "react";

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [stance, setStance] = useState("");
  const [argumentCards, setArgumentCards] = useState<string[]>([]);
  const [duelStarted, setDuelStarted] = useState(false);

  const topics = [
    "Should homework be banned?",
    "Is social media good for teens?",
    "Should AI replace teachers?",
    "Custom topic",
  ];

  const availableCards = ["Logic", "Stats", "Emotion", "Ethics"];

  const debateTopic = selectedTopic === "Custom topic" && customTopic ? customTopic : selectedTopic;

  const addCard = (card: string) => {
    if (argumentCards.length < 3 && !argumentCards.includes(card)) {
      setArgumentCards([...argumentCards, card]);
    }
  };

  const startDuel = () => {
    if (selectedTopic && stance && argumentCards.length > 0) {
      setDuelStarted(true);
    } else {
      alert("Choose a topic, stance, and at least one argument card!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center">
      {/* Title */}
      <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-10 animate-pulse">
        Debate Duel Arena
      </h1>

      {!duelStarted ? (
        <div className="w-full max-w-3xl space-y-8">
          {/* Topic Spinner */}
          <div className="relative">
            <label className="text-2xl font-bold text-blue-300 mb-4 block">Select Your Arena</label>
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
            {selectedTopic === "Custom topic" && (
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
            <label className="text-2xl font-bold text-blue-300 mb-4 block">Pick Your Side</label>
            <div className="flex gap-6 justify-center">
              <button
                onClick={() => setStance("For")}
                className={`px-8 py-4 rounded-full text-xl font-bold transition-all duration-300 ${
                  stance === "For"
                    ? "bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.7)]"
                    : "bg-gray-700 hover:bg-blue-500 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                }`}
              >
                For
              </button>
              <button
                onClick={() => setStance("Against")}
                className={`px-8 py-4 rounded-full text-xl font-bold transition-all duration-300 ${
                  stance === "Against"
                    ? "bg-pink-600 shadow-[0_0_15px_rgba(236,72,153,0.7)]"
                    : "bg-gray-700 hover:bg-pink-500 hover:shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                }`}
              >
                Against
              </button>
            </div>
          </div>

          {/* Argument Card Builder */}
          <div>
            <label className="text-2xl font-bold text-blue-300 mb-4 block">Build Your Argument</label>
            <div className="flex flex-wrap gap-4">
              {availableCards.map((card) => (
                <button
                  key={card}
                  onClick={() => addCard(card)}
                  disabled={argumentCards.includes(card)}
                  className={`px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg shadow-lg hover:scale-105 transition-all duration-300 ${
                    argumentCards.includes(card) ? "opacity-50 cursor-not-allowed" : "hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]"
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
        </div>
      ) : (
        <div className="w-full max-w-4xl animate-fade-in">
          {/* Duel Arena */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User Side */}
            <div className="p-6 bg-gray-800 rounded-xl border-4 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.5)] transform hover:rotate-2 transition-all duration-300">
              <h2 className="text-3xl font-bold text-blue-400 mb-4">Your Strike</h2>
              <p className="text-lg">{debateTopic}</p>
              <p className="text-xl text-blue-300">{stance}</p>
              <div className="mt-4 flex gap-2">
                {argumentCards.map((card) => (
                  <span key={card} className="px-3 py-1 bg-blue-600 rounded-full text-sm">
                    {card}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Side */}
            <div className="p-6 bg-gray-800 rounded-xl border-4 border-pink-500 shadow-[0_0_25px_rgba(236,72,153,0.5)] transform hover:-rotate-2 transition-all duration-300">
              <h2 className="text-3xl font-bold text-pink-400 mb-4">AI Counter-Strike</h2>
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-spin-slow shadow-[0_0_30px_rgba(236,72,153,0.7)]"></div>
              <p className="text-lg mt-4">[AI response loading...]</p>
            </div>
          </div>

          {/* Holographic Scorecard */}
          <div className="mt-8 p-6 bg-gray-800 rounded-xl border-4 border-purple-500 shadow-[0_0_25px_rgba(139,92,246,0.5)] animate-slide-up">
            <h2 className="text-3xl font-bold text-purple-400 mb-4">Debate Power</h2>
            <p className="text-lg">[Scorecard coming soon!]</p>
          </div>
        </div>
      )}
    </div>
  );
}