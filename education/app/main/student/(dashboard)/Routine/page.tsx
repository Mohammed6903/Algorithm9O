"use client"
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

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

const initialFormData: FormData = {
  age: '',
  sleepTime: '',
  wakeTime: '',
  studyHours: '',
  exerciseTime: '',
  subjects: '',
};

// More realistic chart data based on typical student performance patterns
const generateDetailedChartData = (wakeTime: string, studyHours: number) => {
  const wakeHour = parseInt(wakeTime.split(':')[0]);
  const points = [];
  
  // Generate 24 data points for a full day
  for (let i = 0; i < 24; i++) {
    const hour = (wakeHour + i) % 24;
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    
    // Model natural energy and productivity patterns
    let energy = Math.sin((i / 24) * Math.PI * 2) * 20 + 70; // Base circadian rhythm
    let productivity = energy;
    
    // Morning boost
    if (i >= 1 && i <= 4) {
      energy += 15;
      productivity += 20;
    }
    
    // Post-lunch dip
    if (i >= 6 && i <= 8) {
      energy -= 10;
      productivity -= 15;
    }
    
    // Afternoon recovery
    if (i >= 9 && i <= 12) {
      energy += 5;
      productivity += 10;
    }
    
    // Evening decline
    if (i >= 14) {
      energy -= (i - 14) * 2;
      productivity -= (i - 14) * 2.5;
    }
    
    // Add some natural variation
    energy += Math.random() * 5 - 2.5;
    productivity += Math.random() * 5 - 2.5;
    
    // Clamp values
    energy = Math.min(Math.max(energy, 0), 100);
    productivity = Math.min(Math.max(productivity, 0), 100);
    
    points.push({
      time: timeStr,
      productivity: Math.round(productivity),
      energy: Math.round(energy)
    });
  }
  
  return points;
};

const StudentRoutineGenerator: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    
    // Simulate API call
    setTimeout(() => {
      const sampleRecommendation: Recommendation = {
        morning_routine: "Start your day with 10 minutes of meditation followed by a light breakfast.",
        study_plan: {
          "Mathematics": "8:00 AM - 9:30 AM",
          "Science": "10:00 AM - 11:30 AM",
          "Language": "2:00 PM - 3:30 PM"
        },
        exercise: "30 minutes of moderate cardio at 4:00 PM",
        evening_routine: "Review daily materials and prepare for next day before sleep at 10:00 PM",
        productivity_tips: "Use the Pomodoro technique: 25 minutes of focused study followed by 5-minute breaks"
      };
      
      setRecommendation(sampleRecommendation);
      setChartData(generateDetailedChartData(formData.wakeTime, parseFloat(formData.studyHours)));
      setStatus('completed');
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {status === 'error' && (
              <Alert variant="warning">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Sleep Time</label>
                <input
                  type="time"
                  name="sleepTime"
                  value={formData.sleepTime}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Wake Time</label>
                <input
                  type="time"
                  name="wakeTime"
                  value={formData.wakeTime}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Study Hours (per day)</label>
              <input
                type="number"
                name="studyHours"
                value={formData.studyHours}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                step="0.5"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Exercise Time (minutes)</label>
              <input
                type="number"
                name="exerciseTime"
                value={formData.exerciseTime}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Subjects</label>
              <input
                type="text"
                name="subjects"
                value={formData.subjects}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Mathematics, Science"
                required
              />
            </div>

            <button
              type="submit"
              disabled={status === 'processing'}
              className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center gap-2"
            >
              {status === 'processing' ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Generating...
                </>
              ) : (
                'Generate Recommendation'
              )}
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Your Personalized Routine</CardTitle>
        </CardHeader>
        <CardContent>
          {recommendation ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-700">Daily Schedule</h3>
                <p className="text-gray-600">{recommendation.morning_routine}</p>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Study Plan:</h4>
                  <ul className="space-y-2">
                    {Object.entries(recommendation.study_plan).map(([subject, schedule]) => (
                      <li key={subject} className="text-gray-600">
                        <span className="font-medium">{subject}:</span> {schedule}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <p className="text-gray-600">{recommendation.exercise}</p>
                <p className="text-gray-600">{recommendation.evening_routine}</p>
                <p className="text-gray-600">
                  <strong>Productivity Tips:</strong> {recommendation.productivity_tips}
                </p>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Daily Performance Metrics</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#6b7280"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => value.substring(0, 5)}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        tick={{ fontSize: 12 }}
                        domain={[0, 100]}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px'
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="productivity"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={false}
                        name="Productivity"
                      />
                      <Line
                        type="monotone"
                        dataKey="energy"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                        name="Energy Level"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Fill in your information and click generate to see recommendations
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentRoutineGenerator;