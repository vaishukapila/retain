"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { User as AppUser } from '@/lib/types';
import { mockUsers } from '@/lib/mock-data';

// This is a mock of the FirebaseUser object
type MockFirebaseUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: MockFirebaseUser | null;
  role: 'admin' | 'customer' | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
  signUpWithEmail: (displayName: string, email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<MockFirebaseUser | null>(null);
  const [role, setRole] = useState<'admin' | 'customer' | null>(null);
  const [loading, setLoading] = useState(false);

  const mockLogin = (appUser: AppUser) => {
    const mockFbUser: MockFirebaseUser = {
      uid: appUser.uid,
      email: appUser.email,
      displayName: appUser.displayName,
      photoURL: appUser.photoURL,
    };
    setUser(appUser);
    setFirebaseUser(mockFbUser);
    setRole(appUser.role);
  }

  const signInWithGoogle = async () => {
    setLoading(true);
    const mockCustomer = mockUsers.find(u => u.role === 'customer');
    
    if (mockCustomer) {
      mockLogin(mockCustomer);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  };
  
  const signInWithEmail = async (email: string) => {
    setLoading(true);
    let userToLogin = mockUsers.find(u => u.email === email);
    if (!userToLogin) {
        userToLogin = mockUsers.find(u => u.role === 'customer')!;
    }
    mockLogin(userToLogin);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  }
  
  const signUpWithEmail = async (displayName: string, email: string) => {
    setLoading(true);
    const newUser: AppUser = {
        uid: String(Date.now()),
        email,
        displayName,
        photoURL: `https://i.pravatar.cc/150?u=${email}`,
        role: 'customer'
    };
    mockLogin(newUser);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  }

  const handleSignOut = async () => {
    setLoading(true);
    setUser(null);
    setFirebaseUser(null);
    setRole(null);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  };

  const value = { user, firebaseUser, role, loading, signInWithGoogle, signOut: handleSignOut, signInWithEmail, signUpWithEmail };

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
