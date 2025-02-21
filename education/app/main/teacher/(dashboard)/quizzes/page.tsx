"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import QuizList from "@/components/QuizList"
import QuizCreator from "@/components/QuizCreator"
import QuizSubmissions from "@/components/QuizSubmission"

export default function QuizManagementPage() {
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null)

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Quiz Management</h1>
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Quiz List</TabsTrigger>
          <TabsTrigger value="create">Create Quiz</TabsTrigger>
          <TabsTrigger value="submissions" disabled={!activeQuizId}>
            View Submissions
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <QuizList onQuizSelect={setActiveQuizId} />
        </TabsContent>
        <TabsContent value="create">
          <QuizCreator />
        </TabsContent>
        <TabsContent value="submissions">{activeQuizId && <QuizSubmissions quizId={activeQuizId} />}</TabsContent>
      </Tabs>
    </div>
  )
}