"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/types';
import { useUser, useFirestore, useAuth as useFirebaseAuth } from '@/firebase';
import { useToast } from './use-toast';
import { setDocumentNonBlocking } from '@/firebase';

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
  const { user: firebaseUser, isUserLoading: firebaseUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useFirebaseAuth();
  const { toast } = useToast();

  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [role, setRole] = useState<'admin' | 'customer' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncUser = async () => {
      if (firebaseUser && firestore) {
        setLoading(true);
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          const combinedUser: AppUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: userData.displayName || firebaseUser.displayName,
            photoURL: userData.photoURL || firebaseUser.photoURL,
            role: userData.role,
          };
          setAppUser(combinedUser);
          setRole(userData.role);
        } else {
          // Profile might be in the process of being created.
          // Let's rely on createFirestoreUser to set the initial state.
        }
        setLoading(false);
      } else if (!firebaseUserLoading) {
        setAppUser(null);
        setRole(null);
        setLoading(false);
      }
    };

    syncUser();
  }, [firebaseUser, firebaseUserLoading, firestore]);

  const handleError = (error: any) => {
    console.error("Authentication error:", error);
    let description = "An unknown error occurred.";
    if (typeof error.code === 'string') {
      const code = error.code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        description = "Invalid email or password.";
      } else if (code === 'auth/email-already-in-use') {
        description = "This email is already registered.";
      } else if (code === 'auth/weak-password') {
        description = "The password must be at least 8 characters long.";
      } else if (code === 'auth/popup-closed-by-user') {
        description = "Sign-in was cancelled.";
      } else if (code.includes('identity-toolkit-api-has-not-been-used')) {
        description = "Authentication is not enabled for this project. Please enable the Identity Toolkit API in your Google Cloud console and try again.";
      }
      else {
        description = error.message;
      }
    }
    toast({
      variant: "destructive",
      title: "Authentication Failed",
      description,
    });
    setLoading(false);
  };
  
  const createFirestoreUser = async (user: FirebaseUser, displayName?: string) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) {
      const isGoogle = user.providerData.some(p => p.providerId === 'google.com');
      // A simple way to assign admin role. In a real app, this should be handled securely.
      const finalRole = user.email === 'admin@test.com' ? 'admin' : 'customer'; 
      const userDataForFirestore = {
          id: user.uid,
          googleId: isGoogle ? user.providerData.find(p => p.providerId === 'google.com')?.uid : null,
          email: user.email,
          displayName: displayName || user.displayName,
          photoURL: user.photoURL,
          role: finalRole,
          loyaltyPoints: 0,
          createdAt: serverTimestamp(),
      };

      setDocumentNonBlocking(userDocRef, userDataForFirestore, {merge:true});
      const appProfile: AppUser = {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName,
        photoURL: user.photoURL,
        role: finalRole,
      };
      setAppUser(appProfile);
      setRole(finalRole);
    }
  }

  const signInWithGoogle = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await createFirestoreUser(result.user);
    } catch (error) {
      handleError(error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      handleError(error);
    }
  };

  const signUpWithEmail = async (displayName: string, email: string, password: string) => {
    if (!auth) return;
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      await createFirestoreUser(userCredential.user, displayName);
    } catch (error) {
      handleError(error);
    }
  };

  const signOut = async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      handleError(error);
    }
  };

  const value = {
    user: appUser,
    firebaseUser,
    role,
    loading,
    signInWithGoogle,
    signOut,
    signInWithEmail,
    signUpWithEmail
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
