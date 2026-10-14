import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { ShoppingBag, Package, CheckCircle, TrendingUp, XCircle, Clock } from 'lucide-react';
import { Order, Product } from '@/types';
import { formatCurrency, translateOrderStatus } from '@/utils/formatters';
import LoadingSpinner from '@/components/LoadingSpinner';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalSales: 0, // Solo ventas entregadas (confirmadas)
    activeProducts: 0,
    outOfStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Estadísticas de Pedidos
        const ordersSnap = await getDocs(collection(db, 'orders'));
        let total = 0, pending = 0, delivered = 0, cancelled = 0, sales = 0;
        
        ordersSnap.forEach((doc) => {
          const data = doc.data() as Order;
          total++;
          if (data.status === 'pending' || data.status === 'confirmed' || data.status === 'preparing') {
            pending++;
          } else if (data.status === 'delivered') {
            delivered++;
            sales += data.total; // Sumamos solo las órdenes completadas a las ventas reales
          } else if (data.status === 'cancelled') {
            cancelled++;
          }
        });

        // 2. Pedidos Recientes
        const qRecent = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
        const recentSnap = await getDocs(qRecent);
        const recent = recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];

        // 3. Estadísticas de Productos
        const productsSnap = await getDocs(collection(db, 'products'));
        let active = 0, outOfStock = 0;
        
        productsSnap.forEach((doc) => {
          const data = doc.data() as Product;
          if (data.activo) active++;
          if (data.stock <= 0) outOfStock++;
        });

        setStats({
          totalOrders: total,
          pendingOrders: pending,
          deliveredOrders: delivered,
          cancelledOrders: cancelled,
          totalSales: sales,
          activeProducts: active,
          outOfStockProducts: outOfStock
        });
        setRecentOrders(recent);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const statCards = [
    { title: 'Ventas Confirmadas', value: formatCurrency(stats.totalSales), icon: TrendingUp, color: 'text-green-500' },
    { title: 'Pedidos Totales', value: stats.totalOrders, icon: ShoppingBag, color: 'text-pure-white' },
    { title: 'Pedidos en Proceso', value: stats.pendingOrders, icon: Clock, color: 'text-yellow-500' },
    { title: 'Pedidos Entregados', value: stats.deliveredOrders, icon: CheckCircle, color: 'text-green-500' },
    { title: 'Pedidos Cancelados', value: stats.cancelledOrders, icon: XCircle, color: 'text-red-500' },
    { title: 'Productos Activos', value: stats.activeProducts, icon: Package, color: 'text-pure-white' },
    { title: 'Productos Agotados', value: stats.outOfStockProducts, icon: Package, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="font-serif text-3xl text-pure-white uppercase tracking-widest border-b border-dark-grey pb-4">
        Dashboard
      </h1>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-surface-black border border-dark-grey p-6 flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <span className="font-sans text-xs text-mid-grey uppercase tracking-widest">{stat.title}</span>
                <Icon size={20} className={stat.color} />
              </div>
              <span className="font-sans text-2xl text-pure-white font-medium">{stat.value}</span>
            </div>
          );
        })}
      </div>

      {/* Pedidos Recientes */}
      <div className="bg-surface-black border border-dark-grey p-6">
        <h2 className="font-serif text-xl text-pure-white uppercase tracking-widest mb-6">Pedidos Recientes</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm">
            <thead>
              <tr className="text-mid-grey uppercase tracking-wider text-xs border-b border-dark-grey">
                <th className="pb-4 font-normal">ID Pedido</th>
                <th className="pb-4 font-normal">Cliente</th>
                <th className="pb-4 font-normal">Fecha</th>
                <th className="pb-4 font-normal">Total</th>
                <th className="pb-4 font-normal text-right">Estado</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-mid-grey">No hay pedidos recientes.</td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
                  return (
                    <tr key={order.id} className="border-b border-dark-grey border-opacity-50 hover:bg-dark-grey/30 transition-colors">
                      <td className="py-4 text-pure-white">{order.orderId}</td>
                      <td className="py-4 text-light-grey">{order.customer.name}</td>
                      <td className="py-4 text-mid-grey">
                        {date.toLocaleDateString('es-CO')}
                      </td>
                      <td className="py-4 text-pure-white">{formatCurrency(order.total)}</td>
                      <td className="py-4 text-right">
                        <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                          order.status === 'delivered' ? 'text-green-500' :
                          order.status === 'cancelled' ? 'text-red-500' :
                          'text-pure-white bg-dark-grey'
                        }`}>
                          {translateOrderStatus(order.status)}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;