import json
from datetime import datetime
from typing import Dict, List
from ollama import AsyncClient

class ExamPrepAssistant:
    def __init__(self):
        self.model = 'llama3.2'
        self.client = AsyncClient()

    async def generate_study_guide(self, course_materials: List[Dict], syllabus: Dict) -> Dict:
        """Generate a comprehensive study guide based on course materials and syllabus."""
        prompt = self._construct_prompt(course_materials, syllabus)
        return await self._analyze_with_llm(prompt)

    def _construct_prompt(self, course_materials: List[Dict], syllabus: Dict) -> str:
        """Construct a detailed prompt for the LLM."""

        exam_details = (
            f"EXAM DETAILS:\n"
            f"Course: {syllabus.get('course_name', 'Computer Networks')}\n"
            f"Exam Type: {syllabus.get('exam_type', 'Final Exam')}\n"
            f"Date: {syllabus.get('exam_date', 'Upcoming')}\n"
            f"Current Date: {syllabus.get('current_date', str(datetime.now().date()))}\n"
            f"Duration: {syllabus.get('duration', '3 hours')}\n"
            f"Format: {syllabus.get('format', 'Written + Practical')}\n"
        )

        modules_info = self._format_modules(syllabus.get('modules', {}))
        materials_info = self._format_materials(course_materials)

        output_requirements = (
            "\nREQUIRED OUTPUT FORMAT:\n"
            "{\n"
            "    \"study_guide\": {\n"
            "        \"modules\": [\n"
            "            {\n"
            "                \"name\": \"Module Name\",\n"
            "                \"learning_objectives\": [\"obj1\", \"obj2\"],\n"
            "                \"recommended_materials\": [\n"
            "                    {\n"
            "                        \"filename\": \"material.pdf\",\n"
            "                        \"relevance_score\": 0-10,\n"
            "                        \"key_concepts\": [\"concept1\", \"concept2\"],\n"
            "                        \"study_approach\": \"Detailed study approach\",\n"
            "                        \"practice_exercises\": [\"exercise1\", \"exercise2\"],\n"
            "                        \"common_pitfalls\": [\"pitfall1\", \"pitfall2\"],\n"
            "                        \"time_allocation\": \"Recommended study time\"\n"
            "                    }\n"
            "                ],\n"
            "                \"revision_strategy\": {\n"
            "                    \"priority_topics\": [\"topic1\", \"topic2\"],\n"
            "                    \"practice_focus\": \"Areas needing hands-on practice\",\n"
            "                    \"time_management\": \"Time allocation strategy\"\n"
            "                },\n"
            "                \"self_assessment\": [\n"
            "                    {\n"
            "                        \"question\": \"Practice question\",\n"
            "                        \"concept_tested\": \"Core concept being tested\",\n"
            "                        \"difficulty\": \"Easy/Medium/Hard\"\n"
            "                    }\n"
            "                ]\n"
            "            }\n"
            "        ],\n"
            "        \"overall_preparation_tips\": [\n"
            "            {\n"
            "                \"category\": \"Time Management\",\n"
            "                \"recommendations\": [\"tip1\", \"tip2\"]\n"
            "            }\n"
            "        ],\n"
            "        \"exam_day_guidelines\": [\n"
            "            {\n"
            "                \"phase\": \"Before/During/After Exam\",\n"
            "                \"tips\": [\"guideline1\", \"guideline2\"]\n"
            "            }\n"
            "        ]\n"
            "    }\n"
            "}\n"
        )

        additional_requirements = (
            "\nADDITIONAL REQUIREMENTS:\n"
            "1. Prioritize materials based on:\n"
            "- Alignment with exam objectives\n"
            "- Recency of content\n"
            "- Practical application value\n"
            "- Complexity level appropriate for final exam\n"
            "...\n"
        )

        return (
            "You are an experienced computer networks professor creating a comprehensive exam preparation guide.\n"
            "Your task is to analyze the available course materials and create a structured study plan that will\n"
            "maximize students' success in their final exam.\n\n"
            f"{exam_details}\n"
            f"MODULES AND LEARNING OBJECTIVES:\n{modules_info}\n\n"
            f"AVAILABLE STUDY MATERIALS:\n{materials_info}\n\n"
            f"{output_requirements}\n"
            f"{additional_requirements}\n"
        )

    def _format_modules(self, modules: Dict) -> str:
        """Format module information for the prompt."""
        formatted = []
        for module_name, details in modules.items():
            objectives = "\n    ".join(details.get('objectives', []))
            formatted.append(f"- {module_name}:\n    Weight: {details.get('weight', '20%')}\n    Objectives:\n    {objectives}\n")
        return "\n".join(formatted)

    def _format_materials(self, materials: List[Dict]) -> str:
        """Format course materials information for the prompt."""
        formatted = []
        for material in materials:
            topics = ', '.join(material.get('topics', []))
            formatted.append(
                f"- Filename: {material['filename']}\n"
                f"  Type: {material['type']}\n"
                f"  Description: {material['description']}\n"
                f"  Date Added: {material['date_added']}\n"
                f"  Topics Covered: {topics}\n"
                # f"  Difficulty Level: {material.get('difficulty', 'Intermediate')}\n"
            )
        return "\n".join(formatted)

    async def _analyze_with_llm(self, prompt: str) -> Dict:
        """Generate study guide using LLM asynchronously."""
        try:
            response = await self.client.chat(
                model=self.model,
                messages=[{'role': 'user', 'content': prompt}],
                format='json'
            )
            return json.loads(response['message']['content'])
        except json.JSONDecodeError as e:
            print(f"Error parsing LLM response: {e}")
            return {"error": "Failed to generate valid study guide"}
        except Exception as e:
            print(f"Error during LLM analysis: {e}")
            return {"error": str(e)}

# Example usage
async def main():
    # Sample course materials
    materials = [
        {
            "filename": "Advanced_Networks.pdf",
            "type": "PDF",
            "description": "Comprehensive guide to modern networking",
            "date_added": "2024-10-15",
            "topics": ["OSI Model", "TCP/IP", "Routing"],
            "difficulty": "Advanced"
        },
    ]
    
    # Sample syllabus
    syllabus = {
        "course_name": "Advanced Computer Networks",
        "exam_type": "Final Examination",
        "exam_date": "2024-12-15",
        "duration": "3 hours",
        "format": "Written + Lab",
        "modules": {
            "Network Architecture": {
                "weight": "25%",
                "objectives": [
                    "Understand OSI and TCP/IP models",
                    "Compare different network topologies",
                    "Analyze protocol layering and encapsulation"
                ]
            },
            # Add more modules...
        }
    }
    
    assistant = ExamPrepAssistant()
    study_guide = await assistant.generate_study_guide(materials, syllabus)
    
    # Pretty print the study guide
    print(json.dumps(study_guide, indent=2))

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())