import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { ShoppingBag, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { db } from '@/firebase/config';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/utils/formatters';
import Skeleton from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        } else {
          toast.error("El producto no existe.");
          navigate('/catalogo');
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Error al cargar el producto.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton type="image" />
          <div className="space-y-6">
            <Skeleton type="title" />
            <Skeleton type="text" />
            <Skeleton type="text" />
            <Skeleton className="h-12 w-1/3 mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!product || !product.activo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="font-serif text-3xl text-pure-white mb-4">Producto no disponible</h2>
        <Link to="/catalogo" className="btn-primary mt-4">Volver al Catálogo</Link>
      </div>
    );
  }

  const allImages = [product.imagen, ...(product.imagenes || [])].filter(Boolean);
  const isOutOfStock = product.stock <= 0;

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > product.stock) {
        toast.error(`Solo hay ${product.stock} unidades disponibles.`);
        return product.stock;
      }
      return next;
    });
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    // Opcional: reiniciar cantidad tras añadir
    setQuantity(1);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="bg-primary-black min-h-screen py-12 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Back */}
        <Link to="/catalogo" className="inline-flex items-center text-mid-grey hover:text-pure-white transition-colors mb-10 font-sans text-sm uppercase tracking-widest">
          <ArrowLeft size={16} className="mr-2" />
          Volver al Catálogo
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Galería de Imágenes */}
          <div className="flex flex-col gap-4 select-none">
            {/* Imagen Principal */}
            <div className="relative aspect-[3/4] md:aspect-square bg-surface-black border border-dark-grey group">
              {product.precioAnterior && (
                <span className="absolute top-4 left-4 z-10 bg-pure-white text-primary-black text-xs font-bold px-4 py-2 uppercase tracking-widest">
                  Oferta
                </span>
              )}
              {isOutOfStock && (
                <span className="absolute top-4 left-4 z-10 bg-primary-black/80 backdrop-blur-sm border border-pure-white text-pure-white text-xs font-bold px-4 py-2 uppercase tracking-widest">
                  Agotado
                </span>
              )}
              
              <img 
                src={allImages[currentImageIndex]} 
                alt={product.nombre} 
                className="w-full h-full object-cover object-center animate-fade-in"
              />

              {/* Controles del Carrusel (si hay más de 1 imagen) */}
              {allImages.length > 1 && (
                <>
                  <button 
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-primary-black/50 hover:bg-pure-white hover:text-primary-black text-pure-white p-2 rounded-full backdrop-blur-sm transition-colors border border-dark-grey hover:border-pure-white opacity-0 group-hover:opacity-100"
                    onClick={() => setCurrentImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1)}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary-black/50 hover:bg-pure-white hover:text-primary-black text-pure-white p-2 rounded-full backdrop-blur-sm transition-colors border border-dark-grey hover:border-pure-white opacity-0 group-hover:opacity-100"
                    onClick={() => setCurrentImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1)}
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {allImages.map((img, idx) => (
                  <button 
                    key={idx}
                    className={`relative aspect-square border overflow-hidden ${
                      currentImageIndex === idx ? 'border-pure-white opacity-100' : 'border-dark-grey opacity-50 hover:opacity-100 transition-opacity'
                    }`}
                    onClick={() => setCurrentImageIndex(idx)}
                  >
                    <img src={img} alt={`${product.nombre} - ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del Producto */}
          <div className="flex flex-col">
            {product.marca && (
              <span className="text-mid-grey font-sans uppercase tracking-[0.2em] mb-2 block text-sm">
                {product.marca}
              </span>
            )}
            
            <h1 className="font-serif text-4xl md:text-5xl text-pure-white uppercase tracking-wider mb-4 leading-tight">
              {product.nombre}
            </h1>
            
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-dark-grey">
              <span className="text-2xl text-pure-white font-sans font-medium">
                {formatCurrency(product.precio)}
              </span>
              {product.precioAnterior && (
                <span className="text-lg text-mid-grey line-through font-sans">
                  {formatCurrency(product.precioAnterior)}
                </span>
              )}
            </div>

            <div className="font-sans text-light-grey mb-10 leading-relaxed whitespace-pre-wrap">
              {product.descripcion}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10 font-sans text-sm">
              {product.presentacion && (
                <div className="border border-dark-grey p-4 text-center">
                  <span className="block text-mid-grey uppercase tracking-widest text-xs mb-1">Presentación</span>
                  <span className="text-pure-white">{product.presentacion}</span>
                </div>
              )}
              {product.genero && (
                <div className="border border-dark-grey p-4 text-center">
                  <span className="block text-mid-grey uppercase tracking-widest text-xs mb-1">Género</span>
                  <span className="text-pure-white">{product.genero}</span>
                </div>
              )}
            </div>

            {/* Controles de Compra */}
            <div className="mt-auto">
              {isOutOfStock ? (
                <div className="bg-surface-black border border-dark-grey text-pure-white text-center py-4 px-6 font-sans uppercase tracking-widest mb-6">
                  Producto Agotado temporalmente
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center border border-dark-grey h-14">
                    <button 
                      onClick={() => handleQuantityChange(-1)}
                      className="px-6 text-pure-white hover:text-mid-grey h-full flex items-center justify-center transition-colors"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-sans text-pure-white">{quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(1)}
                      className="px-6 text-pure-white hover:text-mid-grey h-full flex items-center justify-center transition-colors"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={handleAddToCart}
                      className="btn-secondary flex items-center justify-center gap-2 h-14"
                    >
                      <ShoppingBag size={18} />
                      Añadir al Carrito
                    </button>
                    <button 
                      onClick={handleBuyNow}
                      className="btn-primary h-14"
                    >
                      Comprar Ahora
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Especificaciones */}
            {product.especificaciones && (
              <div className="mt-12 pt-12 border-t border-dark-grey">
                <h3 className="font-serif text-2xl text-pure-white uppercase tracking-widest mb-6">
                  Especificaciones
                </h3>
                <div className="font-sans text-sm text-mid-grey leading-relaxed whitespace-pre-wrap">
                  {product.especificaciones}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;