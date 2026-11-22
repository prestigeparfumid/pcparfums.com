import { useState, FormEvent } from 'react';
import { db } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { formatCurrency } from '@/utils/formatCurrency';
import { Search, Package, MapPin, Calendar, ArrowRight } from 'lucide-react';

export const OrderTracking = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const cleanId = orderId.trim();
      const docRef = doc(db, 'orders', cleanId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError('No encontramos ningún pedido con este código. Verifica que esté bien escrito.');
      }
    } catch (err) {
      console.error("Error consultando el pedido:", err);
      setError('Hubo un error al buscar el pedido. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'entregado':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'enviado':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'empacado':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'cancelado':
        return 'bg-slate-200 text-slate-600 border-slate-200';
      default:
        return 'bg-red-50 text-red-600 border-red-200';
    }
  };

  return (
    <div className="min-h-[70vh] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-3">Rastrea tu Par</h1>
          <p className="text-slate-500 font-medium text-sm">Ingresa el código de pedido que recibiste al finalizar tu compra.</p>
        </div>

        {/* Buscador */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-200 mb-8">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-slate-400" />
              </div>
              <input 
                type="text" 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Ej: ABC123XYZ890" 
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-300 rounded-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all font-mono text-sm"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="bg-red-600 text-white px-8 py-4 rounded-sm font-black uppercase tracking-wider hover:bg-red-700 transition-colors shadow-md disabled:opacity-70 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? 'Buscando...' : 'Rastrear'} <ArrowRight size={20} />
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 text-sm font-bold border border-red-200 rounded-sm text-center">
              {error}
            </div>
          )}
        </div>

        {/* Resultados del Pedido */}
        {order && (
          <div className="bg-white rounded-sm shadow-sm border-t-4 border-red-600 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Código de Pedido</p>
                <p className="text-lg font-mono font-black text-slate-900">{order.id}</p>
              </div>
              <div className={`px-4 py-2 border rounded-sm font-black uppercase tracking-wider text-xs ${getStatusBadge(order.estado)}`}>
                Estado: {order.estado || 'Pendiente'}
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <MapPin className="text-red-600 mt-0.5" size={20} />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Dirección de Entrega</p>
                  <p className="text-sm font-medium text-slate-700">{order.direccion}</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{order.cliente}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="text-red-600 mt-0.5" size={20} />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Fecha del Pedido</p>
                  <p className="text-sm font-medium text-slate-700">
                    {order.fecha ? new Date(order.fecha.toDate()).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Reciente'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                <Package size={18} className="text-red-600" /> Resumen de Artículos
              </h3>
              
              <div className="space-y-4 mb-6">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 border border-slate-100 p-3 rounded-sm">
                    <img src={item.imagen} alt={item.nombre} className="w-16 h-16 object-cover bg-slate-50 border border-slate-200 rounded-sm" />
                    <div className="flex-grow">
                      <p className="font-bold text-slate-900 uppercase text-sm">{item.nombre}</p>
                      <p className="text-xs font-bold text-slate-500 uppercase">Talla: <span className="text-red-600">{item.talla}</span> | Cant: {item.cantidad}</p>
                    </div>
                    <p className="font-mono font-black text-slate-900 text-sm">
                      {formatCurrency(item.precio * item.cantidad)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-slate-200 pt-4 flex justify-between items-center">
                <span className="font-black uppercase tracking-wider text-slate-900 text-sm">Total Pagado</span>
                <span className="text-2xl font-black font-mono text-red-600">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;