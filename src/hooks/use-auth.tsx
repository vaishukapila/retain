"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { User as AppUser } from '@/lib/types';
import { useToast } from './use-toast';
import { mockUsers } from '@/lib/mock-data';
import type { User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  role: 'admin' | 'customer' | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (displayName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const customerUser: AppUser = mockUsers.find(u => u.email === 'customer@test.com')!;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const role = user?.role || null;

  const signInWithGoogle = async () => {
    setLoading(true);
    // Simulate a successful Google sign-in for a customer
    setTimeout(() => {
      setUser(customerUser);
      setLoading(false);
      toast({ title: "Signed in successfully" });
    }, 500);
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setTimeout(() => {
      const foundUser = mockUsers.find(u => u.email === email);
      if (foundUser) {
        // In a real app, you'd check the password. Here we just accept any.
        setUser(foundUser);
        toast({ title: "Signed in successfully" });
      } else {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "Invalid email or password.",
        });
      }
      setLoading(false);
    }, 500);
  };

  const signUpWithEmail = async (displayName: string, email: string, password: string) => {
     setLoading(true);
     setTimeout(() => {
        if (mockUsers.some(u => u.email === email)) {
            toast({
                variant: "destructive",
                title: "Sign-up Failed",
                description: "This email is already registered.",
            });
            setLoading(false);
            return;
        }

        const newUser: AppUser = {
            uid: `mock-${Date.now()}`,
            email,
            displayName,
            photoURL: `https://i.pravatar.cc/150?u=${email}`,
            role: 'customer'
        };
        // In a real app, you'd add the user to your mock data source if needed.
        // For this mock, we'll just set them as the current user.
        setUser(newUser);
        setLoading(false);
        toast({ title: "Account created successfully" });
     }, 500);
  };

  const signOut = async () => {
    setLoading(true);
    setTimeout(() => {
      setUser(null);
      setLoading(false);
    }, 300);
  };

  const value = {
    user,
    firebaseUser: null, // Always null in mock mode
    role,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
