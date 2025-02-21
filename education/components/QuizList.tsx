"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface Quiz {
  id: string
  title: string
  description: string | null
  durationMinutes: number | null
  isAiGenerated: boolean
  startTime: string | null
  endTime: string | null
}

interface QuizListProps {
  onQuizSelect: (quizId: string) => void
}

export default function QuizList({ onQuizSelect }: QuizListProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])

  useEffect(() => {
    // Fetch quizzes from API
    // This is a placeholder and should be replaced with actual API call
    const fetchQuizzes = async () => {
      // const response = await fetch('/api/quizzes')
      // const data = await response.json()
      // setQuizzes(data)

      // Placeholder data
      setQuizzes([
        {
          id: "1",
          title: "Math Quiz",
          description: "Basic arithmetic",
          durationMinutes: 30,
          isAiGenerated: false,
          startTime: "2023-06-01T10:00:00Z",
          endTime: "2023-06-01T10:30:00Z",
        },
        {
          id: "2",
          title: "Science Quiz",
          description: "General science",
          durationMinutes: 45,
          isAiGenerated: true,
          startTime: null,
          endTime: null,
        },
      ])
    }

    fetchQuizzes()
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Quiz List</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>AI Generated</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quizzes.map((quiz) => (
            <TableRow key={quiz.id}>
              <TableCell>{quiz.title}</TableCell>
              <TableCell>{quiz.description}</TableCell>
              <TableCell>{quiz.durationMinutes} minutes</TableCell>
              <TableCell>{quiz.isAiGenerated ? "Yes" : "No"}</TableCell>
              <TableCell>{quiz.startTime ? new Date(quiz.startTime).toLocaleString() : "Not set"}</TableCell>
              <TableCell>{quiz.endTime ? new Date(quiz.endTime).toLocaleString() : "Not set"}</TableCell>
              <TableCell>
                <Button onClick={() => onQuizSelect(quiz.id)}>View Submissions</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}