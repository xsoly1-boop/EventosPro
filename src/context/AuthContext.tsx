"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User as FirebaseUser, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type UserRole = "admin" | "dueño" | "gerencia" | "host" | "staff" | "client" | null;

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  loginDemo: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have a persisted demo session
    const demoSession = localStorage.getItem("svip_demo_session");
    if (demoSession) {
      try {
        const parsed = JSON.parse(demoSession);
        setUser(parsed);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem("svip_demo_session");
      }
    }

    // Initialize Firebase Auth Listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          // Fetch user profile from Firestore to get role
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || data.displayName || "Usuario SocialesVIP",
              role: data.role || "client",
            });
          } else {
            // Default role if doc not created yet
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || "Nuevo Usuario",
              role: "client",
            });
          }
        } catch (error) {
          console.error("Error fetching user profile from Firestore:", error);
          // Fallback to basic client profile on error (e.g. Firebase config missing)
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || "Invitado",
            role: "client",
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;

      // Auto-assign admin role in Firestore on first login for the master admin email
      if (email.toLowerCase() === "admin@socialesvip.com" && db) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        await setDoc(userDocRef, {
          role: "admin",
          displayName: "Admin Master",
          email: firebaseUser.email,
        }, { merge: true });
      }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    localStorage.removeItem("svip_demo_session");
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Firebase SignOut error:", err);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  // Demo Login Helper for offline/prototyping purposes
  const loginDemo = (role: UserRole) => {
    setLoading(true);
    const demoUser: UserProfile = {
      uid: `demo-${role}-${Date.now()}`,
      email: `demo-${role}@socialesvip.com`,
      displayName: `Demo ${role?.toUpperCase()}`,
      role: role,
    };
    setUser(demoUser);
    localStorage.setItem("svip_demo_session", JSON.stringify(demoUser));
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, loginDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
