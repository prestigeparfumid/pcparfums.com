import React from 'react';
import ProductCard from './ProductCard';
import Skeleton from '../ui/Skeleton';
import { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  skeletonCount?: number;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  loading = false, 
  skeletonCount = 8 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Skeleton key={index} type="card" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dark-grey bg-surface-black/30">
        <p className="font-serif text-2xl text-pure-white mb-4">No se encontraron productos</p>
        <p className="font-sans text-mid-grey">Intenta ajustar los filtros o buscar con otros términos.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;