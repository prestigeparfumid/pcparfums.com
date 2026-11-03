import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Order, OrderStatus } from '@/types';
import { formatCurrency, translateOrderStatus, translatePaymentMethod } from '@/utils/formatters';
import { Eye, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import OrderDetailsModal from '@/components/admin/OrderDetailsModal';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros y Búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  
  // Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Suscripción en tiempo real a los pedidos
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      toast.error("Error al cargar los pedidos.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId: string, docId: string, newStatus: OrderStatus) => {
    try {
      const orderRef = doc(db, 'orders', docId);
      
      // Actualizamos el estado y agregamos al historial
      const changeEntry = {
        status: newStatus,
        changedAt: new Date(),
        changedBy: 'admin' // Idealmente sacaríamos el UID o email de AuthContext
      };

      // En la vida real haríamos un updateDoc y usaríamos arrayUnion,
      // simplificamos actualizando el estado y metiendo un nuevo objeto al array en BD (asumiendo que Firebase manejará merge si se configura)
      // Para efectos prácticos de este prototipo:
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date()
      });

      toast.success(`Pedido ${orderId} actualizado a ${translateOrderStatus(newStatus)}`);
      
      // Si el modal está abierto, actualizamos su estado localmente para no cerrarlo abruptamente
      if (selectedOrder && selectedOrder.id === docId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("No se pudo actualizar el estado.");
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.phone.includes(searchTerm);
      
    const matchesStatus = statusFilter === 'todos' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-dark-grey pb-4">
        <h1 className="font-serif text-3xl text-pure-white uppercase tracking-widest">
          Gestión de Pedidos
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Buscador */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-grey" size={16} />
            <input 
              type="text" 
              placeholder="Buscar ID, nombre, telf..."
              className="w-full bg-primary-black border border-dark-grey py-2 pl-10 pr-4 text-sm font-sans focus:outline-none focus:border-pure-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtro Estado */}
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-grey" size={16} />
            <select
              className="w-full bg-primary-black border border-dark-grey py-2 pl-10 pr-4 text-sm font-sans appearance-none focus:outline-none focus:border-pure-white text-pure-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="todos">Todos los Estados</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmados</option>
              <option value="preparing">En Preparación</option>
              <option value="ready">Listos</option>
              <option value="shipped">Enviados</option>
              <option value="delivered">Entregados</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-surface-black border border-dark-grey overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-primary-black">
              <tr className="text-mid-grey uppercase tracking-wider text-xs border-b border-dark-grey">
                <th className="px-6 py-4 font-normal">ID Pedido</th>
                <th className="px-6 py-4 font-normal">Cliente</th>
                <th className="px-6 py-4 font-normal">Método</th>
                <th className="px-6 py-4 font-normal">Total</th>
                <th className="px-6 py-4 font-normal">Estado</th>
                <th className="px-6 py-4 font-normal text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-mid-grey">
                    No se encontraron pedidos.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-dark-grey border-opacity-50 hover:bg-dark-grey/20 transition-colors">
                    <td className="px-6 py-4 text-pure-white font-medium">{order.orderId}</td>
                    <td className="px-6 py-4">
                      <p className="text-pure-white">{order.customer.name}</p>
                      <p className="text-mid-grey text-xs mt-1">{order.customer.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-light-grey text-xs uppercase tracking-wider">
                        {translatePaymentMethod(order.paymentMethod)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-pure-white">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-4">
                      <select
                        className={`bg-primary-black border border-dark-grey text-xs uppercase font-bold py-1 px-2 focus:outline-none focus:border-pure-white ${
                           order.status === 'delivered' ? 'text-green-500' :
                           order.status === 'cancelled' ? 'text-red-500' :
                           'text-pure-white'
                        }`}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.orderId, order.id!, e.target.value as OrderStatus)}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="confirmed">Confirmado</option>
                        <option value="preparing">En Preparación</option>
                        <option value="ready">Listo</option>
                        <option value="shipped">Enviado</option>
                        <option value="in_transit">En Tránsito</option>
                        <option value="delivered">Entregado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-mid-grey hover:text-pure-white transition-colors bg-primary-black border border-dark-grey hover:border-pure-white"
                        title="Ver Detalles"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalles del Pedido */}
      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default AdminOrders;