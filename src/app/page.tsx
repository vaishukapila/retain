"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/icons';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { user, role, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, role, loading, router]);

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <AppLogo className="h-12 w-auto" />
        </div>
        <div className='space-y-2'>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Welcome to Retain.ai
          </h1>
          <p className="text-muted-foreground">
            Your personalized shopping experience awaits.
          </p>
        </div>
        
        <Button 
          onClick={signInWithGoogle} 
          size="lg" 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 74.8C307.7 102.3 279.6 88 248 88c-73.2 0-132.3 59.2-132.3 132S174.8 352 248 352c78.8 0 118.9-52.6 123.4-78.9H248v-95.3h236.3c4.7 25.4 7.7 53.8 7.7 82.1z"></path></svg>
          Sign in with Google
        </Button>

        <p className="px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
