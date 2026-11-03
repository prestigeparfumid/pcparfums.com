import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { CheckCircle, Truck, Package, Copy } from 'lucide-react';
import { db } from '@/firebase/config';
import { Order } from '@/types';
import { formatCurrency, translatePaymentMethod } from '@/utils/formatters';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

const OrderConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Este es el orderId legible, Ej: PED-20261014-ABCDE
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchOrder = async () => {
      if (!id) return;
      try {
        // En Firestore el document ID puede ser diferente al orderId, o igual. 
        // Si el backend guardó el document ID igual al orderId, hacemos getDoc:
        const orderRef = doc(db, 'orders', id);
        const docSnap = await getDoc(orderRef);
        
        if (docSnap.exists()) {
          setOrder(docSnap.data() as Order);
        } else {
          toast.error("No se encontró la información del pedido.");
        }
      } catch (error) {
        console.error("Error fetching order confirmation:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const copyToClipboard = () => {
    if (id) {
      navigator.clipboard.writeText(id);
      toast.success("Número de pedido copiado.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-primary-black">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-primary-black">
        <h2 className="font-serif text-3xl text-pure-white mb-4">Pedido no encontrado</h2>
        <p className="font-sans text-mid-grey mb-8">No pudimos cargar los detalles de este pedido.</p>
        <Link to="/catalogo" className="btn-primary">Ir al Catálogo</Link>
      </div>
    );
  }

  return (
    <div className="bg-primary-black min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-surface-black border border-dark-grey p-8 md:p-12 text-center animate-fade-in">
          <CheckCircle className="w-20 h-20 mx-auto text-pure-white mb-6" strokeWidth={1} />
          
          <h1 className="font-serif text-3xl md:text-5xl text-pure-white uppercase tracking-widest mb-4">
            ¡Gracias por tu compra!
          </h1>
          <p className="font-sans text-light-grey mb-10 text-sm md:text-base">
            Tu pedido ha sido recibido y está siendo procesado.
          </p>

          <div className="inline-flex items-center justify-center bg-primary-black border border-dark-grey px-6 py-4 mb-12 group relative">
            <div className="flex flex-col items-center">
              <span className="font-sans text-xs text-mid-grey uppercase tracking-widest mb-1">
                Número de Pedido
              </span>
              <div className="flex items-center gap-3">
                <span className="font-sans text-xl text-pure-white font-medium tracking-wider">
                  {order.orderId}
                </span>
                <button 
                  onClick={copyToClipboard}
                  className="text-mid-grey hover:text-pure-white transition-colors"
                  title="Copiar"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left font-sans text-sm mb-12">
            <div>
              <h3 className="text-pure-white uppercase tracking-widest border-b border-dark-grey pb-2 mb-4">
                Datos de Entrega
              </h3>
              <p className="text-light-grey mb-1">{order.customer.name}</p>
              <p className="text-mid-grey">{order.shipping.address}</p>
              <p className="text-mid-grey">{order.shipping.city}, {order.shipping.department}</p>
              {order.shipping.additionalInfo && (
                <p className="text-mid-grey italic mt-1">{order.shipping.additionalInfo}</p>
              )}
            </div>

            <div>
              <h3 className="text-pure-white uppercase tracking-widest border-b border-dark-grey pb-2 mb-4">
                Resumen Financiero
              </h3>
              <div className="flex justify-between text-mid-grey mb-1">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-mid-grey mb-1">
                <span>Envío:</span>
                <span>{order.shippingCost === 0 ? 'Gratis' : formatCurrency(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-pure-white font-medium mt-3 pt-2 border-t border-dark-grey">
                <span>Total:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
              <p className="text-mid-grey mt-3 text-xs uppercase tracking-wider">
                Método: {translatePaymentMethod(order.paymentMethod)}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 border-t border-dark-grey pt-10">
            <Link 
              to="/rastreo" 
              className="btn-primary flex justify-center items-center gap-2"
            >
              <Truck size={18} />
              Rastrear Pedido
            </Link>
            <Link 
              to="/catalogo" 
              className="btn-secondary flex justify-center items-center gap-2"
            >
              <Package size={18} />
              Seguir Comprando
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;