"use client"
import { useForm, useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/Textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface QuizFormData {
  title: string
  description: string
  durationMinutes: number
  isAiGenerated: boolean
  questions: {
    questionText: string
    questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER"
    correctAnswer: string
    options: string[]
    points: number
    topicId: string
    difficulty: number
  }[]
}

export default function QuizCreator() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<QuizFormData>({
    defaultValues: {
      questions: [
        {
          questionText: "",
          questionType: "MULTIPLE_CHOICE",
          correctAnswer: "",
          options: ["", "", "", ""],
          points: 1,
          topicId: "",
          difficulty: 1,
        },
      ],
    },
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  })

  const onSubmit = (data: QuizFormData) => {
    console.log(data)
    // Here you would typically send this data to your API
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Create Quiz</h2>

      <div>
        <Label htmlFor="title">Quiz Title</Label>
        <Input id="title" {...register("title", { required: "Title is required" })} />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} />
      </div>

      <div>
        <Label htmlFor="durationMinutes">Duration (minutes)</Label>
        <Input id="durationMinutes" type="number" {...register("durationMinutes", { valueAsNumber: true })} />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="isAiGenerated" {...register("isAiGenerated")} />
        <Label htmlFor="isAiGenerated">AI Generated</Label>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Questions</h3>
        {fields.map((field, index) => (
          <div key={field.id} className="border p-4 mb-4 rounded">
            <Label htmlFor={`questions.${index}.questionText`}>Question Text</Label>
            <Input
              id={`questions.${index}.questionText`}
              {...register(`questions.${index}.questionText` as const, { required: "Question text is required" })}
            />

            <Label htmlFor={`questions.${index}.questionType`}>Question Type</Label>
            <Select
              onValueChange={(value) =>
                register(`questions.${index}.questionType` as const).onChange({ target: { value } })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
              </SelectContent>
            </Select>

            <Label htmlFor={`questions.${index}.correctAnswer`}>Correct Answer</Label>
            <Input
              id={`questions.${index}.correctAnswer`}
              {...register(`questions.${index}.correctAnswer` as const, { required: "Correct answer is required" })}
            />

            <Label htmlFor={`questions.${index}.points`}>Points</Label>
            <Input
              id={`questions.${index}.points`}
              type="number"
              {...register(`questions.${index}.points` as const, { valueAsNumber: true })}
            />

            <Label htmlFor={`questions.${index}.topicId`}>Topic ID</Label>
            <Input id={`questions.${index}.topicId`} {...register(`questions.${index}.topicId` as const)} />

            <Label htmlFor={`questions.${index}.difficulty`}>Difficulty</Label>
            <Input
              id={`questions.${index}.difficulty`}
              type="number"
              {...register(`questions.${index}.difficulty` as const, { valueAsNumber: true })}
            />

            <Button type="button" onClick={() => remove(index)} className="mt-2">
              Remove Question
            </Button>
          </div>
        ))}
        <Button
          type="button"
          onClick={() =>
            append({
              questionText: "",
              questionType: "MULTIPLE_CHOICE",
              correctAnswer: "",
              options: ["", "", "", ""],
              points: 1,
              topicId: "",
              difficulty: 1,
            })
          }
        >
          Add Question
        </Button>
      </div>

      <Button type="submit">Create Quiz</Button>
    </form>
  )
}