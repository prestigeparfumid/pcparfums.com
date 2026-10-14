import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Product } from '@/types';
import HeroBanner from '@/components/home/HeroBanner';
import CategorySection from '@/components/home/CategorySection';
import BenefitsSection from '@/components/home/BenefitsSection';
import ProductGrid from '@/components/catalog/ProductGrid';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Para el SEO dinámico en React, el título se maneja en SettingsContext, 
    // pero aseguramos que la vista inicie arriba
    window.scrollTo(0, 0);

    const fetchFeatured = async () => {
      try {
        const q = query(
          collection(db, 'products'),
          where('activo', '==', true),
          where('destacado', '==', true),
          limit(4)
        );
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error cargando destacados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="w-full">
      {/* 1. Hero Banner Configurable */}
      <HeroBanner />

      {/* 2. Categorías Principales */}
      <CategorySection />

      {/* 3. Productos Destacados */}
      <section className="py-24 bg-primary-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-pure-white uppercase tracking-widest mb-4">
                Colección Destacada
              </h2>
              <div className="w-16 h-[1px] bg-pure-white"></div>
            </div>
            <Link 
              to="/catalogo" 
              className="font-sans text-sm text-mid-grey hover:text-pure-white uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              Ver todo el catálogo
              <span className="text-lg">→</span>
            </Link>
          </div>

          <ProductGrid 
            products={featuredProducts} 
            loading={loading} 
            skeletonCount={4} 
          />
        </div>
      </section>

      {/* 4. Beneficios de Marca */}
      <BenefitsSection />
    </div>
  );
};

export default Home;