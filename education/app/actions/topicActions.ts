import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getSubjects = async() => {
    try{
        const subjects = await prisma.subject.findMany();
        return subjects;
    } catch (error){
        console.log('Error getting subjects: ', error);
        throw error;
    }
}

export const createSubject = async(subjectName: string) => {
    try {
        const response = await prisma.subject.create({
            data: {
                name: subjectName
            }
        });
        return response;
    } catch (error){
        console.log("Error inserting subject: ", error);
        throw error;
    }
}

export const deleteSubject = async (id: string) => {
    try {
        const response = await prisma.subject.delete({
            where: {
                id: id
            }
        })
        return response;
    } catch (error){
        console.log("Error inserting subject: ", error);
        throw error;
    }
}

export const addTopic = async (name: string, subjectId: string, sequenceNumber: number) => {
    try {
        const response = await prisma.topic.create({
            data: {
                subjectId,
                name,
                sequenceNumber
            }
        });
        return response;
    } catch (error) {
        console.log("Error creating topic: " + error);
        throw error;
    }
}

export const deleteTopic = async (id: string) => {
    try{
        const response = await prisma.topic.delete({
            where: {
                id: id
            }
        });
        return response;
    } catch(error){
        console.log(`Error deleting topic: ${error}`);
        throw error;
    }
}

export const getTopics = async () => {
    try{
        const response = await prisma.topic.findMany();
        return response;
    } catch (error) {
        console.log(`Error fetching topics: ${error}`);
        throw error;
    }
}

export const getTopic = async (id: string) => {
    try {
        const response = await prisma.topic.findUnique({
            where: {
                id: id
            }
        });

        return response;
    } catch (error) {
        console.log(`Error fetching topic: ${error}`);
        throw error;
    }
}

export const getTopicByName = async (name: string) => {
    try {
        const response = await prisma.topic.findFirst({
            where: {
                name: name
            }
        })
        return response;
    } catch (error) {
        console.log(`Error fetching topic: ${name}`);
        throw error;
    }
}