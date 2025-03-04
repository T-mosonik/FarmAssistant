import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  AuthUser,
  getCurrentUser,
  signInWithEmail,
  signOut,
  signUpWithEmail,
} from "@/lib/auth";
import { Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthUser | null>;
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Immediately set isLoading to false for development purposes
    setIsLoading(false);

    // In production, you would uncomment the code below
    /*
    // Check for active session on mount
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);

        if (data.session) {
          const user = await getCurrentUser();
          setUser(user);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);

        if (session) {
          const user = await getCurrentUser();
          setUser(user);
        } else {
          setUser(null);
        }

        setIsLoading(false);
      },
    );

    // Force isLoading to false after a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
    */
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const user = await signInWithEmail({ email, password });
      return user;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const user = await signUpWithEmail({
        email,
        password,
        name,
        confirmPassword: password,
      });
      return user;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
