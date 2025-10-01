import React, { createContext, useContext, useEffect, useState } from "react";
import { sendAuthUpdateViaPostMessage } from "@/lib/extension-bridge";
import {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getUserData,
  setUserData,
  removeUserData,
} from "@/lib/utils";
import { fetchBackend } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  isActive: boolean;
  isSuperuser: boolean;
  isVerified: boolean;
  githubUsername?: string | null;
  githubId?: string | null;
  googleId?: string | null;
  avatarUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string) => Promise<User | null>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to fetch user data from API
  const fetchUserData = async (): Promise<User | null> => {
    try {
      const response = await fetchBackend.get("/auth/me");

      if (!response.ok) {
        // If the token is invalid, clear it
        if (response.status === 401) {
          setToken(null);
          setUser(null);
          setIsLoggedIn(false);
          removeAuthToken();
          removeUserData();
        }
        return null;
      }

      const userData = await response.json();

      // Normalize API response (snake_case) to camelCase for frontend
      const dbUser: User = {
        id: String(userData.id ?? ""),
        email: userData.email ?? "",
        isActive: Boolean(userData.is_active),
        isSuperuser: Boolean(userData.is_superuser),
        isVerified: Boolean(userData.is_verified),
        githubUsername: userData.github_username ?? null,
        githubId: userData.github_id ?? null,
        googleId: userData.google_id ?? null,
        avatarUrl: userData.avatar_url ?? null,
        firstName: userData.first_name ?? null,
        lastName: userData.last_name ?? null,
      };

      // Save user data to localStorage for future use
      setUserData(dbUser);

      return dbUser;
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsLoggedIn(false);
      return null;
    }
  };

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const savedToken = getAuthToken();
        const savedUser = getUserData();

        if (savedToken) {
          setToken(savedToken);
          if (
            savedUser &&
            typeof savedUser === "object" &&
            "email" in savedUser
          ) {
            // We have both token and user data
            setUser(savedUser as User);
            setIsLoggedIn(true);
          } else {
            // We have token but no user data - fetch it from API
            const userData = await fetchUserData();
            if (userData) {
              setUser(userData);
              setIsLoggedIn(true);
            } else {
              setIsLoggedIn(false);
            }
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error loading auth state:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAuthState();
  }, []);

  // Share credentials with Chrome extension when auth state changes
  useEffect(() => {
    const shareWithExtension = async () => {
      try {
        // Send auth update to extension via postMessage
        sendAuthUpdateViaPostMessage({
          token,
          user,
          isLoggedIn,
        });
      } catch (error) {
        console.error("Error sharing credentials with extension:", error);
      }
    };

    if (!loading) {
      shareWithExtension();
    }
  }, [token, user, isLoggedIn, loading]);

  const login = async (authToken: string): Promise<User | null> => {
    // Persist token immediately so subsequent API calls are authenticated
    setToken(authToken);
    setAuthToken(authToken);

    // Fetch user from backend and update state
    const fetchedUser = await fetchUserData();
    if (fetchedUser) {
      setUser(fetchedUser);
      setIsLoggedIn(true);
      return fetchedUser;
    }
    setUser(null);
    setIsLoggedIn(false);
    return null;
  };

  const logout = async () => {
    setIsLoggedIn(false);
    setToken(null);
    // Clear localStorage
    removeAuthToken();
    removeUserData();

    // Notify extension of logout
    sendAuthUpdateViaPostMessage({
      token: null,
      user: null,
      isLoggedIn: false,
    });

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoggedIn,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
