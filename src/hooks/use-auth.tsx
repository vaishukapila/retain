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
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<MockFirebaseUser | null>(null);
  const [role, setRole] = useState<'admin' | 'customer' | null>(null);
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    setLoading(true);
    // This is a mock sign-in. In a real app, this would involve a popup
    // and communication with Firebase servers.
    // We'll simulate signing in as the first customer from our mock data.
    const mockCustomer = mockUsers.find(u => u.role === 'customer');
    
    if (mockCustomer) {
      const mockFbUser: MockFirebaseUser = {
        uid: mockCustomer.uid,
        email: mockCustomer.email,
        displayName: mockCustomer.displayName,
        photoURL: mockCustomer.photoURL,
      };
      setUser(mockCustomer);
      setFirebaseUser(mockFbUser);
      setRole(mockCustomer.role);
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    setUser(null);
    setFirebaseUser(null);
    setRole(null);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  };

  const value = { user, firebaseUser, role, loading, signInWithGoogle, signOut: handleSignOut };

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
