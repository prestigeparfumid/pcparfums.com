import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Product } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { Plus, Search, Edit2, Trash2, Power, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProductFormModal from '@/components/admin/ProductFormModal';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('nombre', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      toast.error("Error al cargar productos.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el producto "${name}"?\nEsta acción no se puede deshacer.`)) {
      try {
        await deleteDoc(doc(db, 'products', id));
        toast.success('Producto eliminado.');
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error('Error al eliminar el producto.');
      }
    }
  };

  const toggleStatus = async (product: Product, field: 'activo' | 'destacado') => {
    try {
      const docRef = doc(db, 'products', product.id!);
      await updateDoc(docRef, {
        [field]: !product[field],
        updatedAt: new Date()
      });
      toast.success(`${field === 'activo' ? 'Estado' : 'Destacado'} actualizado.`);
    } catch (error) {
      console.error(`Error toggling ${field}:`, error);
      toast.error('Error al actualizar.');
    }
  };

  const openNewModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.marca && p.marca.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-dark-grey pb-4">
        <div>
          <h1 className="font-serif text-3xl text-pure-white uppercase tracking-widest">
            Catálogo de Productos
          </h1>
          <p className="font-sans text-mid-grey text-sm mt-1">{products.length} productos registrados</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-grey" size={16} />
            <input 
              type="text" 
              placeholder="Buscar producto..."
              className="w-full bg-primary-black border border-dark-grey py-2 pl-10 pr-4 text-sm font-sans focus:outline-none focus:border-pure-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={openNewModal}
            className="btn-primary py-2 px-4 flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={16} />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Grid de Productos (Mobile Cards / Desktop Table) */}
      <div className="hidden lg:block bg-surface-black border border-dark-grey overflow-hidden">
        <table className="w-full text-left font-sans text-sm">
          <thead className="bg-primary-black">
            <tr className="text-mid-grey uppercase tracking-wider text-xs border-b border-dark-grey">
              <th className="px-6 py-4 font-normal w-16">Img</th>
              <th className="px-6 py-4 font-normal">Producto</th>
              <th className="px-6 py-4 font-normal">Precio</th>
              <th className="px-6 py-4 font-normal text-center">Stock</th>
              <th className="px-6 py-4 font-normal text-center">Estado</th>
              <th className="px-6 py-4 font-normal text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id} className="border-b border-dark-grey border-opacity-50 hover:bg-dark-grey/20 transition-colors">
                <td className="px-6 py-3">
                  <div className="w-12 h-16 bg-primary-black border border-dark-grey">
                    <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).src = ''} />
                  </div>
                </td>
                <td className="px-6 py-3">
                  <p className="text-pure-white font-medium line-clamp-1">{p.nombre}</p>
                  <p className="text-mid-grey text-xs mt-1">{p.marca || 'Sin marca'} | {p.categoria}</p>
                </td>
                <td className="px-6 py-3 text-pure-white">{formatCurrency(p.precio)}</td>
                <td className="px-6 py-3 text-center">
                  <span className={`px-2 py-1 text-xs font-bold ${p.stock <= 0 ? 'text-red-500 bg-red-500/10' : p.stock < 5 ? 'text-yellow-500 bg-yellow-500/10' : 'text-pure-white'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-6 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => toggleStatus(p, 'activo')}
                      className={`p-1.5 rounded-full border transition-colors ${p.activo ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-dark-grey text-mid-grey hover:text-pure-white'}`}
                      title={p.activo ? 'Desactivar' : 'Activar'}
                    >
                      <Power size={14} />
                    </button>
                    <button 
                      onClick={() => toggleStatus(p, 'destacado')}
                      className={`p-1.5 rounded-full border transition-colors ${p.destacado ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' : 'border-dark-grey text-mid-grey hover:text-pure-white'}`}
                      title={p.destacado ? 'Quitar Destacado' : 'Destacar'}
                    >
                      <Star size={14} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEditModal(p)} className="p-2 text-mid-grey hover:text-pure-white bg-primary-black border border-dark-grey transition-colors" title="Editar">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(p.id!, p.nombre)} className="p-2 text-mid-grey hover:text-red-500 bg-primary-black border border-dark-grey transition-colors" title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista Móvil (Tarjetas) */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {filteredProducts.map((p) => (
          <div key={p.id} className="bg-surface-black border border-dark-grey p-4 flex gap-4">
            <div className="w-20 h-28 flex-shrink-0 bg-primary-black border border-dark-grey">
              <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-pure-white font-serif text-sm line-clamp-2 leading-tight mb-1">{p.nombre}</h3>
                <p className="text-mid-grey font-sans text-[10px] uppercase tracking-wider">{p.marca} | {p.categoria}</p>
                <div className="flex items-center gap-2 mt-2 font-sans text-xs">
                  <span className="text-pure-white">{formatCurrency(p.precio)}</span>
                  <span className={p.stock > 0 ? 'text-mid-grey' : 'text-red-500'}>Stock: {p.stock}</span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-dark-grey">
                <div className="flex gap-2">
                  <button onClick={() => toggleStatus(p, 'activo')} className={`p-1.5 rounded-full ${p.activo ? 'text-green-500' : 'text-mid-grey'}`}><Power size={14} /></button>
                  <button onClick={() => toggleStatus(p, 'destacado')} className={`p-1.5 rounded-full ${p.destacado ? 'text-yellow-500' : 'text-mid-grey'}`}><Star size={14} /></button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(p)} className="p-1.5 text-pure-white"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(p.id!, p.nombre)} className="p-1.5 text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12 border border-dark-grey bg-surface-black">
          <p className="text-mid-grey font-sans">No se encontraron productos.</p>
        </div>
      )}

      {/* Modal Formulario */}
      {isModalOpen && (
        <ProductFormModal 
          product={selectedProduct} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default AdminProducts;