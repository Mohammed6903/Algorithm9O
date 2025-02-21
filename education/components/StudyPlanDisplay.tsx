import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BookOpen, Clock, AlertCircle, CheckCircle, BookmarkPlus, Brain, FileText } from 'lucide-react';

// Define types for the materials structure
interface SelfAssessment {
  question: string;
  concept_tested: string;
  difficulty: string;
}

interface RecommendedMaterial {
  filename: string;
  relevance_score: number;
  key_concepts: string[];
  study_approach: string;
  time_allocation: string;
  practice_exercises: string[];
  common_pitfalls: string[];
}

interface RevisionStrategy {
  priority_topics: string[];
  practice_focus: string;
  time_management: string;
}

interface Module {
  name: string;
  recommended_materials: RecommendedMaterial[];
  revision_strategy?: RevisionStrategy;
  self_assessment?: SelfAssessment[];
}

interface StudyGuide {
  modules: Module[];
  overall_preparation_tips: {
    category: string;
    recommendations: string[];
  }[];
  exam_day_guidelines: {
    phase: string;
    tips: string[];
  }[];
}

interface StudyPlanDisplayProps {
  materials: {
    study_guide?: StudyGuide;
  };
}

const StudyPlanDisplay: React.FC<StudyPlanDisplayProps> = ({ materials }) => {
  if (!materials || !materials.study_guide) {
    return null;
  }

  const { modules, overall_preparation_tips, exam_day_guidelines } = materials.study_guide;

  return (
    <div className="space-y-6">
      {/* Module Cards */}
      {modules.map((module, moduleIndex) => (
        <Card key={moduleIndex} className="bg-white">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="text-blue-600" />
              <span className="text-xl font-bold text-blue-800">{module.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Learning Materials */}
            {module.recommended_materials.map((material, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-blue-700">
                  <FileText size={20} />
                  {material.filename}
                  <span className="ml-auto text-sm bg-blue-100 px-2 py-1 rounded">
                    Score: {material.relevance_score}/10
                  </span>
                </div>

                {/* Key Concepts */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-medium text-gray-700">
                    <Brain size={18} />
                    Key Concepts:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {material.key_concepts.map((concept, i) => (
                      <span key={i} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Study Approach */}
                <div className="flex items-start gap-2">
                  <BookmarkPlus size={18} className="text-green-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-700">Study Approach</div>
                    <div className="text-gray-600">{material.study_approach}</div>
                  </div>
                </div>

                {/* Time Allocation */}
                <div className="flex items-start gap-2">
                  <Clock size={18} className="text-orange-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-700">Time Allocation</div>
                    <div className="text-gray-600">{material.time_allocation}</div>
                  </div>
                </div>

                {/* Practice Exercises */}
                <div className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-blue-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-700">Practice Exercises</div>
                    <ul className="list-disc list-inside text-gray-600 ml-2">
                      {material.practice_exercises.map((exercise, i) => (
                        <li key={i}>{exercise}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Common Pitfalls */}
                <div className="flex items-start gap-2">
                  <AlertCircle size={18} className="text-red-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-700">Common Pitfalls</div>
                    <ul className="list-disc list-inside text-gray-600 ml-2">
                      {material.common_pitfalls.map((pitfall, i) => (
                        <li key={i}>{pitfall}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}

            {/* Revision Strategy */}
            {module.revision_strategy && (
              <Card className="bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-800">Revision Strategy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="font-medium">Priority Topics:</div>
                    <ul className="list-disc list-inside ml-4">
                      {module.revision_strategy.priority_topics.map((topic, i) => (
                        <li key={i}>{topic}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium">Practice Focus:</div>
                    <p>{module.revision_strategy.practice_focus}</p>
                  </div>
                  <div>
                    <div className="font-medium">Time Management:</div>
                    <p>{module.revision_strategy.time_management}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Self Assessment */}
            {module.self_assessment && (
              <Card className="bg-green-50">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">Self Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  {module.self_assessment.map((assessment, i) => (
                    <div key={i} className="mb-4 p-4 bg-white rounded-lg">
                      <div className="font-medium">Q: {assessment.question}</div>
                      <div className="text-sm text-gray-600 mt-2">
                        Concept: {assessment.concept_tested} | Difficulty: {assessment.difficulty}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Overall Preparation Tips */}
      {overall_preparation_tips && (
        <Card className="bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-800">Overall Preparation Tips</CardTitle>
          </CardHeader>
          <CardContent>
            {overall_preparation_tips.map((tip, i) => (
              <div key={i} className="mb-4">
                <div className="font-medium text-purple-700">{tip.category}</div>
                <ul className="list-disc list-inside ml-4">
                  {tip.recommendations.map((rec, j) => (
                    <li key={j} className="text-gray-700">{rec}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Exam Day Guidelines */}
      {exam_day_guidelines && (
        <Card className="bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">Exam Day Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            {exam_day_guidelines.map((guideline, i) => (
              <div key={i} className="mb-4">
                <div className="font-medium text-orange-700">{guideline.phase}</div>
                <ul className="list-disc list-inside ml-4">
                  {guideline.tips.map((tip, j) => (
                    <li key={j} className="text-gray-700">{tip}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudyPlanDisplay;
