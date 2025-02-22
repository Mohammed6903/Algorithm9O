"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface QuizSubmission {
  id: string
  studentId: string
  score: number | null
  submittedAt: string
}

interface QuizSubmissionsProps {
  quizId: string
}

export default function QuizSubmissions({ quizId }: QuizSubmissionsProps) {
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([])

  useEffect(() => {
    // Fetch submissions for the given quizId
    // This is a placeholder and should be replaced with actual API call
    const fetchSubmissions = async () => {
      // const response = await fetch(`/api/quizzes/${quizId}/submissions`)
      // const data = await response.json()
      // setSubmissions(data)

      // Placeholder data
      setSubmissions([
        { id: "1", studentId: "student1", score: 85, submittedAt: "2023-06-01T11:30:00Z" },
        { id: "2", studentId: "student2", score: 92, submittedAt: "2023-06-01T11:45:00Z" },
      ])
    }

    fetchSubmissions()
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Quiz Submissions</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student ID</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Submitted At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell>{submission.studentId}</TableCell>
              <TableCell>{submission.score !== null ? `${submission.score}%` : "Not graded"}</TableCell>
              <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}