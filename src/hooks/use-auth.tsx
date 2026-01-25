"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithGoogle as signIn, signOutUser as signOut } from '@/lib/firebase';
import { getUserProfile } from '@/lib/firebase';
import type { User as AppUser } from '@/lib/types';
import { type User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  role: 'admin' | 'customer' | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<'admin' | 'customer' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        setLoading(true);
        const userProfile = await getUserProfile(fbUser.uid, fbUser.email);
        if (userProfile) {
          setUser(userProfile);
          setRole(userProfile.role);
        } else {
          // Handle case where profile doesn't exist
          setUser(null);
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    await signIn();
    // The onAuthStateChanged listener will handle the rest
  };

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    setUser(null);
    setRole(null);
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
