'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
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
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          description = 'Invalid email or password.';
          break;
        case 'auth/email-already-in-use':
          description = 'This email is already registered.';
          break;
        case 'auth/weak-password':
          description = 'Password should be at least 6 characters.';
          break;
        case 'auth/network-request-failed':
          description =
            'Network error. Please check your internet connection.';
          break;
        case 'auth/popup-closed-by-user':
          description = 'Sign-in process was cancelled.';
          break;
        case 'auth/identity-toolkit-api-has-not-been-used-in-project-885460961560-before-or-it-is-disabled.-enable-it-by-visiting-https://console.developers.google.com/apis/api/identitytoolkit.googleapis.com/overview?project=885460961560-then-retry.-if-you-enabled-this-api-recently,-wait-a-few-minutes-for-the-action-to-propagate-to-our-systems-and-retry.':
          description = 'Authentication service is not enabled. Please enable the Identity Toolkit API in your Google Cloud console.';
          break;
        default:
          description = error.message;
          break;
      }
    }
     else if (error.message.includes('quota')) {
      description = 'The authentication service is currently experiencing high demand. Please try again later.';
    }

    toast({
      variant: 'destructive',
      title: 'Authentication Failed',
      description,
    });
  };

  const createFirestoreUser = async (
    firebaseUser: FirebaseUser,
    displayName?: string
  ) => {
    const userRef = doc(firestore, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: displayName || firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: 'customer', // Default role
      });
    }
  };

  const fetchUserRole = useCallback(
    async (uid: string) => {
      const userDocRef = doc(firestore, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data() as AppUser;
        setRole(userData.role);
        setUser(userData);
      } else {
        // Also check admin collection for legacy admins
        const adminDocRef = doc(firestore, 'roles_admin', uid);
        const adminDoc = await getDoc(adminDocRef);
        if (adminDoc.exists()) {
          setRole('admin');
        } else {
          setRole('customer');
        }
      }
    },
    [firestore]
  );
  
  useEffect(() => {
    setLoading(isUserLoading);
     if (isUserLoading) {
      setUser(null);
      setRole(null);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchUserRole(firebaseUser.uid);
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if(userDocSnap.exists()) {
            setUser(userDocSnap.data() as AppUser);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, fetchUserRole, firestore, isUserLoading]);


  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await createFirestoreUser(result.user);
    } catch (error) {
      handleError(error);
    } finally {
      // Don't setLoading(false) here, onAuthStateChanged will handle it
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      handleError(error);
      setLoading(false); // only set loading false on error
    }
  };

  const signUpWithEmail = async (
    displayName: string,
    email: string,
    password: string
  ) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      await createFirestoreUser(userCredential.user, displayName);
    } catch (error) {
      handleError(error);
      setLoading(false); // only set loading false on error
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      // user state will be cleared by onAuthStateChanged
    } catch (error) {
      handleError(error);
      setLoading(false);
    }
  };

  const value = {
    user: user,
    firebaseUser: auth.currentUser,
    role,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };
  
  if (isUserLoading) {
      return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

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
