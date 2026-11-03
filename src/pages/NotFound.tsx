import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="font-serif text-6xl md:text-8xl font-bold text-pure-white mb-6 tracking-wider">404</h1>
      <h2 className="font-serif text-2xl md:text-3xl text-light-grey mb-8">Página no encontrada</h2>
      <p className="font-sans text-mid-grey max-w-md mx-auto mb-12">
        Lo sentimos, la página que buscas no existe o ha sido movida. Continúa explorando nuestra colección.
      </p>
      <Link to="/" className="btn-primary">
        Volver al Inicio
      </Link>
    </div>
  );
};

export default NotFound;