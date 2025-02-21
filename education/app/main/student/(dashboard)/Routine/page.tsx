"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Type Definitions
interface FormData {
  age: string;
  sleepTime: string;
  wakeTime: string;
  studyHours: string;
  exerciseTime: string;
  subjects: string;
}

interface Recommendation {
  morning_routine: string;
  study_plan: { [subject: string]: string };
  exercise: string;
  evening_routine: string;
  productivity_tips: string;
}

interface ChartDataPoint {
  time: string;
  productivity: number;
  energy: number;
}

interface RoutineResponse {
  task_id: string;
  status: string;
  message: string;
}

const initialFormData: FormData = {
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
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Handle input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Poll task status
  const pollTaskStatus = async (taskId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/routine-result/${taskId}`);
      if (response.status === 200) { // Completed
        const data: Recommendation = await response.json();
        setRecommendation(data);
        setChartData(generateChartData(data)); // Generate chart data based on routine
        setStatus('completed');
      } else if (response.status === 500) { // Failed
        const errorData = await response.json();
        setStatus('error');
        setErrorMessage(errorData.detail);
      } else { // Still processing (202)
        setTimeout(() => pollTaskStatus(taskId), 2000);
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Error polling routine result');
    }
  };

  // Generate chart data based on routine (simplified example)
  const generateChartData = (routine: Recommendation): ChartDataPoint[] => {
    // This is a placeholder; adjust based on actual routine data
    return [
      { time: 'Morning', productivity: 85, energy: 90 },
      { time: 'Noon', productivity: 95, energy: 85 },
      { time: 'Afternoon', productivity: 75, energy: 70 },
      { time: 'Evening', productivity: 65, energy: 60 },
    ];
  };

  // Submit form and generate routine
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    setErrorMessage('');
    setRecommendation(null);
    setChartData([]);

    // Validate inputs
    if (!formData.age || !formData.sleepTime || !formData.wakeTime || !formData.studyHours || !formData.exerciseTime || !formData.subjects) {
      setStatus('error');
      setErrorMessage('All fields are required');
      return;
    }

    const requestData = {
      age: parseInt(formData.age),
      sleep_time: formData.sleepTime,
      wake_time: formData.wakeTime,
      study_hours: parseFloat(formData.studyHours),
      exercise_time: parseFloat(formData.exerciseTime),
      subjects: formData.subjects,
    };

    try {
      const response = await fetch('http://localhost:8000/generate-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) throw new Error('Failed to generate routine');
      const data: RoutineResponse = await response.json();
      setTaskId(data.task_id);
      pollTaskStatus(data.task_id);
    } catch (error) {
      setStatus('error');
      setErrorMessage('Error submitting routine request');
    }
  };

  return (
    <div className="flex p-6 gap-6">
      {/* Left side - Form */}
      <div className="w-1/2 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Student Information</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {status === 'error' && (
            <div className="p-2 bg-red-100 text-red-700 rounded">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block mb-1">Age:</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
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
              required
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
              required
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
              step="0.5"
              required
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
              required
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
              placeholder="e.g., Mathematics, Science"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:bg-gray-400"
            disabled={status === 'processing'}
          >
            {status === 'processing' ? 'Generating...' : 'Generate Recommendation'}
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
              <p>{recommendation.morning_routine}</p>
              <div>
                <h4 className="font-medium">Study Plan:</h4>
                <ul className="list-disc pl-6">
                  {Object.entries(recommendation.study_plan).map(([subject, schedule]) => (
                    <li key={subject}>{`${subject}: ${schedule}`}</li>
                  ))}
                </ul>
              </div>
              <p>{recommendation.exercise}</p>
              <p>{recommendation.evening_routine}</p>
              <p><strong>Productivity Tips:</strong> {recommendation.productivity_tips}</p>
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
          <p className="text-gray-500">
            Fill in your information and click generate to see recommendations
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentRoutineGenerator;