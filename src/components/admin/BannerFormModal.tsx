import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Image as ImageIcon } from 'lucide-react';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Banner } from '@/types';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

interface BannerFormModalProps {
  banner?: Banner | null;
  onClose: () => void;
  onSuccess: () => void;
}

type BannerFormData = Omit<Banner, 'id' | 'fechaInicio' | 'fechaFin'>;

const BannerFormModal: React.FC<BannerFormModalProps> = ({ banner, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<BannerFormData>({
    defaultValues: {
      titulo: '',
      subtitulo: '',
      descripcion: '',
      imagen: '',
      botonTexto: 'Descubrir',
      link: '/catalogo',
      orden: 1,
      activo: true,
      precioAnterior: 0,
      precioNuevo: 0,
      descuento: 0,
    }
  });

  const watchImagen = watch('imagen');

  useEffect(() => {
    if (banner) {
      reset({
        ...banner,
        precioAnterior: banner.precioAnterior || 0,
        precioNuevo: banner.precioNuevo || 0,
        descuento: banner.descuento || 0,
      });
      setPreviewImage(banner.imagen);
    }
  }, [banner, reset]);

  useEffect(() => {
    if (watchImagen) {
      setPreviewImage(watchImagen);
    }
  }, [watchImagen]);

  const onSubmit = async (data: BannerFormData) => {
    setIsSubmitting(true);
    try {
      const cleanedData = {
        ...data,
        orden: Number(data.orden),
        precioAnterior: Number(data.precioAnterior) > 0 ? Number(data.precioAnterior) : null,
        precioNuevo: Number(data.precioNuevo) > 0 ? Number(data.precioNuevo) : null,
        descuento: Number(data.descuento) > 0 ? Number(data.descuento) : null,
      };

      if (banner && banner.id) {
        const docRef = doc(db, 'banners', banner.id);
        await updateDoc(docRef, { ...cleanedData, updatedAt: serverTimestamp() });
        toast.success('Banner actualizado exitosamente.');
      } else {
        const collRef = collection(db, 'banners');
        await addDoc(collRef, { ...cleanedData, createdAt: serverTimestamp() });
        toast.success('Banner creado exitosamente.');
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving banner:", error);
      toast.error('Error al guardar el banner.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-primary-black/90 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-surface-black border border-dark-grey w-full max-w-4xl max-h-full overflow-hidden flex flex-col shadow-2xl animate-fade-in">
        
        <div className="flex justify-between items-center p-6 border-b border-dark-grey shrink-0 bg-primary-black">
          <h2 className="font-serif text-2xl text-pure-white uppercase tracking-widest leading-none">
            {banner ? 'Editar Banner' : 'Nuevo Banner'}
          </h2>
          <button onClick={onClose} className="text-mid-grey hover:text-pure-white transition-colors p-2">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <form id="banner-form" onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            
            {/* Grid Layout: Config vs Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Controles */}
              <div className="space-y-6 font-sans">
                
                <div>
                  <label className="label">Título del Banner *</label>
                  <input type="text" className="input-field" {...register('titulo', { required: 'Requerido' })} />
                  {errors.titulo && <span className="text-red-500 text-xs mt-1 block">{errors.titulo.message}</span>}
                </div>

                <div>
                  <label className="label">Subtítulo (Opcional)</label>
                  <input type="text" className="input-field" {...register('subtitulo')} placeholder="Ej. NUEVA COLECCIÓN" />
                </div>

                <div>
                  <label className="label">Descripción (Opcional)</label>
                  <textarea className="input-field min-h-[80px]" {...register('descripcion')} placeholder="Breve texto descriptivo..." />
                </div>

                <div>
                  <label className="label">URL Imagen Externa *</label>
                  <input type="url" className="input-field" {...register('imagen', { required: 'Requerido' })} placeholder="https://..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Texto del Botón</label>
                    <input type="text" className="input-field" {...register('botonTexto')} placeholder="Ej. Descubrir" />
                  </div>
                  <div>
                    <label className="label">Enlace de Destino</label>
                    <input type="text" className="input-field" {...register('link')} placeholder="Ej. /catalogo?categoria=Mujer" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-dark-grey pt-6 mt-6">
                  <div>
                    <label className="label">Orden de Prioridad</label>
                    <input type="number" className="input-field" {...register('orden', { min: 1 })} />
                    <p className="text-xs text-mid-grey mt-1">El orden 1 se mostrará como Hero Banner.</p>
                  </div>
                  <div className="flex items-center mt-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input type="checkbox" className="sr-only" {...register('activo')} />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${watch('activo') ? 'bg-pure-white' : 'bg-dark-grey'}`}></div>
                        <div className={`absolute left-1 top-1 bg-primary-black w-4 h-4 rounded-full transition-transform ${watch('activo') ? 'translate-x-4' : ''}`}></div>
                      </div>
                      <span className="text-sm text-light-grey group-hover:text-pure-white uppercase tracking-widest">Activo</span>
                    </label>
                  </div>
                </div>

              </div>

              {/* Preview */}
              <div className="flex flex-col">
                <label className="label">Vista Previa del Banner</label>
                <div className="flex-1 bg-primary-black border border-dark-grey relative overflow-hidden group min-h-[300px] flex items-center justify-center">
                  {previewImage ? (
                    <>
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${previewImage})` }} />
                      <div className="absolute inset-0 bg-primary-black/50 bg-gradient-to-t from-primary-black via-primary-black/20 to-transparent" />
                      <div className="relative z-10 text-center px-4">
                        <span className="block font-sans text-[10px] text-pure-white uppercase tracking-[0.3em] mb-2">{watch('subtitulo')}</span>
                        <h3 className="font-serif text-2xl text-pure-white uppercase tracking-wider mb-2">{watch('titulo') || 'Título del Banner'}</h3>
                        <p className="font-sans text-xs text-light-grey mb-4 max-w-xs mx-auto">{watch('descripcion')}</p>
                        <button type="button" className="bg-pure-white text-primary-black font-sans uppercase tracking-wider text-[10px] px-4 py-2 font-medium">
                          {watch('botonTexto') || 'Descubrir'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-mid-grey flex flex-col items-center">
                      <ImageIcon size={40} className="mb-2 opacity-50" />
                      <span className="text-xs uppercase tracking-widest">Sin imagen</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </form>
        </div>

        <div className="p-6 border-t border-dark-grey shrink-0 bg-primary-black flex justify-end gap-4">
          <button type="button" onClick={onClose} className="btn-secondary h-12">
            Cancelar
          </button>
          <button type="submit" form="banner-form" disabled={isSubmitting} className="btn-primary h-12 flex items-center justify-center min-w-[150px]">
            {isSubmitting ? <LoadingSpinner size="small" color="black" /> : 'Guardar Banner'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerFormModal;