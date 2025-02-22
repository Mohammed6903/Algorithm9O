'use server';

import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Server action to save or update debate data to Supabase
export const startDebateDuel = async (
  debateTopic: string,
  stance: string,
  argumentCards: string[],
  aiResponse: string,
  studentId: string,
  debateId?: string // Optional debateId for updates
): Promise<{ id: string; aiResponse: string }> => {
  try {
    let debate;
    if (debateId) {
      // Update existing debate
      debate = await prisma.debate.update({
        where: { id: debateId },
        data: {
          aiResponse,
          cards: argumentCards, // Update cards if needed
        },
      });
    } else {
      // Create new debate
      debate = await prisma.debate.create({
        data: {
          studentId,
          topic: debateTopic,
          stance,
          cards: argumentCards,
          aiResponse,
        },
      });
    }
    return { id: debate.id, aiResponse: debate.aiResponse || '' };
  } catch (error) {
    console.error('Error saving/updating debate to database:', error);
    throw error; // Re-throw to let the caller handle it
  } finally {
    await prisma.$disconnect(); // Ensure Prisma connection is closed
  }
};