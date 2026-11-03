import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { apiService } from '@/services/api';
import { translateOrderStatus, translatePaymentMethod, formatCurrency } from '@/utils/formatters';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

const OrderTracking: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !contactInfo.trim()) {
      toast.error("Por favor completa ambos campos.");
      return;
    }

    setLoading(true);
    setOrder(null);

    try {
      // Llamada al endpoint seguro en Vercel
      const result = await apiService.trackOrder(orderId.trim().toUpperCase(), contactInfo.trim());
      setOrder(result as Order);
    } catch (error: any) {
      toast.error(error.message || "No se encontró el pedido o los datos no coinciden.");
    } finally {
      setLoading(false);
    }
  };

  // Lógica de la línea de tiempo
  const stages: { status: OrderStatus; label: string; icon: any }[] = [
    { status: 'pending', label: 'Recibido', icon: Clock },
    { status: 'confirmed', label: 'Confirmado', icon: CheckCircle },
    { status: 'preparing', label: 'En Preparación', icon: Package },
    { status: 'shipped', label: 'Enviado', icon: Truck },
    { status: 'delivered', label: 'Entregado', icon: CheckCircle },
  ];

  const getStageIndex = (status: OrderStatus) => {
    // Si está cancelado, rompemos el flujo visual
    if (status === 'cancelled') return -1;
    // Map status complejos a stages simples
    if (status === 'ready') return 2; // lo agrupamos con preparing
    if (status === 'in_transit') return 3; // lo agrupamos con shipped
    return stages.findIndex(s => s.status === status);
  };

  return (
    <div className="bg-primary-black min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="font-serif text-3xl md:text-5xl text-pure-white uppercase tracking-widest mb-4">
            Rastreo de Pedidos
          </h1>
          <p className="font-sans text-mid-grey">
            Ingresa tu número de pedido y correo o teléfono para consultar el estado.
          </p>
        </div>

        {/* Formulario de Búsqueda */}
        <div className="bg-surface-black border border-dark-grey p-6 md:p-8 mb-12">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="label">Número de Pedido</label>
              <input 
                type="text" 
                className="input-field uppercase" 
                placeholder="Ej. PED-20261014-ABCDE"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label className="label">Correo o Teléfono</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="El mismo que usaste al comprar"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                required
              />
            </div>
            <div className="flex items-end">
              <button 
                type="submit" 
                className="btn-primary w-full md:w-auto h-12 flex justify-center items-center gap-2"
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="small" color="black" /> : (
                  <>
                    <Search size={18} />
                    Consultar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Resultados */}
        {order && (
          <div className="bg-surface-black border border-dark-grey p-6 md:p-10 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-dark-grey pb-6 mb-10 gap-4">
              <div>
                <span className="font-sans text-xs text-mid-grey uppercase tracking-widest block mb-1">
                  Pedido
                </span>
                <span className="font-sans text-xl text-pure-white tracking-wider">
                  {order.orderId}
                </span>
              </div>
              <div className="text-right">
                <span className={`inline-block px-4 py-2 font-sans text-xs font-bold uppercase tracking-widest ${
                  order.status === 'cancelled' 
                    ? 'bg-red-500/20 text-red-500 border border-red-500' 
                    : order.status === 'delivered'
                    ? 'bg-green-500/20 text-green-500 border border-green-500'
                    : 'bg-pure-white text-primary-black'
                }`}>
                  {translateOrderStatus(order.status)}
                </span>
              </div>
            </div>

            {order.status === 'cancelled' ? (
              <div className="text-center py-10 border-b border-dark-grey mb-10">
                <h3 className="font-serif text-2xl text-red-500 mb-2 uppercase tracking-widest">Pedido Cancelado</h3>
                <p className="font-sans text-mid-grey text-sm">Este pedido ha sido cancelado. Si tienes dudas, contáctanos vía WhatsApp.</p>
              </div>
            ) : (
              /* Línea de Tiempo */
              <div className="relative mb-16 px-4">
                <div className="absolute top-5 left-8 right-8 h-[2px] bg-dark-grey hidden md:block"></div>
                <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-0">
                  {stages.map((stage, index) => {
                    const currentIndex = getStageIndex(order.status);
                    const isCompleted = currentIndex >= index;
                    const isCurrent = currentIndex === index;
                    const Icon = stage.icon;

                    return (
                      <div key={index} className="flex md:flex-col items-center md:items-center gap-4 md:gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${
                          isCompleted 
                            ? 'bg-pure-white border-pure-white text-primary-black' 
                            : 'bg-primary-black border-dark-grey text-dark-grey'
                        }`}>
                          <Icon size={18} strokeWidth={isCompleted ? 2.5 : 1.5} />
                        </div>
                        <div className="md:text-center">
                          <span className={`font-sans text-xs uppercase tracking-widest block ${
                            isCurrent ? 'text-pure-white font-bold' : isCompleted ? 'text-light-grey' : 'text-dark-grey'
                          }`}>
                            {stage.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Detalles del Pedido */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <h3 className="font-serif text-xl text-pure-white uppercase tracking-widest mb-6">Productos</h3>
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-dark-grey pb-4">
                      <div className="font-sans text-sm">
                        <p className="text-pure-white">{item.productName}</p>
                        <p className="text-mid-grey text-xs mt-1">Cant: {item.quantity} {item.presentation ? `| ${item.presentation}` : ''}</p>
                      </div>
                      <span className="font-sans text-pure-white text-sm">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-primary-black p-6 border border-dark-grey font-sans text-sm h-fit">
                <h3 className="font-serif text-lg text-pure-white uppercase tracking-widest mb-4">Resumen</h3>
                <div className="space-y-2 text-light-grey mb-4 border-b border-dark-grey pb-4">
                  <div className="flex justify-between">
                    <span>Dirección:</span>
                    <span className="text-right">{order.shipping.address}, {order.shipping.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pago:</span>
                    <span className="text-right">{translatePaymentMethod(order.paymentMethod)}</span>
                  </div>
                </div>
                <div className="space-y-2 text-light-grey">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío:</span>
                    <span>{order.shippingCost === 0 ? 'Gratis' : formatCurrency(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-pure-white font-medium text-lg pt-4">
                    <span>Total:</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
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