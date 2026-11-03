import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { X, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Product } from '@/types';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProductFormModalProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

type ProductFormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');

  const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: {
      nombre: '',
      marca: '',
      categoria: 'Hombre',
      genero: 'Hombre',
      precio: 0,
      precioAnterior: 0,
      stock: 1,
      presentacion: '',
      ml: 0,
      imagen: '',
      imagenes: [],
      descripcion: '',
      especificaciones: '',
      activo: true,
      destacado: false,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'imagenes' as never
  });

  const watchImagen = watch('imagen');

  useEffect(() => {
    if (product) {
      reset({
        ...product,
        precioAnterior: product.precioAnterior || 0,
        ml: product.ml || 0,
        imagenes: product.imagenes || []
      });
      setPreviewImage(product.imagen);
    }
  }, [product, reset]);

  useEffect(() => {
    if (watchImagen) {
      setPreviewImage(watchImagen);
    }
  }, [watchImagen]);

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      // Limpiar campos vacíos o ceros opcionales
      const cleanedData = {
        ...data,
        precio: Number(data.precio),
        precioAnterior: Number(data.precioAnterior) > 0 ? Number(data.precioAnterior) : null,
        stock: Number(data.stock),
        ml: Number(data.ml) > 0 ? Number(data.ml) : null,
        imagenes: data.imagenes?.filter(img => img.trim() !== '') || [], // Filtrar URLs vacías
        updatedAt: serverTimestamp()
      };

      if (product && product.id) {
        const docRef = doc(db, 'products', product.id);
        await updateDoc(docRef, cleanedData);
        toast.success('Producto actualizado exitosamente.');
      } else {
        const collRef = collection(db, 'products');
        await addDoc(collRef, {
          ...cleanedData,
          createdAt: serverTimestamp()
        });
        toast.success('Producto creado exitosamente.');
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error('Error al guardar el producto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-primary-black/90 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-surface-black border border-dark-grey w-full max-w-5xl max-h-full overflow-hidden flex flex-col shadow-2xl animate-fade-in">
        
        <div className="flex justify-between items-center p-6 border-b border-dark-grey shrink-0 bg-primary-black">
          <h2 className="font-serif text-2xl text-pure-white uppercase tracking-widest leading-none">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="text-mid-grey hover:text-pure-white transition-colors p-2">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            
            {/* Sección: Info General */}
            <section>
              <h3 className="text-pure-white uppercase tracking-widest font-serif border-b border-dark-grey pb-2 mb-6">Información General</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                <div className="md:col-span-2">
                  <label className="label">Nombre del Producto *</label>
                  <input type="text" className="input-field" {...register('nombre', { required: 'Requerido' })} />
                  {errors.nombre && <span className="text-red-500 text-xs mt-1 block">{errors.nombre.message}</span>}
                </div>
                <div>
                  <label className="label">Marca</label>
                  <input type="text" className="input-field" {...register('marca')} placeholder="Ej. Tom Ford" />
                </div>
                <div>
                  <label className="label">Categoría Principal *</label>
                  <select className="input-field" {...register('categoria', { required: 'Requerido' })}>
                    <option value="Hombre">Hombre</option>
                    <option value="Mujer">Mujer</option>
                    <option value="Unisex">Unisex</option>
                    <option value="Sets">Sets</option>
                    <option value="Ofertas">Ofertas</option>
                  </select>
                </div>
                <div>
                  <label className="label">Género</label>
                  <select className="input-field" {...register('genero')}>
                    <option value="Hombre">Hombre</option>
                    <option value="Mujer">Mujer</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="label">Descripción *</label>
                  <textarea className="input-field min-h-[100px]" {...register('descripcion', { required: 'Requerido' })} />
                </div>
              </div>
            </section>

            {/* Sección: Precio y Stock */}
            <section>
              <h3 className="text-pure-white uppercase tracking-widest font-serif border-b border-dark-grey pb-2 mb-6">Comercial y Disponibilidad</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                <div>
                  <label className="label">Precio Actual (COP) *</label>
                  <input type="number" className="input-field" {...register('precio', { required: 'Requerido', min: 0 })} />
                </div>
                <div>
                  <label className="label">Precio Anterior (Opcional)</label>
                  <input type="number" className="input-field" {...register('precioAnterior', { min: 0 })} placeholder="0 para no mostrar" />
                </div>
                <div>
                  <label className="label">Stock *</label>
                  <input type="number" className="input-field" {...register('stock', { required: 'Requerido', min: 0 })} />
                </div>
              </div>
            </section>

            {/* Sección: Presentación */}
            <section>
              <h3 className="text-pure-white uppercase tracking-widest font-serif border-b border-dark-grey pb-2 mb-6">Especificaciones Físicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                <div>
                  <label className="label">Presentación</label>
                  <input type="text" className="input-field" {...register('presentacion')} placeholder="Ej. Eau de Parfum 100ml" />
                </div>
                <div>
                  <label className="label">Mililitros (ml)</label>
                  <input type="number" className="input-field" {...register('ml')} placeholder="Ej. 100" />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Notas y Especificaciones Técnicas</label>
                  <textarea className="input-field min-h-[80px]" {...register('especificaciones')} placeholder="Notas de salida, corazón y fondo..." />
                </div>
              </div>
            </section>

            {/* Sección: Imágenes (Solo URLs) */}
            <section>
              <h3 className="text-pure-white uppercase tracking-widest font-serif border-b border-dark-grey pb-2 mb-6">Imágenes (URLs Externas)</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6 font-sans">
                  <div>
                    <label className="label">URL Imagen Principal *</label>
                    <input type="url" className="input-field" {...register('imagen', { required: 'Requerido' })} placeholder="https://..." />
                    <p className="text-xs text-mid-grey mt-2">La imagen principal se muestra en el catálogo.</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="label mb-0">URLs Imágenes Secundarias</label>
                      <button type="button" onClick={() => append('') as any} className="text-xs flex items-center gap-1 text-pure-white hover:text-mid-grey border border-dark-grey px-2 py-1">
                        <Plus size={14} /> Añadir URL
                      </button>
                    </div>
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 mb-3">
                        <input type="url" className="input-field py-2" {...register(`imagenes.${index}` as const)} placeholder="https://..." />
                        <button type="button" onClick={() => remove(index)} className="bg-primary-black border border-dark-grey px-3 text-red-500 hover:text-red-400 hover:border-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview de Imagen Principal */}
                <div className="bg-primary-black border border-dark-grey aspect-[3/4] flex items-center justify-center p-2 relative group overflow-hidden">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ''; setPreviewImage(''); toast.error('URL de imagen inválida'); }} />
                  ) : (
                    <div className="text-mid-grey flex flex-col items-center">
                      <ImageIcon size={40} className="mb-2 opacity-50" />
                      <span className="text-xs uppercase tracking-widest">Sin vista previa</span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Sección: Configuración de Publicación */}
            <section>
              <h3 className="text-pure-white uppercase tracking-widest font-serif border-b border-dark-grey pb-2 mb-6">Publicación</h3>
              <div className="flex flex-col sm:flex-row gap-8 font-sans">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" {...register('activo')} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${watch('activo') ? 'bg-pure-white' : 'bg-dark-grey'}`}></div>
                    <div className={`absolute left-1 top-1 bg-primary-black w-4 h-4 rounded-full transition-transform ${watch('activo') ? 'translate-x-4' : ''}`}></div>
                  </div>
                  <span className="text-sm text-light-grey group-hover:text-pure-white uppercase tracking-widest">Activo (Visible)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" {...register('destacado')} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${watch('destacado') ? 'bg-pure-white' : 'bg-dark-grey'}`}></div>
                    <div className={`absolute left-1 top-1 bg-primary-black w-4 h-4 rounded-full transition-transform ${watch('destacado') ? 'translate-x-4' : ''}`}></div>
                  </div>
                  <span className="text-sm text-light-grey group-hover:text-pure-white uppercase tracking-widest">Destacado (Inicio)</span>
                </label>
              </div>
            </section>

          </form>
        </div>

        <div className="p-6 border-t border-dark-grey shrink-0 bg-primary-black flex justify-end gap-4">
          <button type="button" onClick={onClose} className="btn-secondary h-12">
            Cancelar
          </button>
          <button type="submit" form="product-form" disabled={isSubmitting} className="btn-primary h-12 flex items-center justify-center min-w-[150px]">
            {isSubmitting ? <LoadingSpinner size="small" color="black" /> : 'Guardar Producto'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFormModal;