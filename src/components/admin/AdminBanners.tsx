import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Banner } from '@/types';
import { Plus, Edit2, Trash2, Power, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import BannerFormModal from '@/components/admin/BannerFormModal';

const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'banners'), orderBy('orden', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bannersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Banner[];
      setBanners(bannersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching banners:", error);
      toast.error("Error al cargar banners.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el banner "${title}"?\nEsta acción no se puede deshacer.`)) {
      try {
        await deleteDoc(doc(db, 'banners', id));
        toast.success('Banner eliminado.');
      } catch (error) {
        console.error("Error deleting banner:", error);
        toast.error('Error al eliminar el banner.');
      }
    }
  };

  const toggleStatus = async (banner: Banner) => {
    try {
      const docRef = doc(db, 'banners', banner.id!);
      await updateDoc(docRef, {
        activo: !banner.activo,
        updatedAt: new Date()
      });
      toast.success('Estado actualizado.');
    } catch (error) {
      console.error("Error toggling banner status:", error);
      toast.error('Error al actualizar.');
    }
  };

  const openNewModal = () => {
    setSelectedBanner(null);
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsModalOpen(true);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-dark-grey pb-4">
        <div>
          <h1 className="font-serif text-3xl text-pure-white uppercase tracking-widest">
            Gestión de Banners
          </h1>
          <p className="font-sans text-mid-grey text-sm mt-1">
            Administra el Hero Banner (Orden 1) y carruseles promocionales.
          </p>
        </div>
        
        <button 
          onClick={openNewModal}
          className="btn-primary py-2 px-4 flex items-center justify-center gap-2 text-sm w-full md:w-auto"
        >
          <Plus size={16} />
          Nuevo Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-surface-black border border-dark-grey flex flex-col overflow-hidden">
            
            {/* Imagen Preview */}
            <div className="h-48 bg-primary-black relative border-b border-dark-grey">
              {banner.activo && banner.orden === 1 && (
                <span className="absolute top-2 left-2 z-10 bg-pure-white text-primary-black text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                  Hero Principal
                </span>
              )}
              {banner.imagen ? (
                <img src={banner.imagen} alt={banner.titulo} className="w-full h-full object-cover opacity-80" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-mid-grey">
                  <ImageIcon size={32} />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-5 flex-1 flex flex-col font-sans">
              <h3 className="font-serif text-xl text-pure-white line-clamp-1 mb-1">{banner.titulo}</h3>
              <p className="text-xs text-mid-grey mb-4">{banner.link}</p>
              
              <div className="flex justify-between items-center mt-auto border-t border-dark-grey pt-4">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-light-grey uppercase tracking-widest bg-primary-black border border-dark-grey px-2 py-1">
                    Orden: {banner.orden}
                  </span>
                  <button 
                    onClick={() => toggleStatus(banner)}
                    className={`flex items-center gap-1 text-xs uppercase tracking-widest transition-colors ${banner.activo ? 'text-green-500' : 'text-mid-grey hover:text-pure-white'}`}
                  >
                    <Power size={14} />
                    {banner.activo ? 'Activo' : 'Inactivo'}
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => openEditModal(banner)} 
                    className="p-1.5 text-mid-grey hover:text-pure-white bg-primary-black border border-dark-grey transition-colors" 
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(banner.id!, banner.titulo)} 
                    className="p-1.5 text-mid-grey hover:text-red-500 bg-primary-black border border-dark-grey transition-colors" 
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        ))}

        {banners.length === 0 && (
          <div className="col-span-full text-center py-12 border border-dark-grey bg-surface-black">
            <p className="text-mid-grey font-sans">No se han creado banners promocionales.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <BannerFormModal 
          banner={selectedBanner} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default AdminBanners;