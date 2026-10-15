import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import LoadingSpinner from '@/components/LoadingSpinner';

const AdminLayout: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Si terminó de cargar y no hay usuario o no es admin, fuera.
    if (!loading) {
      if (!user || !isAdmin) {
        navigate('/admin/login', { replace: true, state: { from: location } });
      }
    }
  }, [user, isAdmin, loading, navigate, location]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-primary-black flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-primary-black overflow-hidden font-sans">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1C1C1C',
            color: '#FFFFFF',
            border: '1px solid #292929',
            fontFamily: '"DM Sans", sans-serif',
            borderRadius: '0px',
          },
          success: { iconTheme: { primary: '#FFFFFF', secondary: '#1C1C1C' } },
        }}
      />
      
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-primary-black p-4 sm:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;