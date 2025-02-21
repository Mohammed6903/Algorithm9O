import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Module {
  name: string;
  weight: string;
  objectives: string[];
}

interface ExamPrepRequest {
  syllabus: {
    course_name: string;
    exam_type: string;
    exam_date: string;
    duration: string;
    format: string;
    modules: {
      [key: string]: {
        weight: string;
        objectives: string[];
      };
    };
  };
  course_materials: Array<{
    name: string;
    size: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

interface IntegratedExamFormProps {
  onMaterialsUpdate: (materials: any) => void;
  files: any;
}

const IntegratedExamForm: React.FC<IntegratedExamFormProps> = ({
  onMaterialsUpdate,
  files
}) => {
  const [formData, setFormData] = useState({
    courseName: '',
    examType: '',
    examDate: '',
    duration: '',
    format: '',
    modules: [{ name: '', weight: '', objectives: [''] }],
  });

  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<
    'idle' | 'processing' | 'completed' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleModuleChange = (
    moduleIndex: number,
    field: 'name' | 'weight',
    value: string
  ) => {
    const newModules = [...formData.modules];
    if (field === 'weight') {
      // Only allow numbers and empty string
      const numericValue = value.replace(/[^\d]/g, '');
      // Prevent values over 100
      const finalValue = numericValue === '' ? '' : 
        Math.min(parseInt(numericValue) || 0, 100).toString();
      newModules[moduleIndex][field] = finalValue;
    } else {
      newModules[moduleIndex][field] = value;
    }

    setFormData((prev) => ({
      ...prev,
      modules: newModules,
    }));
  };

  const handleObjectiveChange = (
    moduleIndex: number,
    objectiveIndex: number,
    value: string
  ) => {
    const newModules = [...formData.modules];
    newModules[moduleIndex].objectives[objectiveIndex] = value;
    setFormData((prev) => ({
      ...prev,
      modules: newModules,
    }));
  };

  const addModule = () => {
    setFormData((prev) => ({
      ...prev,
      modules: [...prev.modules, { name: '', weight: '', objectives: [''] }],
    }));
  };

  const removeModule = (moduleIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, index) => index !== moduleIndex),
    }));
  };

  const addObjective = (moduleIndex: number) => {
    const newModules = [...formData.modules];
    newModules[moduleIndex].objectives.push('');
    setFormData((prev) => ({
      ...prev,
      modules: newModules,
    }));
  };

  const removeObjective = (moduleIndex: number, objectiveIndex: number) => {
    const newModules = [...formData.modules];
    newModules[moduleIndex].objectives = newModules[moduleIndex].objectives.filter(
      (_, index) => index !== objectiveIndex
    );
    setFormData((prev) => ({
      ...prev,
      modules: newModules,
    }));
  };

  const fetchResults = async (taskId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/assistance-result/${taskId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      const data = await response.json();
      setResult(data);
      onMaterialsUpdate(data);
      setStatus('completed');
    } catch (error) {
      setStatus('error');
      setErrorMessage('Error fetching results');
    }
  };


  const pollTaskStatus = async (taskId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/status/${taskId}`);
      const data = await response.json();

      if (data.status === 'completed') {
        await fetchResults(taskId);
      } else if (data.status === 'failed') {
        setStatus('error');
        setErrorMessage(data.error);
      } else {
        setTimeout(() => pollTaskStatus(taskId), 5000);
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Error checking task status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    setErrorMessage('');

    const requestData: ExamPrepRequest = {
      syllabus: {
        course_name: formData.courseName,
        exam_type: formData.examType,
        exam_date: formData.examDate,
        duration: formData.duration,
        format: formData.format,
        modules: formData.modules.reduce(
          (acc, module) => ({
            ...acc,
            [module.name]: {
              weight: module.weight,
              objectives: module.objectives,
            },
          }),
          {}
        ),
      },
      course_materials: files,
    };

    try {
      const response = await fetch('http://localhost:8000/get-prep-assistance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      setTaskId(data.task_id);
      pollTaskStatus(data.task_id);
    } catch (error) {
      setStatus('error');
      setErrorMessage('Error submitting form');
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Course Exam Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {status === 'error' && (
            <Alert variant="error">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="courseName">Course Name</Label>
            <Input
              id="courseName"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="examType">Exam Type</Label>
            <Input
              id="examType"
              name="examType"
              type="text"
              value={formData.examType}
              onChange={handleChange}
              className="w-full"
              required
              placeholder="Enter exam type"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="examDate">Exam Date</Label>
            <Input
              id="examDate"
              name="examDate"
              type="text"
              value={formData.examDate}
              onChange={handleChange}
              className="w-full"
              required
              placeholder="Enter exam date"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              name="duration"
              type="text"
              value={formData.duration}
              onChange={handleChange}
              className="w-full"
              required
              placeholder="Enter duration"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Format</Label>
            <Input
              id="format"
              name="format"
              type="text"
              value={formData.format}
              onChange={handleChange}
              className="w-full"
              required
              placeholder="Enter format"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Modules</Label>
              <Button type="button" onClick={addModule} className="flex items-center">
                <Plus className="w-4 h-4 mr-1" />
                Add Module
              </Button>
            </div>

            {formData.modules.map((module, moduleIndex) => (
              <div key={moduleIndex} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Module Name"
                    value={module.name}
                    onChange={(e) => handleModuleChange(moduleIndex, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="text"
                    placeholder="Weight (%)"
                    value={module.weight}
                    onChange={(e) => handleModuleChange(moduleIndex, 'weight', e.target.value)}
                    className="w-24"
                  />
                  <Button 
                    type="button"
                    variant="destructive"
                    onClick={() => removeModule(moduleIndex)}
                    className="flex items-center"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Objectives</Label>
                    <Button
                      type="button"
                      onClick={() => addObjective(moduleIndex)}
                      className="flex items-center"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Objective
                    </Button>
                  </div>

                  {module.objectives.map((objective, objectiveIndex) => (
                    <div key={objectiveIndex} className="flex items-center space-x-2">
                      <Input
                        type="text"
                        placeholder="Enter objective"
                        value={objective}
                        onChange={(e) => handleObjectiveChange(moduleIndex, objectiveIndex, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeObjective(moduleIndex, objectiveIndex)}
                        size="sm"
                        className="flex items-center"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={status === 'processing'}
          >
            {status === 'processing' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : 'Generate Study Guide'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default IntegratedExamForm;