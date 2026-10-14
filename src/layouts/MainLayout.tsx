import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useSettings } from '@/context/SettingsContext';
import LoadingSpinner from '@/components/LoadingSpinner';

const MainLayout: React.FC = () => {
  const { loading } = useSettings();

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-black flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Toast configurado con los colores de la marca */}
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1C1C1C',
            color: '#FFFFFF',
            border: '1px solid #292929',
            fontFamily: '"DM Sans", sans-serif',
            borderRadius: '0px',
          },
          success: {
            iconTheme: {
              primary: '#FFFFFF',
              secondary: '#1C1C1C',
            },
          },
        }}
      />
      <Navbar />
      <main className="flex-grow pt-[80px]"> {/* Offset para el navbar fijo */}
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default MainLayout;