'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from './use-toast';
import { useFirebase } from '@/firebase/provider';
import type { User as AppUser } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  role: 'admin' | 'customer' | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    displayName: string,
    email: string,
    password: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { auth, firestore, isUserLoading } = useFirebase();
  const [user, setUser] = useState<AppUser | null>(null);
  const [role, setRole] = useState<'admin' | 'customer' | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const handleError = (error: any) => {
    console.error('Authentication error:', error);
    let description = 'An unexpected error occurred. Please try again.';

    if (error.code) {
      switch (error.code) {
        case 'auth/invalid-credential':
          description =
            'Invalid credentials. If you are a new user, please sign up first.';
          break;
        case 'auth/email-already-in-use':
          description = 'This email is already registered. Please sign in.';
          break;
        case 'auth/weak-password':
          description = 'Password should be at least 8 characters.';
          break;
        case 'auth/network-request-failed':
          description =
            'Network error. Please check your internet connection.';
          break;
        case 'auth/popup-closed-by-user':
          description = 'Sign-in process was cancelled.';
          break;
        default:
          description = error.message;
          break;
      }
    } else if (error.message?.includes('quota')) {
      description =
        'The authentication service is currently experiencing high demand. Please try again later.';
    }

    toast({
      variant: 'destructive',
      title: 'Authentication Failed',
      description,
    });
  };

  useEffect(() => {
    // This listener handles all authentication state changes.
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        setLoading(true);
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          // If the user document exists, use its data
          const appUser = userDocSnap.data() as AppUser;
          setUser(appUser);
          setRole(appUser.role);
        } else {
          // This case handles first-time sign-in with a social provider (e.g., Google)
          // by creating the user document on the fly.
          const newUserData: AppUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: 'customer', // All new users default to 'customer'
          };
          await setDoc(userDocRef, newUserData);
          setUser(newUserData);
          setRole('customer');
        }
      } else {
        // No user is signed in
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [auth, firestore]);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // `onAuthStateChanged` will handle creating the user document.
    } catch (error) {
      handleError(error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      handleError(error);
    }
  };

  const signUpWithEmail = async (
    displayName: string,
    email: string,
    password: string
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, { displayName });

      // Explicitly create the user document here. `onAuthStateChanged` will then read it.
      const userRef = doc(firestore, 'users', userCredential.user.uid);
      const newUserData: AppUser = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName,
        photoURL: userCredential.user.photoURL,
        role: 'customer', // All new users default to 'customer'
      };
      await setDoc(userRef, newUserData);
    } catch (error) {
      handleError(error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // `onAuthStateChanged` will clear user state.
    } catch (error) {
      handleError(error);
    }
  };

  const value = {
    user,
    firebaseUser: auth.currentUser,
    role,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  // The AuthProvider handles its own loading state, showing a spinner
  // only during the initial authentication check.
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
