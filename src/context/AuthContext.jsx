import { createContext, useContext, useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  const loginAttempts = useRef(0);
  const lastLoginAttempt = useRef(0);

  const checkRateLimit = () => {
    const now = Date.now();
    const timeWindow = 15 * 60 * 1000; // 15 minutes
    if (now - lastLoginAttempt.current > timeWindow) {
      loginAttempts.current = 0;
    }
    if (loginAttempts.current >= 5) {
      const remainingTime = Math.ceil(
        (timeWindow - (now - lastLoginAttempt.current)) / 1000 / 60
      );
      throw new Error(
        `Too many login attempts. Please try again in ${remainingTime} minutes.`
      );
    }
    loginAttempts.current++;
    lastLoginAttempt.current = now;
  };

  const checkAdminStatus = async (user) => {
    if (!user) return false;
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        return true;
      }
      if (user.email === import.meta.env.VITE_ADMIN_EMAIL) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser || null);
      setLoading(false);

      if (firebaseUser) {
        setIsAdminLoading(true);
        const isAdminUser = await checkAdminStatus(firebaseUser);
        setIsAdmin(isAdminUser);
        setIsAdminLoading(false);
      } else {
        setIsAdmin(false);
        setIsAdminLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    checkRateLimit();
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginAsAdmin = async (email, password) => {
    checkRateLimit();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const isAdminUser = await checkAdminStatus(userCredential.user);
    if (isAdminUser) {
      return { success: true };
    } else {
      await signOut(auth);
      return { success: false, error: "Not authorized as admin" };
    }
  };

  const logout = () => {
    signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isAdminLoading,
        login,
        loginAsAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
