import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import ProductGrid from '@/components/catalog/ProductGrid';

const Catalog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('categoria') || 'Todos';
  
  // Custom hook para traer TODOS los productos activos
  // Optimizamos filtrado en frontend para una UX más fluida sin gastar lecturas extra en BD.
  const { products, loading } = useProducts({ onlyActive: true });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedGender, setSelectedGender] = useState('Todos');
  const [sortOption, setSortOption] = useState('name-asc');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync state con URL cuando cambia params externos
  useEffect(() => {
    const cat = searchParams.get('categoria');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Lógica de Filtrado y Ordenamiento
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Búsqueda
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.nombre.toLowerCase().includes(lowerTerm) || 
        (p.marca && p.marca.toLowerCase().includes(lowerTerm))
      );
    }

    // Categoría
    if (selectedCategory !== 'Todos') {
      result = result.filter(p => p.categoria === selectedCategory);
    }

    // Género
    if (selectedGender !== 'Todos') {
      result = result.filter(p => p.genero === selectedGender);
    }

    // Ordenamiento
    switch (sortOption) {
      case 'price-asc':
        result.sort((a, b) => a.precio - b.precio);
        break;
      case 'price-desc':
        result.sort((a, b) => b.precio - a.precio);
        break;
      case 'name-asc':
        result.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'name-desc':
        result.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      default:
        break;
    }

    return result;
  }, [products, searchTerm, selectedCategory, selectedGender, sortOption]);

  const categories = ['Todos', 'Hombre', 'Mujer', 'Unisex', 'Sets', 'Ofertas'];
  const genders = ['Todos', 'Hombre', 'Mujer', 'Unisex'];

  const FiltersContent = () => (
    <div className="space-y-8">
      {/* Categorías */}
      <div>
        <h4 className="font-serif text-lg text-pure-white uppercase tracking-widest mb-4">Categoría</h4>
        <ul className="space-y-3 font-sans text-sm">
          {categories.map(cat => (
            <li key={cat}>
              <button 
                onClick={() => {
                  setSelectedCategory(cat);
                  // Actualizar URL sin recargar
                  if (cat === 'Todos') searchParams.delete('categoria');
                  else searchParams.set('categoria', cat);
                  setSearchParams(searchParams);
                }}
                className={`transition-colors uppercase tracking-wider ${selectedCategory === cat ? 'text-pure-white font-bold' : 'text-mid-grey hover:text-light-grey'}`}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Género */}
      <div>
        <h4 className="font-serif text-lg text-pure-white uppercase tracking-widest mb-4">Género</h4>
        <ul className="space-y-3 font-sans text-sm">
          {genders.map(gen => (
            <li key={gen}>
              <button 
                onClick={() => setSelectedGender(gen)}
                className={`transition-colors uppercase tracking-wider ${selectedGender === gen ? 'text-pure-white font-bold' : 'text-mid-grey hover:text-light-grey'}`}
              >
                {gen}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="bg-primary-black min-h-screen pb-24">
      {/* Header Catálogo */}
      <div className="bg-surface-black border-b border-dark-grey py-16 text-center px-4">
        <h1 className="font-serif text-4xl md:text-5xl text-pure-white uppercase tracking-widest mb-4">
          Catálogo
        </h1>
        <p className="font-sans text-mid-grey tracking-wide">
          Descubre nuestra selección exclusiva.
        </p>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FiltersContent />
          </aside>

          {/* Contenido Principal */}
          <div className="flex-1">
            {/* Barra de Búsqueda y Ordenamiento */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 pb-6 border-b border-dark-grey">
              
              {/* Buscador */}
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-mid-grey" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar perfume o marca..." 
                  className="input-field pl-12"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex w-full md:w-auto items-center gap-4">
                {/* Botón Filtros Móvil */}
                <button 
                  className="lg:hidden flex-1 btn-secondary flex items-center justify-center gap-2"
                  onClick={() => setShowMobileFilters(true)}
                >
                  <SlidersHorizontal size={18} />
                  Filtros
                </button>

                {/* Ordenar */}
                <select 
                  className="flex-1 md:w-auto bg-transparent border border-dark-grey text-pure-white px-4 py-3 font-sans text-sm uppercase tracking-wider focus:outline-none focus:border-pure-white"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="name-asc" className="bg-primary-black">A-Z</option>
                  <option value="name-desc" className="bg-primary-black">Z-A</option>
                  <option value="price-asc" className="bg-primary-black">Menor Precio</option>
                  <option value="price-desc" className="bg-primary-black">Mayor Precio</option>
                </select>
              </div>
            </div>

            {/* Grid de Productos */}
            <ProductGrid 
              products={filteredAndSortedProducts} 
              loading={loading} 
            />
          </div>
        </div>
      </div>

      {/* Modal de Filtros Móvil */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-primary-black/80 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)}></div>
          <div className="relative ml-auto w-[80%] max-w-sm h-full bg-surface-black border-l border-dark-grey p-6 overflow-y-auto animate-fade-in">
            <button 
              className="absolute top-6 right-6 text-pure-white"
              onClick={() => setShowMobileFilters(false)}
            >
              <X size={24} />
            </button>
            <h3 className="font-serif text-2xl text-pure-white uppercase tracking-widest mb-10 border-b border-dark-grey pb-4">
              Filtros
            </h3>
            <FiltersContent />
            <div className="mt-12 pt-6 border-t border-dark-grey">
              <button 
                className="btn-primary w-full"
                onClick={() => setShowMobileFilters(false)}
              >
                Ver Resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;