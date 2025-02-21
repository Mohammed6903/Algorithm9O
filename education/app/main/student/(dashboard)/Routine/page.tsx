"use client";

import React, { useState, ChangeEvent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface FormData {
  name: string;
  age: string;
  sleepTime: string;
  wakeTime: string;
  studyHours: string;
  exerciseTime: string;
  subjects: string;
}

interface Recommendation {
  morningRoutine: string;
  studyPlan: string;
  exercise: string;
  eveningRoutine: string;
  subjects: string[];
}

interface ChartDataPoint {
  time: string;
  productivity: number;
  energy: number;
}

const initialFormData: FormData = {
  name: '',
  age: '',
  sleepTime: '',
  wakeTime: '',
  studyHours: '',
  exerciseTime: '',
  subjects: '',
};

const StudentRoutineGenerator: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const generateRecommendation = (): void => {
    const studyHours = parseInt(formData.studyHours);
    const exerciseTime = parseInt(formData.exerciseTime);
    
    const newRecommendation: Recommendation = {
      morningRoutine: `Wake up at ${formData.wakeTime}`,
      studyPlan: `Dedicate ${studyHours} hours to studying with breaks every 45 minutes`,
      exercise: `${exerciseTime} minutes of exercise at moderate intensity`,
      eveningRoutine: `Prepare for bed by ${formData.sleepTime}`,
      subjects: formData.subjects.split(',').map(subject => 
        `${subject.trim()}: ${Math.floor(studyHours / 3)} hours`
      )
    };

    const newChartData: ChartDataPoint[] = [
      { time: 'Morning', productivity: 85, energy: 90 },
      { time: 'Noon', productivity: 95, energy: 85 },
      { time: 'Afternoon', productivity: 75, energy: 70 },
      { time: 'Evening', productivity: 65, energy: 60 },
    ];

    setRecommendation(newRecommendation);
    setChartData(newChartData);
  };

  return (
    <div className="flex p-6 gap-6">
      {/* Left side - Form */}
      <div className="w-1/2 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Student Information</h2>
        <form className="space-y-4">
          <div>
            <label className="block mb-1">Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Age:</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Sleep Time:</label>
            <input
              type="time"
              name="sleepTime"
              value={formData.sleepTime}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Wake Time:</label>
            <input
              type="time"
              name="wakeTime"
              value={formData.wakeTime}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Study Hours (per day):</label>
            <input
              type="number"
              name="studyHours"
              value={formData.studyHours}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Exercise Time (minutes):</label>
            <input
              type="number"
              name="exerciseTime"
              value={formData.exerciseTime}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Subjects (comma-separated):</label>
            <input
              type="text"
              name="subjects"
              value={formData.subjects}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="button"
            onClick={generateRecommendation}
            className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
          >
            Generate Recommendation
          </button>
        </form>
      </div>

      {/* Right side - Recommendations */}
      <div className="w-1/2 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Your Personalized Routine</h2>
        {recommendation ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Daily Schedule</h3>
              <p>{recommendation.morningRoutine}</p>
              <p>{recommendation.studyPlan}</p>
              <p>{recommendation.exercise}</p>
              <p>{recommendation.eveningRoutine}</p>
              
              <h3 className="text-xl font-semibold mt-4">Subject Distribution</h3>
              <ul className="list-disc pl-6">
                {recommendation.subjects.map((subject, index) => (
                  <li key={index}>{subject}</li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Daily Performance Metrics</h3>
              <LineChart width={500} height={300} data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="productivity" 
                  stroke="#8884d8" 
                  name="Productivity" 
                />
                <Line 
                  type="monotone" 
                  dataKey="energy" 
                  stroke="#82ca9d" 
                  name="Energy Level" 
                />
              </LineChart>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Fill in your information and click generate to see recommendations</p>
        )}
      </div>
    </div>
  );
};

export default StudentRoutineGenerator;