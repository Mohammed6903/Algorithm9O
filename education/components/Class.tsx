"use client";

import React, { useState } from 'react';
import { Upload, X, FileText, Clock, HardDrive } from 'lucide-react';

interface FileData {
  filename: string;
  size: string;
  type: string;
  description: string;
  date_added: string;
  topics: string[];
}

interface FilePageProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  description: string;
  setDescription: (desc: string) => void;
  selectedFile: File | null;
  topics: string;
  setTopics: (topics: string) => void
  setSelectedFile: (file: File | null) => void;
  files: FileData[];
  setFiles: (files: FileData[]) => void;
  aiResponse: string;
  setAiResponse: (response: string) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

export const FilePage: React.FC<FilePageProps> = ({
  isModalOpen,
  setIsModalOpen,
  description,
  setDescription,
  selectedFile,
  setSelectedFile,
  files,
  setFiles,
  aiResponse,
  setAiResponse,
  isDragging,
  setIsDragging,
  topics,
  setTopics,
}) => {

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const typeMap: { [key: string]: string } = {
      'pdf': 'PDF Document',
      'doc': 'Word Document',
      'docx': 'Word Document',
      'txt': 'Text File',
      'rtf': 'Rich Text File',
      'xlsx': 'Excel Spreadsheet',
      'xls': 'Excel Spreadsheet',
      'csv': 'CSV File',
      'ppt': 'PowerPoint',
      'pptx': 'PowerPoint',
      'jpg': 'Image',
      'jpeg': 'Image',
      'png': 'Image',
      'gif': 'Image'
    };
    return typeMap[extension] || 'Unknown Type';
  };

  const getFileTypeColor = (fileType: string): string => {
    const colorMap: { [key: string]: string } = {
      'PDF Document': 'text-red-600 bg-red-50',
      'Word Document': 'text-blue-600 bg-blue-50',
      'Text File': 'text-gray-600 bg-gray-50',
      'Excel Spreadsheet': 'text-green-600 bg-green-50',
      'PowerPoint': 'text-orange-600 bg-orange-50',
      'Image': 'text-purple-600 bg-purple-50',
      'Unknown Type': 'text-gray-600 bg-gray-50'
    };
    return colorMap[fileType] || 'text-gray-600 bg-gray-50';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setSelectedFile(droppedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setSubmitError('Please select a file');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const newFile: FileData = {
        filename: selectedFile.name,
        size: formatFileSize(selectedFile.size),
        type: getFileType(selectedFile.name),
        description: description,
        date_added: new Date().toISOString(),
        topics: topics.split(',').map(topic => topic.trim()),
      };

      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));

      setFiles([...files, newFile]);
      setAiResponse(`Processing ${selectedFile.name}...\nAnalyzing content...`);
      
      // Reset form and close modal after successful submission
      setDescription('');
      setTopics('');
      setSelectedFile(null);
      setIsModalOpen(false);
    } catch (error) {
      setSubmitError('Error uploading file. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Section */}
      <div className=" p-3 flex flex-col w-11/12">
        {/* Header Strip */}
        <div className="flex justify-between items-center bg-white shadow-sm rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-800">File Manager</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <Upload className="w-2 h-2" />
            <span>Upload File</span>
          </button>
        </div>

        {/* Files Table */}
        <div className="bg-white rounded-xl shadow-sm flex-1 overflow-hidden">
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">File Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {files.map((file, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{file.filename}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFileTypeColor(file.type)}`}>
                          {file.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <HardDrive className="w-4 h-4 mr-2 text-gray-400" />
                          {file.size}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{file.description}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          {file.date_added}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      {/* <div className="w-1/2 p-6">
        <div className="bg-white rounded-xl shadow-sm h-full p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            AI Response
          </h2>
          <div className="whitespace-pre-wrap text-gray-700 bg-gray-50 rounded-lg p-4 min-h-[200px]">
            {aiResponse}
          </div>
        </div>
      </div> */}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Upload File</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {/* File Upload Area - same as before */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer mb-6 transition-all duration-200
                  ${isDragging 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isSubmitting && document.getElementById('fileInput')?.click()}
              >
                <input
                  id="fileInput"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                />
                <Upload className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                <div className="text-sm text-gray-600">
                  {selectedFile ? (
                    <div className="flex items-center justify-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>{selectedFile.name}</span>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-gray-800 mb-1">
                        Drag and drop your file here, or click to select
                      </p>
                      <p className="text-xs text-gray-500">
                        Supported files: PDF, DOC, TXT, XLS, PPT, Images
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y text-sm"
                  placeholder="Enter file description..."
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Topics Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topics
                </label>
                <textarea
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y text-sm"
                  placeholder="Enter topics covered in this reference file..."
                  disabled={isSubmitting}
                />
              </div>

              {/* Error Message */}
              {submitError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {submitError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedFile || isSubmitting}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200
                  ${isSubmitting 
                    ? 'bg-blue-400 cursor-wait'
                    : selectedFile 
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow' 
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  'Upload File'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};