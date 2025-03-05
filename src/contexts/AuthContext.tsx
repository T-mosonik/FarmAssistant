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
    // Check for active session on mount
    const checkSession = async () => {
      setIsLoading(true);
      try {
        // For development, create a mock user if needed
        if (process.env.NODE_ENV === "development") {
          const mockUser: AuthUser = {
            id: "dev-user-123",
            email: "dev@example.com",
            name: "Development User",
          };
          setUser(mockUser);
          setIsLoading(false);
          return;
        }

        const { data } = await supabase.auth.getSession();
        setSession(data.session);

        if (data.session) {
          const user = await getCurrentUser();
          setUser(user);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        // For development, create a mock user if there's an error
        if (process.env.NODE_ENV === "development") {
          const mockUser: AuthUser = {
            id: "dev-user-123",
            email: "dev@example.com",
            name: "Development User",
          };
          setUser(mockUser);
        }
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
          // For development, keep the mock user
          if (process.env.NODE_ENV !== "development") {
            setUser(null);
          }
        }

        setIsLoading(false);
      },
    );

    // Force isLoading to false after a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsLoading(false);

      // If still no user after timeout and in development, create a mock user
      if (!user && process.env.NODE_ENV === "development") {
        const mockUser: AuthUser = {
          id: "dev-user-123",
          email: "dev@example.com",
          name: "Development User",
        };
        setUser(mockUser);
      }
    }, 3000);

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
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
