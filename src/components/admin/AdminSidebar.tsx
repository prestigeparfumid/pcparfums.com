import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PackageSearch, 
  ShoppingBag, 
  Images, 
  Settings, 
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, setIsOpen }) => {
  const { logout, adminData } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', end: true, icon: LayoutDashboard },
    { name: 'Pedidos', path: '/admin/pedidos', icon: ShoppingBag },
    { name: 'Productos', path: '/admin/productos', icon: PackageSearch },
    { name: 'Banners', path: '/admin/banners', icon: Images },
    { name: 'Configuración', path: '/admin/configuracion', icon: Settings },
  ];

  return (
    <>
      {/* Overlay Móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-primary-black/80 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-black border-r border-dark-grey flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Header Sidebar */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-dark-grey bg-primary-black shrink-0">
          <span className="font-serif text-sm font-bold text-pure-white uppercase tracking-widest line-clamp-2 leading-tight">
            {settings.name} <br/> <span className="text-mid-grey font-sans font-normal">ADMIN</span>
          </span>
          <button 
            className="lg:hidden text-mid-grey hover:text-pure-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-6 border-b border-dark-grey shrink-0">
          <p className="font-sans text-xs text-mid-grey uppercase tracking-wider mb-1">Usuario</p>
          <p className="font-sans text-sm text-pure-white truncate">{adminData?.email}</p>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 font-sans custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-none transition-colors ${
                    isActive 
                      ? 'bg-pure-white text-primary-black font-medium' 
                      : 'text-light-grey hover:bg-dark-grey hover:text-pure-white'
                  }`
                }
              >
                <Icon size={18} />
                <span className="text-sm tracking-wide">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-dark-grey shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-mid-grey hover:text-red-500 hover:bg-dark-grey transition-colors font-sans text-sm"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;