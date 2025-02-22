"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { addTopic, createSubject, getSubjects } from "@/app/actions/topicActions";

export default function ManageCurriculumPage() {
  const router = useRouter();

  // State for subject form
  const [subjectName, setSubjectName] = useState("");
  const [subjectLoading, setSubjectLoading] = useState(false);

  // State for chapter form
  const [topicName, setTopicName] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [sequenceNumber, setSequenceNumber] = useState<number | "">(1);
  const [topicLoading, setTopicLoading] = useState(false);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);

  // Fetch existing subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getSubjects();
        setSubjects(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load subjects");
      }
    };
    fetchSubjects();
  }, []);

  // Handle subject form submission
  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      toast.error("Subject name is required");
      return;
    }

    setSubjectLoading(true);
    try {
      const res = await createSubject(subjectName.trim());

      if (!res.name) throw new Error("Failed to add subject");
      setSubjects([...subjects, res]);
      setSubjectName("");
      toast.success("Subject added successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add subject: " + error);
    } finally {
      setSubjectLoading(false);
    }
  };

  // Handle chapter form submission
  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim() || !subjectId || sequenceNumber === "") {
      toast.error("All fields are required");
      return;
    }
    if (sequenceNumber < 0) {
      toast.error("Sequence number must be non-negative");
      return;
    }

    setTopicLoading(true);
    try {
      const topic = await addTopic(topicName.trim(), subjectId, Number(sequenceNumber));

      if (!topic.name) throw new Error("Failed to add chapter");
      setTopicName("");
      setSubjectId("");
      setSequenceNumber(0);
      toast.success("Chapter added successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add chapter");
    } finally {
      setTopicLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800">Manage Curriculum</h1>

      {/* Add Subject Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Add New Subject</h2>
        <form onSubmit={handleAddSubject} className="space-y-4">
          <div>
            <label htmlFor="subjectName" className="block text-sm font-medium text-gray-600">
              Subject Name
            </label>
            <input
              type="text"
              id="subjectName"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="e.g., Mathematics"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={subjectLoading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-blue-400"
            disabled={subjectLoading}
          >
            {subjectLoading ? "Adding..." : "Add Subject"}
          </button>
        </form>
      </div>

      {/* Add Chapter Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Add New Chapter</h2>
        <form onSubmit={handleAddTopic} className="space-y-4">
          <div>
            <label htmlFor="subjectId" className="block text-sm font-medium text-gray-600">
              Subject
            </label>
            <select
              id="subjectId"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={topicLoading || subjects.length === 0}
            >
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {subjects.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">No subjects available. Add a subject first.</p>
            )}
          </div>
          <div>
            <label htmlFor="topicName" className="block text-sm font-medium text-gray-600">
              Chapter Name
            </label>
            <input
              type="text"
              id="topicName"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="e.g., Sets"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={topicLoading}
            />
          </div>
          <div>
            <label htmlFor="sequenceNumber" className="block text-sm font-medium text-gray-600">
              Sequence Number
            </label>
            <input
              type="number"
              id="sequenceNumber"
              value={sequenceNumber}
              onChange={(e) => setSequenceNumber(e.target.value === "" ? "" : Number(e.target.value))}
              min="0"
              placeholder="e.g., 1"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={topicLoading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Order of the chapter within the subject (e.g., 1 for first chapter).
            </p>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-blue-400"
            disabled={topicLoading}
          >
            {topicLoading ? "Adding..." : "Add Chapter"}
          </button>
        </form>
      </div>
    </div>
  );
}