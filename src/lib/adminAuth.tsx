import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User
} from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AdminUser, AdminRole } from '../types/admin';

interface AdminAuthContextType {
  user: User | null;
  adminData: AdminUser | null;
  role: AdminRole | null;
  isOwner: boolean;
  isStaff: boolean;
  loading: boolean;
  accessDenied: boolean;
  inactivityWarning: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminData, setAdminData] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [inactivityWarning, setInactivityWarning] = useState(false);

  const inactivityTimerRef = useRef<any>(null);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } finally {
      setUser(null);
      setAdminData(null);
      setAccessDenied(false);
      setInactivityWarning(false);
    }
  }, []);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    setInactivityWarning(false);

    if (user && adminData?.active) {
      inactivityTimerRef.current = setTimeout(() => {
        // Auto logout after 30 min of inactivity
        logout();
      }, INACTIVITY_TIMEOUT_MS);
    }
  }, [user, adminData, logout]);

  // Setup activity event listeners
  useEffect(() => {
    if (!user || !adminData?.active) return;

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    const handleActivity = () => resetInactivityTimer();

    events.forEach((ev) => window.addEventListener(ev, handleActivity, { passive: true }));
    resetInactivityTimer();

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [user, adminData, resetInactivityTimer]);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (!currentUser) {
        setUser(null);
        setAdminData(null);
        setAccessDenied(false);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      try {
        const adminDocRef = doc(db, 'admins', currentUser.uid);
        let adminSnap = await getDoc(adminDocRef);

        const userEmail = (currentUser.email || '').toLowerCase().trim();
        const isPrimaryOwner = userEmail === 'sangamtrial@gmail.com' || userEmail === 'sangamtrail@gmail.com' || userEmail === 'admin@bharatpathology.com';

        // Auto-bootstrap the primary owner if not already initialized
        if (!adminSnap.exists() && isPrimaryOwner) {
          try {
            await setDoc(adminDocRef, {
              uid: currentUser.uid,
              email: currentUser.email || userEmail,
              name: 'Sanjay Kumar (Owner)',
              role: 'owner',
              active: true,
              createdAt: new Date().toISOString()
            }, { merge: true });
            adminSnap = await getDoc(adminDocRef);
          } catch (initErr) {
            console.warn('Could not auto-write owner doc:', initErr);
          }
        }

        if (adminSnap.exists()) {
          const data = adminSnap.data() as Partial<AdminUser>;
          if (data.active || isPrimaryOwner) {
            setAdminData({
              uid: currentUser.uid,
              email: data.email || currentUser.email || '',
              name: data.name || (isPrimaryOwner ? 'Sanjay Kumar (Owner)' : 'Laboratory Administrator'),
              role: isPrimaryOwner ? 'owner' : ((data.role as AdminRole) || 'staff'),
              active: true,
              createdAt: data.createdAt || new Date().toISOString(),
              phone: data.phone || ''
            });
            setAccessDenied(false);
          } else {
            // Account marked inactive by owner
            setAdminData(null);
            setAccessDenied(true);
          }
        } else if (isPrimaryOwner) {
          // Fallback in-memory grant for primary owner
          setAdminData({
            uid: currentUser.uid,
            email: currentUser.email || userEmail,
            name: 'Sanjay Kumar (Owner)',
            role: 'owner',
            active: true,
            createdAt: new Date().toISOString()
          });
          setAccessDenied(false);
        } else {
          // User authenticated with Firebase, but no record in admins/{uid}
          setAdminData(null);
          setAccessDenied(true);
        }
      } catch (err) {
        console.warn('Admin record lookup error:', err);
        const userEmail = (currentUser.email || '').toLowerCase().trim();
        if (userEmail === 'sangamtrial@gmail.com' || userEmail === 'sangamtrail@gmail.com' || userEmail === 'admin@bharatpathology.com') {
          setAdminData({
            uid: currentUser.uid,
            email: currentUser.email || userEmail,
            name: 'Sanjay Kumar (Owner)',
            role: 'owner',
            active: true,
            createdAt: new Date().toISOString()
          });
          setAccessDenied(false);
        } else {
          setAdminData(null);
          setAccessDenied(true);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    setAccessDenied(false);
    const cleanEmail = email.trim();
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, pass);
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    const cleanEmail = email.trim();
    await sendPasswordResetEmail(auth, cleanEmail);
  };

  const isOwner = Boolean(adminData?.active && adminData?.role === 'owner');
  const isStaff = Boolean(adminData?.active && (adminData?.role === 'staff' || adminData?.role === 'owner'));

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        adminData,
        role: adminData?.role || null,
        isOwner,
        isStaff,
        loading,
        accessDenied,
        inactivityWarning,
        login,
        logout,
        resetPassword
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
