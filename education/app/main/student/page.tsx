import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Video, Calendar, Award, ArrowUp, ArrowDown } from "lucide-react";

const StudentDashboard = () => {
  // Mock data - in real app, this would come from API
  const progressData = {
    completedLessons: 24,
    totalLessons: 36,
    attendance: 85,
    upcomingTests: 3,
    performance: 78,
    recentGrades: [85, 92, 76, 88, 90]
  };

  // Custom progress ring component
  interface ProgressRingProps {
    progress: number;  // Define 'progress' as a number
    size?: number;     // Optional prop with default value
    strokeWidth?: number; // Optional prop with default value
  }
  
  const ProgressRing: React.FC<ProgressRingProps> = ({ progress, size = 120, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#3b82f6"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <text
          x="50%"
          y="50%"
          dy=".3em"
          textAnchor="middle"
          className="text-2xl font-bold fill-current"
          transform={`rotate(90 ${size / 2} ${size / 2})`}
        >
          {progress}%
        </text>
      </svg>
    );
  };

  // Simple line graph using SVG
  interface SimpleLineGraphProps {
    data: number[]; // Define 'data' as an array of numbers
    height?: number; // Optional prop with default value
    width?: number; // Optional prop with default value
  }
  
  const SimpleLineGraph: React.FC<SimpleLineGraphProps> = ({ data, height = 60, width = 200 }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / (max - min)) * height;
      return `${x},${y}`;
    }).join(' ');
  
    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          className="drop-shadow-md"
        />
      </svg>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span className="text-sm text-gray-600">October 2024</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed Lessons</p>
                <p className="text-2xl font-bold">{progressData.completedLessons}/{progressData.totalLessons}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
                <p className="text-2xl font-bold">{progressData.attendance}%</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Video className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Upcoming Tests</p>
                <p className="text-2xl font-bold">{progressData.upcomingTests}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Performance</p>
                <p className="text-2xl font-bold">{progressData.performance}%</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ProgressRing progress={Math.round((progressData.completedLessons / progressData.totalLessons) * 100)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[120px] flex items-center justify-center">
              <SimpleLineGraph data={progressData.recentGrades} width={300} height={100} />
            </div>
            <div className="mt-4 flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-gray-600">Highest: {Math.max(...progressData.recentGrades)}%</span>
              </div>
              <div className="flex items-center">
                <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm text-gray-600">Lowest: {Math.min(...progressData.recentGrades)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;