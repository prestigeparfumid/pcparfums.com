import React from 'react';
import { X } from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { formatCurrency, translateOrderStatus, translatePaymentMethod } from '@/utils/formatters';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: string, docId: string, status: OrderStatus) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose, onStatusChange }) => {
  
  const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-primary-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Contenedor Modal */}
      <div className="relative bg-surface-black border border-dark-grey w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center p-6 border-b border-dark-grey shrink-0 bg-primary-black">
          <div>
            <h2 className="font-serif text-2xl text-pure-white uppercase tracking-widest leading-none">
              Pedido {order.orderId}
            </h2>
            <p className="font-sans text-mid-grey text-xs mt-2">
              {date.toLocaleString('es-CO')}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-mid-grey hover:text-pure-white transition-colors p-2 bg-surface-black border border-dark-grey"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6 overflow-y-auto custom-scrollbar font-sans text-sm space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Info Cliente */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg text-pure-white border-b border-dark-grey pb-2 uppercase tracking-widest">Cliente</h3>
              <div>
                <p className="text-light-grey mb-1"><span className="text-mid-grey inline-block w-20">Nombre:</span> {order.customer.name}</p>
                <p className="text-light-grey mb-1"><span className="text-mid-grey inline-block w-20">Email:</span> {order.customer.email}</p>
                <p className="text-light-grey mb-1"><span className="text-mid-grey inline-block w-20">Teléfono:</span> {order.customer.phone}</p>
              </div>
            </div>

            {/* Info Envío */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg text-pure-white border-b border-dark-grey pb-2 uppercase tracking-widest">Entrega</h3>
              <div>
                <p className="text-light-grey mb-1"><span className="text-mid-grey inline-block w-20">Dirección:</span> {order.shipping.address}</p>
                <p className="text-light-grey mb-1"><span className="text-mid-grey inline-block w-20">Ciudad:</span> {order.shipping.city}, {order.shipping.department}</p>
                {order.shipping.additionalInfo && (
                  <p className="text-light-grey mb-1"><span className="text-mid-grey inline-block w-20">Notas:</span> {order.shipping.additionalInfo}</p>
                )}
              </div>
            </div>
          </div>

          {/* Info Pago y Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-primary-black p-4 border border-dark-grey">
            <div>
              <span className="text-mid-grey block text-xs uppercase tracking-widest mb-1">Método de Pago</span>
              <span className="text-pure-white font-medium">{translatePaymentMethod(order.paymentMethod)}</span>
            </div>
            <div>
              <span className="text-mid-grey block text-xs uppercase tracking-widest mb-1">Cambiar Estado</span>
              <select
                className="w-full max-w-[200px] bg-surface-black border border-dark-grey py-2 px-3 text-sm font-sans focus:outline-none focus:border-pure-white text-pure-white mt-1"
                value={order.status}
                onChange={(e) => onStatusChange(order.orderId, order.id!, e.target.value as OrderStatus)}
              >
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmado</option>
                <option value="preparing">En Preparación</option>
                <option value="ready">Listo para Envío</option>
                <option value="shipped">Enviado</option>
                <option value="in_transit">En Tránsito</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Lista de Productos */}
          <div>
            <h3 className="font-serif text-lg text-pure-white border-b border-dark-grey pb-2 uppercase tracking-widest mb-4">Productos</h3>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-primary-black p-4 border border-dark-grey">
                  <div className="flex items-center gap-4">
                    {item.image ? (
                       <img src={item.image} alt={item.productName} className="w-12 h-16 object-cover border border-dark-grey" />
                    ) : (
                       <div className="w-12 h-16 bg-surface-black border border-dark-grey" />
                    )}
                    <div>
                      <p className="text-pure-white font-medium leading-tight">{item.productName}</p>
                      <p className="text-mid-grey text-xs mt-1">
                        {item.presentation ? `${item.presentation} | ` : ''}{formatCurrency(item.unitPrice)} x {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="text-pure-white font-medium">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="flex justify-end border-t border-dark-grey pt-6">
            <div className="w-full md:w-1/2 space-y-2">
              <div className="flex justify-between text-light-grey">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-light-grey">
                <span>Envío:</span>
                <span>{order.shippingCost === 0 ? 'Gratis' : formatCurrency(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-pure-white font-medium text-lg pt-2 border-t border-dark-grey mt-2">
                <span>Total:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;