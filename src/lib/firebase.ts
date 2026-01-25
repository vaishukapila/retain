'use client';
import { initializeApp, type FirebaseOptions } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged as onFirebaseAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import type { User } from './types';
import { mockUsers } from './mock-data';

const firebaseConfig: FirebaseOptions = {
  projectId: "studio-1464535918-b6c00",
  appId: "1:990531123961:web:b812b2f1b9735fc83fc028",
  apiKey: "AIzaSyBZSnjsGZVNx1cE-224nqnvbBJ8km-KhCM",
  authDomain: "studio-1464535918-b6c00.firebaseapp.com",
  messagingSenderId: "990531123961"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google: ", error);
    return null;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
  }
};

export function onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
  return onFirebaseAuthStateChanged(auth, callback);
}

// Mock Firestore user profile fetch
export const getUserProfile = async (uid: string, email: string | null): Promise<User | null> => {
    console.log(`Fetching profile for uid: ${uid}, email: ${email}`);
    // In a real app, you would fetch this from Firestore
    // For demo, we'll find a mock user or create one
    
    // Admin role for specific email
    if (email === 'admin@test.com') {
      const adminUser = mockUsers.find(u => u.role === 'admin');
      if (adminUser) return { ...adminUser, uid, email };
    }

    // Find existing customer
    const existingUser = mockUsers.find(u => u.email === email && u.role === 'customer');
    if (existingUser) {
        return { ...existingUser, uid, email };
    }

    // Default to first customer for any other logged-in user for demo purposes
    const defaultCustomer = mockUsers.find(u => u.role === 'customer');
    if (defaultCustomer) {
        return { ...defaultCustomer, uid, email, displayName: auth.currentUser?.displayName, photoURL: auth.currentUser?.photoURL };
    }
    
    return null;
};
