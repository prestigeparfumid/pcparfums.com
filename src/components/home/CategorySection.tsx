import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  {
    name: 'Hombre',
    path: '/catalogo?categoria=Hombre',
    // Usar URLs de placeholders limpios (el admin los reemplazará con fotos reales)
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop'
  },
  {
    name: 'Mujer',
    path: '/catalogo?categoria=Mujer',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=800&auto=format&fit=crop'
  },
  {
    name: 'Unisex',
    path: '/catalogo?categoria=Unisex',
    image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=800&auto=format&fit=crop'
  }
];

const CategorySection: React.FC = () => {
  return (
    <section className="py-20 bg-primary-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl text-pure-white uppercase tracking-widest mb-4">
            Categorías
          </h2>
          <div className="w-16 h-[1px] bg-dark-grey mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat, index) => (
            <Link 
              key={index} 
              to={cat.path}
              className="group relative h-96 overflow-hidden block border border-dark-grey"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${cat.image})` }}
              />
              <div className="absolute inset-0 bg-primary-black/40 group-hover:bg-primary-black/60 transition-colors duration-300" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="font-serif text-2xl text-pure-white uppercase tracking-widest mb-4">
                    {cat.name}
                  </h3>
                  <span className="inline-block font-sans text-xs text-pure-white uppercase tracking-[0.2em] border-b border-transparent group-hover:border-pure-white transition-colors duration-300 pb-1">
                    Explorar
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;