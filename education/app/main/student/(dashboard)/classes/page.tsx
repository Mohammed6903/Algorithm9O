"use client";
import React, { useState, DragEvent, ChangeEvent } from 'react';
import { Upload, FileText, Video, AlertCircle, Clock, MessageSquare, Sparkles, Tag } from 'lucide-react';

interface AnalysisResult {
  title: string;
  duration: string;
  summary: string;
  keyPoints: string[];
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  topics: string[];
}

type TabType = 'video' | 'transcript';

const VideoAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('video');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    processFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File): void => {
    setError('');
    setIsProcessing(true);
    setResult(null);

    // Validate file type and size
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      setError('File size exceeds 500MB limit');
      setIsProcessing(false);
      return;
    }

    // Validate file type
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const validDocTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    const validTypes = activeTab === 'video' ? validVideoTypes : validDocTypes;
    if (!validTypes.includes(file.type)) {
      setError(`Invalid file type. Please upload a ${activeTab === 'video' ? 'video' : 'document'} file`);
      setIsProcessing(false);
      return;
    }

    // Simulate processing with timeout
    setTimeout(() => {
      setIsProcessing(false);
      setResult({
        title: "The Future of Renewable Energy",
        duration: "5:30",
        summary: "This comprehensive video explores cutting-edge developments in renewable energy technology and their practical applications in urban environments. The presentation covers breakthrough innovations in solar efficiency, integrated wind power solutions, and successful community adoption strategies.",
        keyPoints: [
          "Latest advancements in solar panel efficiency",
          "Urban wind power integration techniques",
          "Community-based renewable energy initiatives",
          "Cost-benefit analysis of implementation",
          "Future technology roadmap"
        ],
        sentiment: "Positive",
        topics: ["Clean Energy", "Urban Planning", "Innovation", "Sustainability"]
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Content Analysis Studio</h1>
          <p className="text-gray-600">Upload your video or transcript for in-depth analysis</p>
        </div>
        
        {/* Enhanced Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-1 mb-8">
          <div className="grid grid-cols-2 gap-1">
            {(['video', 'transcript'] as const).map((tab) => (
              <button
                key={tab}
                className={`flex items-center justify-center px-6 py-4 rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50 text-gray-600'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'video' ? (
                  <Video className={`mr-2 h-5 w-5 ${activeTab === tab ? 'text-blue-600' : 'text-gray-400'}`} />
                ) : (
                  <FileText className={`mr-2 h-5 w-5 ${activeTab === tab ? 'text-blue-600' : 'text-gray-400'}`} />
                )}
                <span className="font-medium">{tab === 'video' ? 'Video Analysis' : 'Transcript Analysis'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Area */}
        <div 
          className={`bg-white rounded-xl shadow-lg p-8 mb-8 transition-all ${
            isDragging ? 'border-2 border-blue-400 bg-blue-50' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={activeTab === 'video' ? "video/*" : ".txt,.doc,.docx,.pdf"}
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Drop your {activeTab === 'video' ? 'video' : 'transcript'} here
            </h3>
            <p className="text-gray-500 mb-4">or click to browse</p>
            <div className="px-4 py-2 bg-gray-50 rounded-full text-sm text-gray-500">
              {activeTab === 'video' ? 'MP4, WebM, MOV up to 500MB' : 'PDF, DOC, DOCX, TXT'}
            </div>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-8 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 mb-4">
                <div className="w-full h-full border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Analyzing your content</h3>
              <p className="text-gray-500">This might take a few moments...</p>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {result && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Title Section */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-blue-800 mb-2">{result.title}</h3>
                <div className="flex items-center text-blue-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{result.duration}</span>
                </div>
              </div>

              {/* Summary Section */}
              <div>
                <div className="flex items-center mb-4">
                  <MessageSquare className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">Summary</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{result.summary}</p>
              </div>

              {/* Key Points Section */}
              <div>
                <div className="flex items-center mb-4">
                  <Sparkles className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">Key Points</h3>
                </div>
                <div className="space-y-3">
                  {result.keyPoints.map((point, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="ml-3 text-gray-600">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topics Section */}
              <div>
                <div className="flex items-center mb-4">
                  <Tag className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">Main Topics</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.topics.map((topic, index) => (
                    <span 
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 rounded-full text-sm font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoAnalysis;