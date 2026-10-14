import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { AdminUser } from '@/types';

interface AuthContextProps {
  user: User | null;
  isAdmin: boolean;
  adminData: AdminUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAdmin: false,
  adminData: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminData, setAdminData] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Verificar en Firestore si el usuario está en la colección adminUsers
          const adminDocRef = doc(db, 'adminUsers', currentUser.uid);
          const adminDoc = await getDoc(adminDocRef);
          
          if (adminDoc.exists() && adminDoc.data().active === true) {
            setIsAdmin(true);
            setAdminData(adminDoc.data() as AdminUser);
          } else {
            // Si está autenticado pero no es admin o no está activo, le negamos los permisos
            setIsAdmin(false);
            setAdminData(null);
          }
        } catch (error) {
          console.error("Error verificando permisos administrativos:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
        setAdminData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, adminData, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};