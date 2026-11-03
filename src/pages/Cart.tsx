import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/utils/formatters';

const Cart: React.FC = () => {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-primary-black">
        <h2 className="font-serif text-3xl md:text-4xl text-pure-white uppercase tracking-widest mb-6">
          Tu Carrito
        </h2>
        <p className="font-sans text-mid-grey mb-10">Tu carrito de compras está vacío.</p>
        <Link to="/catalogo" className="btn-primary">
          Descubrir Colección
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-primary-black min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl text-pure-white uppercase tracking-widest mb-12 border-b border-dark-grey pb-6">
          Carrito de Compras
        </h1>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Lista de Items */}
          <div className="flex-1">
            <div className="hidden md:grid grid-cols-12 text-mid-grey font-sans text-xs uppercase tracking-widest pb-4 border-b border-dark-grey mb-6">
              <div className="col-span-6">Producto</div>
              <div className="col-span-3 text-center">Cantidad</div>
              <div className="col-span-3 text-right">Subtotal</div>
            </div>

            <div className="space-y-6 md:space-y-0">
              {items.map((item) => (
                <div key={item.product.id} className="flex flex-col md:grid md:grid-cols-12 items-center gap-6 md:gap-4 py-6 border-b border-dark-grey border-opacity-50">
                  
                  {/* Info Producto */}
                  <div className="col-span-6 flex items-center w-full gap-4">
                    <Link to={`/producto/${item.product.id}`} className="w-24 h-32 flex-shrink-0 bg-surface-black overflow-hidden border border-dark-grey group">
                      <img 
                        src={item.product.imagen} 
                        alt={item.product.nombre} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </Link>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-mid-grey uppercase tracking-[0.2em] mb-1 font-sans">{item.product.marca}</span>
                      <Link to={`/producto/${item.product.id}`} className="font-serif text-lg text-pure-white hover:text-light-grey transition-colors line-clamp-2 leading-tight">
                        {item.product.nombre}
                      </Link>
                      {item.product.presentacion && (
                        <span className="text-sm text-dark-grey mt-1 font-sans">{item.product.presentacion}</span>
                      )}
                      <span className="text-pure-white mt-2 font-sans md:hidden">
                        {formatCurrency(item.product.precio)}
                      </span>
                    </div>
                  </div>

                  {/* Cantidad y Acciones */}
                  <div className="col-span-3 flex items-center justify-between md:justify-center w-full md:w-auto">
                    <div className="flex items-center border border-dark-grey">
                      <button 
                        onClick={() => updateQuantity(item.product.id!, item.quantity - 1)}
                        className="p-2 text-pure-white hover:bg-surface-black transition-colors"
                        aria-label="Disminuir"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-sans text-sm text-pure-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id!, item.quantity + 1)}
                        className="p-2 text-pure-white hover:bg-surface-black transition-colors disabled:opacity-50"
                        disabled={item.quantity >= item.product.stock}
                        aria-label="Aumentar"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item.product.id!)}
                      className="md:hidden text-mid-grey hover:text-red-500 transition-colors p-2"
                      aria-label="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Subtotal Item */}
                  <div className="col-span-3 flex justify-between md:justify-end items-center w-full md:w-auto">
                    <span className="text-mid-grey font-sans text-sm md:hidden uppercase tracking-wider">Subtotal:</span>
                    <div className="flex items-center gap-4">
                      <span className="font-sans text-pure-white">
                        {formatCurrency(item.product.precio * item.quantity)}
                      </span>
                      <button 
                        onClick={() => removeItem(item.product.id!)}
                        className="hidden md:block text-mid-grey hover:text-red-500 transition-colors"
                        title="Eliminar producto"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Resumen */}
          <div className="w-full lg:w-[380px] flex-shrink-0">
            <div className="bg-surface-black border border-dark-grey p-8 sticky top-32">
              <h2 className="font-serif text-2xl text-pure-white uppercase tracking-widest mb-6 pb-4 border-b border-dark-grey">
                Resumen
              </h2>
              
              <div className="space-y-4 mb-8 font-sans">
                <div className="flex justify-between text-light-grey text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-light-grey text-sm">
                  <span>Envío</span>
                  <span className="text-mid-grey text-xs italic">Calculado en el checkout</span>
                </div>
                <div className="pt-4 border-t border-dark-grey flex justify-between text-pure-white font-medium text-lg mt-4">
                  <span>Total Estimado</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Proceder al Pago
                <ArrowRight size={18} />
              </button>

              <div className="mt-6 flex items-center justify-center text-xs text-mid-grey font-sans uppercase tracking-widest gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Pago seguro contraentrega
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;