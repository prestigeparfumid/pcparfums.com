import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { StoreSettings, defaultStoreSettings } from '@/types';

interface SettingsContextProps {
  settings: StoreSettings;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextProps>({
  settings: defaultStoreSettings,
  loading: true,
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuchar cambios en tiempo real en la configuración de la tienda
    const settingsRef = doc(db, 'settings', 'store');
    
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as StoreSettings;
        // Merge con los defaults para evitar errores si faltan campos en BD
        setSettings({ ...defaultStoreSettings, ...data });
        
        // Actualizar Favicon y Título dinámicamente
        if (data.branding?.faviconUrl) {
          const favicon = document.getElementById('dynamic-favicon') as HTMLLinkElement;
          if (favicon) favicon.href = data.branding.faviconUrl;
        }
        if (data.name) {
          document.title = data.name;
        }
      } else {
        // Si no existe el documento, usamos los defaults
        console.warn("Documento settings/store no encontrado. Usando defaults.");
      }
      setLoading(false);
    }, (error) => {
      console.error("Error cargando configuración:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};