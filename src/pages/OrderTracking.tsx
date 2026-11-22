import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Order, OrderStatus } from '@/types';
import { formatCurrency, translateOrderStatus, translatePaymentMethod } from '@/utils/formatters';
import {
  Search,
  Package,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  MapPin,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const ORDER_STEPS: { key: OrderStatus[]; label: string; description: string; icon: React.ElementType }[] = [
  {
    key: ['pending'],
    label: 'Pedido Recibido',
    description: 'Hemos recibido tu solicitud y estamos validando los datos.',
    icon: Clock,
  },
  {
    key: ['confirmed'],
    label: 'Confirmado',
    description: 'Tu pedido ha sido confirmado y asignado a despacho.',
    icon: CheckCircle2,
  },
  {
    key: ['preparing', 'ready'],
    label: 'En Preparación',
    description: 'Estamos alistando y verificando tus fragancias.',
    icon: Sparkles,
  },
  {
    key: ['shipped', 'in_transit'],
    label: 'En Camino',
    description: 'Tu paquete va en ruta hacia la dirección de entrega.',
    icon: Truck,
  },
  {
    key: ['delivered'],
    label: 'Entregado',
    description: 'El pedido fue entregado con éxito.',
    icon: Package,
  },
];

const OrderTracking: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchOrder = async (rawId: string) => {
    const cleanId = rawId.trim();
    if (!cleanId) {
      toast.error('Por favor ingresa un número de pedido.');
      return;
    }

    setLoading(true);
    setSearched(true);
    setOrder(null);

    try {
      // 1. Intentar buscar directamente por ID de documento en Firestore
      const docRef = doc(db, 'orders', cleanId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
        setLoading(false);
        return;
      }

      // 2. Si no coincide con el ID del documento, buscar por el campo interno 'orderId'
      const ordersRef = collection(db, 'orders');
      const qExact = query(ordersRef, where('orderId', '==', cleanId));
      const snapExact = await getDocs(qExact);

      if (!snapExact.empty) {
        const found = snapExact.docs[0];
        setOrder({ id: found.id, ...found.data() } as Order);
        setLoading(false);
        return;
      }

      // 3. Intentar en mayúsculas por si el cliente escribió el código en minúsculas
      const qUpper = query(ordersRef, where('orderId', '==', cleanId.toUpperCase()));
      const snapUpper = await getDocs(qUpper);

      if (!snapUpper.empty) {
        const found = snapUpper.docs[0];
        setOrder({ id: found.id, ...found.data() } as Order);
      } else {
        toast.error('No encontramos ningún pedido con ese código.');
      }
    } catch (error) {
      console.error('Error al buscar pedido:', error);
      toast.error('Ocurrió un error al consultar el pedido.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setSearchInput(idFromUrl);
      fetchOrder(idFromUrl);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = searchInput.trim();
    if (!cleanId) return;
    setSearchParams({ id: cleanId });
    fetchOrder(cleanId);
  };

  const getActiveStepIndex = (status?: OrderStatus): number => {
    if (!status || status === 'cancelled') return -1;
    return ORDER_STEPS.findIndex((step) => step.key.includes(status));
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'Fecha no disponible';
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  const activeStep = getActiveStepIndex(order?.status);
  const displayOrderId = order?.orderId || order?.id || '';

  return (
    <div className="min-h-screen bg-primary-black text-pure-white pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Volver */}
        <div>
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-mid-grey hover:text-pure-white transition-colors"
          >
            <ArrowLeft size={14} />
            Volver al Catálogo
          </Link>
        </div>

        {/* Encabezado */}
        <div className="text-center space-y-3 border-b border-dark-grey pb-8">
          <h1 className="font-serif text-3xl md:text-4xl uppercase tracking-widest text-pure-white">
            Rastreo de Pedido
          </h1>
          <p className="text-sm font-sans text-mid-grey max-w-md mx-auto">
            Ingresa el código de referencia de tu orden para conocer el estado actual de tu envío en tiempo real.
          </p>
        </div>

        {/* Formulario de Búsqueda */}
        <form onSubmit={handleSubmit} className="bg-surface-black border border-dark-grey p-6">
          <label
            htmlFor="order-id-input"
            className="block text-xs font-sans uppercase tracking-widest text-light-grey mb-3"
          >
            Número de Pedido / Referencia
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mid-grey"
                size={18}
              />
              <input
                id="order-id-input"
                type="text"
                placeholder="Ej: Ord-12345 o ID de referencia"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-primary-black border border-dark-grey py-3 pl-11 pr-4 text-sm font-sans text-pure-white placeholder-mid-grey focus:outline-none focus:border-pure-white transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-pure-white text-primary-black font-sans text-xs font-bold uppercase tracking-widest px-8 py-3 hover:bg-light-grey transition-colors disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Consultar'}
            </button>
          </div>
        </form>

        {/* Estado: No encontrado */}
        {!loading && searched && !order && (
          <div className="bg-surface-black border border-dark-grey p-8 text-center space-y-3">
            <XCircle className="mx-auto text-mid-grey" size={32} strokeWidth={1.5} />
            <h2 className="font-serif text-lg uppercase tracking-widest text-pure-white">
              Pedido no encontrado
            </h2>
            <p className="text-sm font-sans text-mid-grey max-w-md mx-auto">
              Verifica que el código esté escrito exactamente como aparece en tu confirmación de compra o contáctanos por WhatsApp para ayudarte.
            </p>
          </div>
        )}

        {/* Resultado del Pedido */}
        {!loading && order && (
          <div className="space-y-6 animate-fade-in">
            {/* Cabecera del Pedido */}
            <div className="bg-surface-black border border-dark-grey p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-xs font-sans uppercase tracking-widest text-mid-grey">
                  Referencia de Orden
                </p>
                <p className="font-serif text-xl text-pure-white mt-1 break-all">
                  {displayOrderId}
                </p>
                <p className="text-xs font-sans text-mid-grey mt-1">
                  Realizado el {formatDate(order.createdAt)}
                </p>
              </div>

              <div className="sm:text-right">
                <span
                  className={`inline-block px-3 py-1.5 border text-xs font-sans font-bold uppercase tracking-widest ${
                    order.status === 'delivered'
                      ? 'border-green-500/50 text-green-400 bg-green-500/10'
                      : order.status === 'cancelled'
                      ? 'border-red-500/50 text-red-400 bg-red-500/10'
                      : 'border-pure-white/40 text-pure-white bg-primary-black'
                  }`}
                >
                  {translateOrderStatus(order.status || 'pending')}
                </span>
              </div>
            </div>

            {/* Línea de Tiempo / Estado */}
            <div className="bg-surface-black border border-dark-grey p-6">
              <h2 className="font-serif text-sm uppercase tracking-widest text-pure-white mb-6 border-b border-dark-grey pb-3">
                Estado del Envío
              </h2>

              {order.status === 'cancelled' ? (
                <div className="flex items-start gap-4 p-4 bg-red-950/20 border border-red-500/30">
                  <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={22} />
                  <div>
                    <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-red-400">
                      Pedido Cancelado
                    </h3>
                    <p className="font-sans text-xs text-light-grey mt-1">
                      Esta orden fue cancelada. Si tienes dudas o deseas reactivarla, comunícate con nuestro equipo de atención.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {ORDER_STEPS.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = activeStep >= index;
                    const isCurrent = activeStep === index;

                    return (
                      <div key={step.label} className="flex items-start gap-4 relative">
                        <div
                          className={`w-9 h-9 flex items-center justify-center border flex-shrink-0 transition-colors ${
                            isCompleted
                              ? 'bg-pure-white text-primary-black border-pure-white'
                              : 'bg-primary-black text-mid-grey border-dark-grey'
                          }`}
                        >
                          <Icon size={18} />
                        </div>

                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`font-sans text-sm uppercase tracking-wider font-semibold ${
                                isCompleted ? 'text-pure-white' : 'text-mid-grey'
                              }`}
                            >
                              {step.label}
                            </h3>
                            {isCurrent && (
                              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 bg-pure-white/10 text-pure-white border border-pure-white/20">
                                Actual
                              </span>
                            )}
                          </div>
                          <p className="font-sans text-xs text-mid-grey mt-1">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Resumen de Entrega y Productos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Datos de Entrega */}
              <div className="bg-surface-black border border-dark-grey p-6 space-y-4">
                <h2 className="font-serif text-sm uppercase tracking-widest text-pure-white border-b border-dark-grey pb-3 flex items-center gap-2">
                  <MapPin size={16} />
                  Datos de Entrega
                </h2>
                <div className="space-y-2 text-sm font-sans">
                  <p className="text-pure-white font-medium">
                    {order.customer?.name || 'Cliente'}
                  </p>
                  {order.customer?.phone && (
                    <p className="text-mid-grey text-xs">Tel: {order.customer.phone}</p>
                  )}
                  {order.customer?.city && (
                    <p className="text-light-grey text-xs">
                      Ciudad: {order.customer.city}
                    </p>
                  )}
                  {order.customer?.address && (
                    <p className="text-light-grey text-xs">
                      Dirección: {order.customer.address}
                    </p>
                  )}
                  <div className="pt-2 border-t border-dark-grey/60">
                    <p className="text-xs text-mid-grey uppercase tracking-wider">
                      Método de Pago
                    </p>
                    <p className="text-xs text-pure-white uppercase mt-0.5">
                      {translatePaymentMethod(order.paymentMethod)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Resumen de Fragancias */}
              <div className="bg-surface-black border border-dark-grey p-6 flex flex-col justify-between">
                <div>
                  <h2 className="font-serif text-sm uppercase tracking-widest text-pure-white border-b border-dark-grey pb-3 mb-4">
                    Artículos ({(order.items || []).length})
                  </h2>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {(order.items || []).map((item: any, idx: number) => (
                      <div
                        key={item.id || idx}
                        className="flex justify-between items-start text-xs font-sans border-b border-dark-grey/40 pb-2"
                      >
                        <div>
                          <p className="text-pure-white font-medium">
                            {item.name || 'Producto'}
                          </p>
                          <p className="text-mid-grey">Cantidad: {item.quantity || 1}</p>
                        </div>
                        <p className="text-light-grey">
                          {formatCurrency((item.price || 0) * (item.quantity || 1))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-dark-grey flex justify-between items-center">
                  <span className="font-sans text-xs uppercase tracking-widest text-mid-grey">
                    Total
                  </span>
                  <span className="font-serif text-lg text-pure-white">
                    {formatCurrency(order.total || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;