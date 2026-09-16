import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "../lib/firebase.js";
import { api, type AuthUserData } from "../services/api.js";
import { getFriendlyAuthErrorMessage } from "../utils/authErrors.js";

export type AuthModalView = "login" | "register" | "forgot-password";

export interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  dbUser: AuthUserData | null;
  roles: string[];
  permissions: string[];
  loading: boolean;
  isFirebaseAvailable: boolean;
  authModalOpen: boolean;
  authModalView: AuthModalView;
  openAuthModal: (view?: AuthModalView) => void;
  closeAuthModal: () => void;
  setAuthModalView: (view: AuthModalView) => void;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  sendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  checkVerificationStatus: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<AuthUserData | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalView, setAuthModalView] = useState<AuthModalView>("login");

  // Configure api token provider dynamically from current Firebase auth state
  useEffect(() => {
    api.setTokenGetter(async () => {
      if (!auth?.currentUser) return null;
      try {
        return await auth.currentUser.getIdToken();
      } catch {
        return null;
      }
    });
  }, []);

  const openAuthModal = (view: AuthModalView = "login") => {
    setAuthModalView(view);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const refreshProfile = async () => {
    if (!auth?.currentUser) {
      setDbUser(null);
      setRoles([]);
      setPermissions([]);
      return;
    }

    try {
      const token = await auth.currentUser.getIdToken(true);
      const res = await api.getMe(token);
      if (res.success && res.data) {
        setDbUser(res.data.user);
        setRoles(res.data.roles || []);
        setPermissions(res.data.permissions || []);
      }
    } catch (err) {
      console.error("[Auth Context] Failed to refresh profile:", err);
    }
  };

  // Primary listener for Firebase authentication state
  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          // Sync authenticated user with backend database
          const syncRes = await api.syncUser(
            {
              full_name: user.displayName || undefined,
              profile_photo_url: user.photoURL || undefined,
            },
            token
          );

          if (syncRes.success && syncRes.data) {
            setDbUser(syncRes.data.user);
            setRoles(syncRes.data.roles || []);
            setPermissions(syncRes.data.permissions || []);
          } else {
            console.warn("[Auth Context] User sync warning:", syncRes.message);
          }
        } catch (err) {
          console.error("[Auth Context] Failed to sync Firebase user:", err);
        }
      } else {
        setDbUser(null);
        setRoles([]);
        setPermissions([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!auth) {
      return { success: false, error: "Firebase Authentication is not configured in this environment." };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const token = await userCredential.user.getIdToken();
      
      // Perform backend synchronization
      const syncRes = await api.syncUser(
        {
          full_name: userCredential.user.displayName || undefined,
        },
        token
      );

      if (syncRes.success && syncRes.data) {
        if (syncRes.data.user.status !== "ACTIVE") {
          return {
            success: false,
            error: `Your account status is ${syncRes.data.user.status}. Please contact an administrator.`,
          };
        }
        setDbUser(syncRes.data.user);
        setRoles(syncRes.data.roles || []);
        setPermissions(syncRes.data.permissions || []);
      }

      closeAuthModal();
      return { success: true };
    } catch (error: any) {
      const message = getFriendlyAuthErrorMessage(error);
      return { success: false, error: message };
    }
  };

  const registerWithEmail = async (
    fullName: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!auth) {
      return { success: false, error: "Firebase Authentication is not configured in this environment." };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      // Update Firebase display name
      if (fullName.trim()) {
        try {
          await updateProfile(userCredential.user, {
            displayName: fullName.trim(),
          });
        } catch (profileErr) {
          console.warn("[Auth Context] Failed to set display name on Firebase user:", profileErr);
        }
      }

      const token = await userCredential.user.getIdToken(true);
      
      // Sync with backend to create/populate user record
      const syncRes = await api.syncUser(
        {
          full_name: fullName.trim() || undefined,
        },
        token
      );

      if (syncRes.success && syncRes.data) {
        setDbUser(syncRes.data.user);
        setRoles(syncRes.data.roles || []);
        setPermissions(syncRes.data.permissions || []);
      }

      closeAuthModal();
      return { success: true };
    } catch (error: any) {
      const message = getFriendlyAuthErrorMessage(error);
      return { success: false, error: message };
    }
  };

  const sendPasswordReset = async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!auth) {
      return { success: false, error: "Firebase Authentication is not configured in this environment." };
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (error: any) {
      const message = getFriendlyAuthErrorMessage(error);
      return { success: false, error: message };
    }
  };

  const sendVerificationEmail = async (): Promise<{ success: boolean; error?: string }> => {
    if (!auth?.currentUser) {
      return { success: false, error: "No authenticated user found." };
    }

    try {
      await sendEmailVerification(auth.currentUser);
      return { success: true };
    } catch (error: any) {
      const message = getFriendlyAuthErrorMessage(error);
      return { success: false, error: message };
    }
  };

  const checkVerificationStatus = async (): Promise<boolean> => {
    if (!auth?.currentUser) return false;
    try {
      await auth.currentUser.reload();
      setFirebaseUser({ ...auth.currentUser });
      return auth.currentUser.emailVerified;
    } catch (err) {
      console.error("[Auth Context] Failed to reload user for verification:", err);
      return false;
    }
  };

  const signOut = async () => {
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.error("[Auth Context] Sign out error:", err);
      }
    }
    setFirebaseUser(null);
    setDbUser(null);
    setRoles([]);
    setPermissions([]);
  };

  const hasPermission = (permission: string): boolean => {
    if (roles.includes("SUPER_ADMIN")) return true;
    return permissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    return roles.includes(role);
  };

  const value: AuthContextValue = {
    firebaseUser,
    dbUser,
    roles,
    permissions,
    loading,
    isFirebaseAvailable: isFirebaseConfigured,
    authModalOpen,
    authModalView,
    openAuthModal,
    closeAuthModal,
    setAuthModalView,
    loginWithEmail,
    registerWithEmail,
    sendPasswordReset,
    sendVerificationEmail,
    checkVerificationStatus,
    hasPermission,
    hasRole,
    refreshProfile,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
