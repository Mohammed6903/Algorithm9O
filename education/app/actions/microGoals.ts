'use server';

import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Define the engagement data type
type EngagementData = {
  topic: string;
  time_spent: number;
  engagement_score: number;
  interactions: string[];
};

// Server action to save engagement data
export const saveEngagement = async (
  studentId: string,
  engagement: EngagementData
): Promise<void> => {
  try {
    await prisma.engagement.create({
      data: {
        studentId, // UUID type, matches UserProfile.id
        topic: engagement.topic,
        timeSpent: engagement.time_spent,
        engagementScore: engagement.engagement_score,
        interactions: engagement.interactions,
      },
    });
  } catch (error) {
    console.error('Error saving engagement to database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Server action to fetch engagement data
export const fetchEngagementData = async (
  studentId: string
): Promise<EngagementData[]> => {
  try {
    const engagement: EngagementData[] = [];

    // Fetch class enrollments
    const enrollments = await prisma.classEnrollment.findMany({
      where: { studentId },
      include: {
        class: {
          include: {
            ClassTopic: { // Matches Class model's relation name
              include: {
                topic: true, // Include the Topic model through ClassTopic
              },
            },
          },
        },
      },
    });

    // Fetch materials
    const materials = await prisma.material.findMany({
      where: {
        classId: { in: enrollments.map(e => e.classId) },
      },
      include: {
        topic: true,
      },
    });

    // Fetch study plans
    const studyPlans = await prisma.studyPlan.findMany({
      where: { studentId },
      include: {
        studyPlanTopics: {
          include: {
            topic: true,
          },
        },
      },
    });

    // Process enrollments
    for (const enrollment of enrollments) {
      const topic = enrollment.class.ClassTopic?.[0]?.topic; // Access first topic via ClassTopic
      engagement.push({
        topic: topic?.name || "General",
        time_spent: 10,
        engagement_score: 80,
        interactions: ["attended_class"],
      });
    }

    // Process materials
    for (const material of materials) {
      engagement.push({
        topic: material.topic?.name || "General",
        time_spent: 5,
        engagement_score: 90,
        interactions: ["viewed"],
      });
    }

    // Process study plans
    for (const plan of studyPlans) {
      for (const studyPlanTopic of plan.studyPlanTopics) {
        engagement.push({
          topic: studyPlanTopic.topic.name,
          time_spent: 15,
          engagement_score: 85,
          interactions: ["planned"],
        });
      }
    }

    return engagement;
  } catch (error) {
    console.error("Error fetching engagement data:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
};