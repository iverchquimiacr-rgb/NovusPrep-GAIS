import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  paymentType: 'Semanal' | 'Mensual' | 'Unico' | 'Ninguno';
  purchasedFolders: string[];
  assignedFolders: number;
  baseAmount: number;
  paymentConfirmed: 'Confirmado' | 'Pendiente';
  status: 'Activo' | 'Inactivo';
  registrationDate: string;
  lastPaymentDate?: string;
  dueDate?: string;
  mustChoosePlan: boolean;
  discountApplied: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

const ADMIN_EMAILS = [
  "iverchquimiacr@gmail.com",
  "castroaquisesebastian@gmail.com"
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        const isAdminEmail = firebaseUser.email ? ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase()) : false;
        
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          // Auto-upgrade to admin if email matches and they aren't admin yet
          if (isAdminEmail && data.role !== 'admin') {
            await updateDoc(docRef, { role: 'admin' });
            setProfile({ ...data, role: 'admin' });
          } else {
            setProfile(data);
          }
        } else {
          // Create new user profile
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            role: isAdminEmail ? 'admin' : 'user',
            paymentType: 'Ninguno',
            purchasedFolders: [],
            assignedFolders: 0,
            baseAmount: 0,
            paymentConfirmed: 'Pendiente',
            status: 'Activo',
            registrationDate: new Date().toISOString(),
            mustChoosePlan: true,
            discountApplied: 0
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
