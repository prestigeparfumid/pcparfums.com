import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';

const Footer: React.FC = () => {
  const { settings } = useSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-black border-t border-dark-grey pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Columna 1: Marca */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            {settings.branding.logoUrl ? (
              <img 
                src={settings.branding.logoUrl} 
                alt={settings.name} 
                className="h-10 w-auto mb-6 object-contain opacity-80"
              />
            ) : (
              <h3 className="font-serif text-2xl font-bold tracking-widest text-pure-white uppercase mb-6">
                {settings.name}
              </h3>
            )}
            <p className="text-mid-grey font-sans text-sm max-w-xs">
              {settings.description || 'Exclusividad y elegancia en cada fragancia. Colección premium de perfumes.'}
            </p>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="font-sans text-pure-white font-medium uppercase tracking-widest text-sm mb-6">Explorar</h4>
            <ul className="space-y-4 text-mid-grey text-sm">
              <li>
                <Link to="/catalogo" className="hover:text-pure-white transition-colors">Catálogo Completo</Link>
              </li>
              <li>
                <Link to="/catalogo?genero=Hombre" className="hover:text-pure-white transition-colors">Perfumes para Hombre</Link>
              </li>
              <li>
                <Link to="/catalogo?genero=Mujer" className="hover:text-pure-white transition-colors">Perfumes para Mujer</Link>
              </li>
              <li>
                <Link to="/rastreo" className="hover:text-pure-white transition-colors">Rastrear mi Pedido</Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="font-sans text-pure-white font-medium uppercase tracking-widest text-sm mb-6">Atención al Cliente</h4>
            <ul className="space-y-4 text-mid-grey text-sm">
              {settings.contact.email && (
                <li><a href={`mailto:${settings.contact.email}`} className="hover:text-pure-white transition-colors">{settings.contact.email}</a></li>
              )}
              {settings.contact.whatsapp && (
                <li>WhatsApp: <a href={`https://wa.me/${settings.contact.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-pure-white transition-colors">+{settings.contact.whatsapp}</a></li>
              )}
              {settings.contact.address && (
                <li>{settings.contact.address}, {settings.contact.city}</li>
              )}
            </ul>
            
            {/* Redes Sociales */}
            <div className="flex space-x-4 mt-6">
              {settings.social.instagram && (
                <a href={settings.social.instagram} target="_blank" rel="noopener noreferrer" className="text-mid-grey hover:text-pure-white transition-colors">IG</a>
              )}
              {settings.social.facebook && (
                <a href={settings.social.facebook} target="_blank" rel="noopener noreferrer" className="text-mid-grey hover:text-pure-white transition-colors">FB</a>
              )}
              {settings.social.tiktok && (
                <a href={settings.social.tiktok} target="_blank" rel="noopener noreferrer" className="text-mid-grey hover:text-pure-white transition-colors">TK</a>
              )}
            </div>
          </div>

        </div>

        <div className="border-t border-dark-grey pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-mid-grey text-xs font-sans mb-4 md:mb-0">
            &copy; {currentYear} {settings.name}. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6 text-xs text-mid-grey font-sans">
            <span className="hover:text-pure-white transition-colors cursor-pointer">Políticas de Envío</span>
            <span className="hover:text-pure-white transition-colors cursor-pointer">Términos y Condiciones</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;