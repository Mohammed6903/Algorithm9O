import React from 'react';
import { Video, PlusCircle, Users } from 'lucide-react';

const ClassManagement: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center space-y-8 p-8 max-w-md w-full bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800">Classroom Hub</h1>
        <p className="text-gray-600">Easily manage and join your live classes</p>

        {/* Buttons for Creating and Joining Classes */}
        <div className="space-y-4">
          <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold flex items-center justify-center hover:bg-blue-700 transition">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Class
          </button>
          <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold flex items-center justify-center hover:bg-green-700 transition">
            <Users className="mr-2 h-5 w-5" />
            Scheduled Class
          </button>
        </div>

        {/* Live Classes Section */}
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center justify-center">
            <Video className="mr-2 h-5 w-5 text-red-500" />
            Live Classes
          </h2>
          <p className="text-gray-600">Engage with ongoing live sessions or plan for upcoming classes.</p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-red-600">Current Live: Introduction to AI</span>
              <button className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition">
                Join
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-red-600">Next Up: Data Science Basics</span>
              <button className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition">
                Set Reminder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassManagement;
