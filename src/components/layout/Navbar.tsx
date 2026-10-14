import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { settings } = useSettings();
  const location = useLocation();

  // Cambiar navbar al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Catálogo', path: '/catalogo' },
    { name: 'Contacto', path: '/contacto' },
  ];

  return (
    <nav 
      className={`fixed w-full z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-primary-black/95 backdrop-blur-md py-4 shadow-lg border-b border-dark-grey' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Menú Móvil - Botón */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-pure-white hover:text-light-grey transition-colors p-2"
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center md:justify-start w-full md:w-auto absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
            <Link to="/" className="flex items-center">
              {settings.branding.logoUrl ? (
                <img 
                  src={settings.branding.logoUrl} 
                  alt={settings.name} 
                  className="h-8 md:h-10 w-auto object-contain"
                />
              ) : (
                <span className="font-serif text-2xl md:text-3xl font-bold tracking-widest text-pure-white uppercase">
                  {settings.name}
                </span>
              )}
            </Link>
          </div>

          {/* Enlaces de Escritorio */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-sans uppercase tracking-widest transition-colors duration-300 hover:text-mid-grey relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-pure-white after:transition-all after:duration-300 hover:after:w-full ${
                  location.pathname === link.path ? 'text-pure-white after:w-full' : 'text-light-grey'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Iconos Derecha (Carrito y Admin) */}
          <div className="flex items-center space-x-4 md:space-x-6">
            <Link 
              to="/admin/login" 
              className="text-pure-white hover:text-mid-grey transition-colors"
              aria-label="Panel Administrativo"
            >
              <User size={20} strokeWidth={1.5} />
            </Link>
            <Link 
              to="/carrito" 
              className="text-pure-white hover:text-mid-grey transition-colors relative group"
              aria-label="Carrito de compras"
            >
              <ShoppingBag size={24} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-pure-white text-primary-black text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Menú Móvil - Contenido */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-surface-black/95 backdrop-blur-xl border-b border-dark-grey transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-6 space-y-4 flex flex-col items-center">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block text-lg font-serif uppercase tracking-widest ${
                location.pathname === link.path ? 'text-pure-white' : 'text-light-grey'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;