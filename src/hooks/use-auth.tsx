"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  type User as FirebaseUser
} from 'firebase/auth';
import type { User as AppUser } from '@/lib/types';
import { 
  auth,
  signInWithGoogle as googleSignIn, 
  signOutUser, 
  onAuthStateChanged,
  getUserProfile
} from '@/lib/firebase';
import { useToast } from './use-toast';

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<'admin' | 'customer' | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (fbUser) => {
      setLoading(true);
      if (fbUser) {
        setFirebaseUser(fbUser);
        const userProfile = await getUserProfile(fbUser.uid, fbUser.email);
        if (userProfile) {
          // If displayName is null on profile but exists on fbUser, use fbUser's.
          if (!userProfile.displayName && fbUser.displayName) {
            userProfile.displayName = fbUser.displayName;
          }
           if (!userProfile.photoURL && fbUser.photoURL) {
            userProfile.photoURL = fbUser.photoURL;
          }
          setUser(userProfile);
          setRole(userProfile.role);
        } else {
            // This case might happen for a newly signed up user before their profile is created in our mock DB.
            const tempProfile: AppUser = {
                uid: fbUser.uid,
                email: fbUser.email,
                displayName: fbUser.displayName,
                photoURL: fbUser.photoURL,
                role: 'customer' // default role
            };
            setUser(tempProfile);
            setRole('customer');
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleError = (error: any) => {
      console.error("Authentication error:", error);
      let description = "An unknown error occurred.";
      if (typeof error.code === 'string') {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            description = "Invalid email or password.";
            break;
          case 'auth/email-already-in-use':
            description = "This email is already registered.";
            break;
          case 'auth/weak-password':
            description = "The password is too weak. It must be at least 6 characters long.";
            break;
          default:
            description = error.message;
        }
      }
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description,
      });
      setLoading(false);
  }

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await googleSignIn();
    } catch(error) {
      handleError(error);
    }
  };
  
  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      handleError(error);
    }
  }
  
  const signUpWithEmail = async (displayName: string, email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
    } catch(error) {
      handleError(error);
    }
  }

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOutUser();
    } catch(error) {
        handleError(error);
    }
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
