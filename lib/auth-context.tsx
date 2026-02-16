import React, { createContext, useContext, useState, useEffect } from "react";
import { ID, Models } from "react-native-appwrite";
import { account } from "./appwrite";

type User = Models.User<Models.Preferences>;

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, name?: string) => Promise<string | null>;
  signOut: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      setIsLoading(true);
      const currentUser = await account.get();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string): Promise<string | null> => {
    try {
      setIsLoading(true);
      await account.create(ID.unique(), email, password, name || "");
      // Auto sign in after signup
      const result = await signIn(email, password);
      return result;
    } catch (error) {
      if (error instanceof Error) return error.message;
      return "An error occurred during sign up";
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<string | null> => {
    try {
      setIsLoading(true);
      await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get();
      setUser(currentUser);
      return null;
    } catch (error) {
      if (error instanceof Error) return error.message;
      return "An error occurred during sign in";
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<string | null> => {
    try {
      setIsLoading(true);
      await account.deleteSession("current");
      setUser(null);
      return null;
    } catch (error) {
      if (error instanceof Error) return error.message;
      return "An error occurred during sign out";
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}