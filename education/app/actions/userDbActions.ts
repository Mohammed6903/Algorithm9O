'use server'
import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

enum UserRole {
    Student = 'student',
    Teacher = 'teacher'
}

export const updateProfileAction = async (formData: FormData) => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
        try {
            const fullName = formData.get('fullName') as string;
            const role = formData.get('role') as string;
            const userRole = role === 'teacher' ? UserRole.Teacher : UserRole.Student;

            const userProfile = await prisma.userProfile.upsert({
                where: {
                    id: user.id
                },
                update: {
                    fullName: fullName || user.user_metadata.full_name || 'Unknown',
                    role: userRole
                },
                create: {
                    id: user.id,
                    fullName: fullName || user.user_metadata.full_name || 'Unknown',
                    role: userRole
                }
            });

            return userProfile;
        } catch (error) {
            console.log('Database error: ', error);
            throw error; // Re-throw to handle in the component
        }
    } else {
        redirect('/sign-in');
    }
}

export const getProfileAction = async () => {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();
    if (user?.id) {
        try {
            const userProfile = await prisma.userProfile.findUnique({
                where: {
                    id: user.id
                }
            });

            return userProfile;
        } catch (error) {
            console.log('Database error: ', error);
            throw error;
        }
    } else {
        redirect('/main');
    }
}

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