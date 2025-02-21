'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera } from 'lucide-react';
import { updateProfileAction, getProfileAction } from '../actions/userDbActions';
import { useRouter } from 'next/navigation';

// Define the type for form data
type FormData = {
    fullName: string;
    email: string;
    role: string;
    avatarUrl: string;
    avatarFile: File | null; // Allow avatarFile to be either File or null
};

export default function ProfileUpdateForm() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        email: '',
        role: 'student',
        avatarUrl: '',
        avatarFile: null // Initialize as null
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await getProfileAction(); // Fetch profile data from the backend
                if (profile) {
                    setFormData({
                        fullName: profile.fullName || '',
                        email: '', // Ensure email is fetched
                        role: profile.role || 'student',
                        avatarUrl: profile.avatarUrl || '',
                        avatarFile: null // Reset avatar file
                    });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        fetchProfile();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFormData(prevState => ({
                ...prevState,
                avatarUrl: URL.createObjectURL(file), // Preview image
                avatarFile: file // Save the file to state
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formDataObj = new FormData();
        
        // Append form fields to FormData
        formDataObj.append('fullName', formData.fullName);
        formDataObj.append('email', formData.email);
        formDataObj.append('role', formData.role);
        if (formData.avatarFile) {
            formDataObj.append('avatarUrl', formData.avatarFile); // Add the image file
        }

        try {
            const profile = await updateProfileAction(formDataObj);
            if (profile) {
                setFormData({
                    fullName: profile.fullName || '',
                    email: '', // Ensure email is updated
                    role: profile.role || 'student',
                    avatarUrl: profile.avatarUrl || '',
                    avatarFile: null // Reset file after submission
                });
            }
            router.refresh();
        } catch (error) {
            console.error('Error updating profile:', error);
            // Add error handling here (e.g., show an error message to the user)
        }
    };

    return (       
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-blue-600">Update Profile</CardTitle>
                    <p className="text-gray-500 text-sm">Update your profile information and role</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar Upload Section */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center relative">
                                {formData.avatarUrl ? (
                                    <img 
                                        src={formData.avatarUrl} // Use the object URL for the image
                                        alt="Profile" 
                                        className="w-24 h-24 rounded-full object-cover"
                                    />
                                ) : (
                                    <Camera className="w-8 h-8 text-blue-500" />
                                )}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    id="avatar-upload"
                                    onChange={handleFileChange} // Handle file change
                                />
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
                                >
                                    <Camera className="w-4 h-4 text-white" />
                                </label>
                            </div>
                        </div>

                        {/* Full Name Field */}
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full"
                            />
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full"
                            />
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="teacher">Teacher</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                            Update Profile
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
