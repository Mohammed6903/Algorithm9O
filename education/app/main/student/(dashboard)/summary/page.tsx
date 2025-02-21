'use client'

import React, { useState } from 'react';
import IntegratedExamForm from '@/components/ClassroomForm';
import { FilePage } from '@/components/Class';
import StudyPlanDisplay from '@/components/StudyPlanDisplay';

interface FileData {
  filename: string;
  size: string;
  type: string;
  description: string;
  date_added: string;
  topics: string[];
}

const App = () => {
  // File management state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [topics, setTopics] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [aiResponse, setAiResponse] = useState('Upload a file to see AI analysis');
  const [isDragging, setIsDragging] = useState(false);

  // Materials state for exam form
  const [materials, setMaterials] = useState(null);

  // Handler for updating materials from exam form
  const handleMaterialsUpdate = (newMaterials: any) => {
    setMaterials(newMaterials);
    setAiResponse(JSON.stringify(newMaterials, null, 2));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-[1920px]">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-800">Exam Preparation Assistant</h1>
          <p className="text-gray-600 mt-2">
            Enter your exam details and upload study materials for AI-powered analysis
          </p>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left column - Exam Form */}
          <div className="xl:col-span-5 bg-white rounded-xl shadow-sm">
            <IntegratedExamForm onMaterialsUpdate={handleMaterialsUpdate} files={files}/>
          </div>

          {/* Right column - File Management */}
          <div className="xl:col-span-7 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="h-full">
              <FilePage
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                description={description}
                setDescription={setDescription}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                files={files}
                setFiles={setFiles}
                aiResponse={aiResponse}
                setAiResponse={setAiResponse}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
                topics={topics}
                setTopics={setTopics}
              />
            </div>
          </div>
        </div>

        {/* Results section */}
        {materials && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <StudyPlanDisplay materials={JSON.parse(JSON.stringify(materials, null, 2))} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;