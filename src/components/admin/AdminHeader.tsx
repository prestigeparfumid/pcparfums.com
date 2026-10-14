import React from 'react';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminHeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ setSidebarOpen }) => {
  return (
    <header className="h-20 bg-surface-black border-b border-dark-grey flex items-center justify-between px-4 sm:px-8 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-pure-white hover:text-mid-grey transition-colors p-2 -ml-2"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <Link 
          to="/" 
          target="_blank" 
          className="btn-secondary py-2 px-4 text-xs h-auto"
        >
          Ver Tienda
        </Link>
      </div>
    </header>
  );
};

export default AdminHeader;