import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isOutOfStock) {
      addItem(product, 1);
    }
  };

  return (
    <Link 
      to={`/producto/${product.id}`} 
      className="group flex flex-col relative animate-fade-in"
    >
      {/* Contenedor de Imagen */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-black border border-dark-grey mb-6">
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {product.precioAnterior && (
            <span className="bg-pure-white text-primary-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
              Oferta
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-primary-black/80 backdrop-blur-sm border border-pure-white text-pure-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
              Agotado
            </span>
          )}
        </div>

        <img 
          src={product.imagen} 
          alt={`Perfume ${product.nombre} ${product.marca || ''}`} 
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Hover Acciones (Solo Escritorio) */}
        {!isOutOfStock && (
          <div className="absolute inset-0 bg-primary-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-end justify-center pb-6">
            <button 
              onClick={handleAddToCart}
              className="bg-pure-white text-primary-black font-sans font-medium uppercase tracking-wider text-xs px-6 py-3 hover:bg-light-grey transition-colors flex items-center gap-2"
            >
              <ShoppingBag size={16} />
              Añadir
            </button>
          </div>
        )}
      </div>

      {/* Info Producto */}
      <div className="flex flex-col flex-grow text-center">
        {product.marca && (
          <span className="text-mid-grey text-xs uppercase tracking-widest mb-2 font-sans">
            {product.marca}
          </span>
        )}
        <h3 className="font-serif text-lg text-pure-white leading-tight mb-2 group-hover:text-light-grey transition-colors line-clamp-2">
          {product.nombre}
        </h3>
        {product.presentacion && (
          <span className="text-dark-grey text-sm font-sans mb-3 block">
            {product.presentacion}
          </span>
        )}
        
        <div className="mt-auto pt-2 flex flex-col items-center justify-center gap-1 font-sans">
          <div className="flex items-center gap-3">
            <span className="text-pure-white font-medium">
              {formatCurrency(product.precio)}
            </span>
            {product.precioAnterior && (
              <span className="text-mid-grey text-sm line-through">
                {formatCurrency(product.precioAnterior)}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Botón Móvil */}
      {!isOutOfStock && (
        <button 
          onClick={handleAddToCart}
          className="mt-6 w-full border border-dark-grey text-pure-white py-3 font-sans text-xs uppercase tracking-widest hover:bg-pure-white hover:text-primary-black transition-colors md:hidden"
        >
          Añadir al carrito
        </button>
      )}
    </Link>
  );
};

export default ProductCard;