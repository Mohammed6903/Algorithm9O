'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { signInAction } from "@/app/actions/userActions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from '@/utils/supabase/client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default function Login() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    // Check authentication status on mount and route changes
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try{
          if(session.user?.id) {
            const userProfile = await prisma.userProfile.findUnique({
              where: {
                id: session.user.id
              }
            })
            if (!userProfile && session.user) {
              await prisma.userProfile.create({
                data: {
                  id: session.user.id,
                  fullName: session.user.user_metadata.full_name || 'Unknown',
                  role: 'student'
                }
              })
            }
          }
        } catch (error) {
          console.error('Database error:', error);
        }
        router.push('/main/student'); // in future add role manager
      }
    };
    
    checkUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/main/student'); // in future add role manager
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  useEffect(() => {
    const successMessage = searchParams.get("success");
    const errorMessage = searchParams.get("error");
    const userMessage = searchParams.get("message");

    if (successMessage) {
      setMessage({ success: successMessage });
    } else if (errorMessage) {
      setMessage({ error: errorMessage });
    } else if (userMessage) {
      setMessage({ message: userMessage });
    } else {
      setMessage(null);
    }
  }, [searchParams]);

  const handleGoogle = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        setMessage({ error: error.message });
      }
    } catch (err) {
      setMessage({ error: 'Failed to sign in with Google' });
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="relative w-full max-w-md">
        {/* Decorative Elements */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,transparent)] pointer-events-none"></div>
          
          <div className="relative">
            {/* Header */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Welcome Back</h1>
            <p className="text-sm text-gray-600 mb-8">
              Don't have an account?{" "}
              <Link className="text-blue-600 font-medium hover:text-blue-700 transition-colors" href="/sign-up">
                Sign up
              </Link>
            </p>

            {/* Google Sign In */}
            <div className="mb-8">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-3 h-12 border-2 hover:bg-gray-50 transition-colors"
                type="button"
                onClick={handleGoogle}
                disabled={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4"/>
                  <path d="M12.24 24.0008C15.4764 24.0008 18.2058 22.9382 20.1944 21.1039L16.3274 18.1055C15.2516 18.8375 13.8626 19.252 12.24 19.252C9.0synchronization4366 19.252 6.33066 17.1399 5.35646 14.3003H1.35156V17.3912C3.35756 21.4434 7.47444 24.0008 12.24 24.0008Z" fill="#34A853"/>
                  <path d="M5.35645 14.3003C4.89285 12.8099 4.89285 11.1961 5.35645 9.70575V6.61481H1.35156C-0.154435 10.0056 -0.154435 14.0004 1.35156 17.3912L5.35645 14.3003Z" fill="#FBBC04"/>
                  <path d="M12.24 4.74966C13.9508 4.7232 15.6043 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.24 0.000808666C7.47444 0.000808666 3.35756 2.55822 1.35156 6.61481L5.35645 9.70575C6.33066 6.86616 9.04366 4.74966 12.24 4.74966Z" fill="#EA4335"/>
                </svg>
                {loading ? 'Signing in...' : 'Continue with Google'}
              </Button>
            </div>

            <Separator className="my-8">
              <span className="px-3 text-gray-500">or continue with email</span>
            </Separator>

            {/* Email Sign In Form */}
            <form className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  name="email"
                  placeholder="you@example.com"
                  required
                  type="email"
                  autoComplete="email"
                  className="mt-1 h-12 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <Link className="text-sm text-blue-600 hover:text-blue-700 transition-colors" href="/forgot-password">
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  type="password"
                  name="password"
                  placeholder="Your password"
                  required
                  autoComplete="current-password"
                  className="mt-1 h-12 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <SubmitButton
                pendingText="Signing In..."
                formAction={signInAction}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Sign in with Email
              </SubmitButton>

              {message && <FormMessage message={Promise.resolve(message)} />}
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}