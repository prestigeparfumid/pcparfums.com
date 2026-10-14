import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Banner } from '@/types';
import Skeleton from '../ui/Skeleton';

const HeroBanner: React.FC = () => {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroBanner = async () => {
      try {
        // Quitamos el orderBy y limit de Firestore para evitar el error del índice
        const q = query(
          collection(db, 'banners'),
          where('activo', '==', true)
        );
        
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          // Convertimos los documentos a un array
          const bannersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Banner[];
          
          // Ordenamos el array en JavaScript de menor a mayor orden
          bannersList.sort((a, b) => (a.orden || 0) - (b.orden || 0));
          
          // Guardamos el primer banner de la lista ya ordenada
          setBanner(bannersList[0]);
        }
      } catch (error) {
        console.error("Error fetching hero banner:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroBanner();
  }, []);

  if (loading) {
    return <Skeleton type="banner" />;
  }

  // Fallback si no hay banner configurado en BD
  if (!banner) {
    return (
      <div className="relative w-full h-[70vh] md:h-[85vh] bg-surface-black flex items-center justify-center border-b border-dark-grey">
        <div className="text-center px-4 z-10">
          <h1 className="font-serif text-4xl md:text-6xl text-pure-white mb-6 uppercase tracking-widest">
            Prestige Parfum
          </h1>
          <p className="font-sans text-light-grey mb-8 tracking-wide max-w-lg mx-auto">
            Descubre nuestra colección exclusiva de fragancias.
          </p>
          <Link to="/catalogo" className="btn-primary">
            Explorar Colección
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden group">
      {/* Imagen de fondo (URL externa) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 group-hover:scale-105"
        style={{ backgroundImage: `url(${banner.imagen})` }}
      />
      
      {/* Overlay oscuro para legibilidad */}
      <div className="absolute inset-0 bg-primary-black/50 bg-gradient-to-t from-primary-black via-primary-black/20 to-transparent" />

      {/* Contenido */}
      <div className="absolute inset-0 flex items-center justify-center text-center px-4 sm:px-6 z-10">
        <div className="max-w-3xl animate-fade-in">
          {banner.subtitulo && (
            <span className="block font-sans text-xs md:text-sm text-pure-white uppercase tracking-[0.3em] mb-4">
              {banner.subtitulo}
            </span>
          )}
          
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-pure-white mb-6 leading-tight uppercase tracking-wide">
            {banner.titulo}
          </h1>
          
          {banner.descripcion && (
            <p className="font-sans text-sm md:text-base text-light-grey mb-10 tracking-wide max-w-xl mx-auto line-clamp-3">
              {banner.descripcion}
            </p>
          )}

          <Link to={banner.link || '/catalogo'} className="btn-primary">
            {banner.botonTexto || 'Descubrir'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;