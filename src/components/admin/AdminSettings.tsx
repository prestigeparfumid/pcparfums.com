import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useSettings } from '@/context/SettingsContext';
import { StoreSettings } from '@/types';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Save, Store, Image as ImageIcon, MessageCircle, Share2, CreditCard } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const { settings, loading: contextLoading } = useSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<StoreSettings>();

  useEffect(() => {
    if (!contextLoading && settings) {
      reset(settings);
    }
  }, [settings, contextLoading, reset]);

  const watchLogoUrl = watch('branding.logoUrl');
  const watchFaviconUrl = watch('branding.faviconUrl');

  const onSubmit = async (data: StoreSettings) => {
    setIsSubmitting(true);
    try {
      // Aseguramos de parsear correctamente tipos numéricos y booleanos
      const payload: StoreSettings = {
        ...data,
        commerce: {
          ...data.commerce,
          shippingCost: Number(data.commerce.shippingCost),
          cashOnDeliveryEnabled: Boolean(data.commerce.cashOnDeliveryEnabled),
          nequiOnDeliveryEnabled: Boolean(data.commerce.nequiOnDeliveryEnabled),
        }
      };

      const docRef = doc(db, 'settings', 'store');
      await setDoc(docRef, payload, { merge: true });
      
      toast.success('Configuración guardada exitosamente.');
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error('Error al guardar la configuración.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (contextLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <div className="border-b border-dark-grey pb-4">
        <h1 className="font-serif text-3xl text-pure-white uppercase tracking-widest">
          Configuración Global
        </h1>
        <p className="font-sans text-mid-grey text-sm mt-1">
          Administra la información, identidad y parámetros comerciales de la tienda.
        </p>
      </div>

      <form id="settings-form" onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        
        {/* 1. Identidad de Marca */}
        <section className="bg-surface-black border border-dark-grey p-6 md:p-8">
          <h2 className="font-serif text-xl text-pure-white uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-dark-grey pb-4">
            <Store size={20} className="text-mid-grey" />
            Información de la Marca
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
            <div className="space-y-6">
              <div>
                <label className="label">Nombre Comercial *</label>
                <input type="text" className="input-field" {...register('name', { required: 'Requerido' })} />
                {errors.name && <span className="text-red-500 text-xs mt-1 block">{errors.name.message}</span>}
              </div>
              <div>
                <label className="label">Eslogan (Opcional)</label>
                <input type="text" className="input-field" {...register('slogan')} />
              </div>
              <div>
                <label className="label">Descripción Breve</label>
                <textarea className="input-field min-h-[100px]" {...register('description')} />
              </div>
            </div>

            <div className="space-y-6 bg-primary-black p-6 border border-dark-grey">
              <div>
                <label className="label flex items-center gap-2"><ImageIcon size={14}/> Logo del Navbar (URL Externa)</label>
                <input type="url" className="input-field mb-4" {...register('branding.logoUrl')} placeholder="https://..." />
                <div className="bg-surface-black border border-dark-grey h-20 flex items-center justify-center">
                  {watchLogoUrl ? (
                     <img src={watchLogoUrl} alt="Logo Preview" className="h-10 object-contain" onError={(e) => (e.target as HTMLImageElement).src = ''}/>
                  ) : (
                    <span className="text-mid-grey text-xs uppercase tracking-widest">Sin logo configurado</span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-dark-grey">
                <label className="label flex items-center gap-2"><ImageIcon size={14}/> Favicon (URL Externa)</label>
                <input type="url" className="input-field mb-4" {...register('branding.faviconUrl')} placeholder="https://..." />
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-black border border-dark-grey flex items-center justify-center">
                    {watchFaviconUrl ? (
                       <img src={watchFaviconUrl} alt="Favicon Preview" className="w-6 h-6 object-contain" onError={(e) => (e.target as HTMLImageElement).src = ''}/>
                    ) : (
                      <span className="text-mid-grey text-[10px]">Icon</span>
                    )}
                  </div>
                  <span className="text-xs text-mid-grey">Se actualizará dinámicamente en el navegador.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Contacto y WhatsApp */}
        <section className="bg-surface-black border border-dark-grey p-6 md:p-8">
          <h2 className="font-serif text-xl text-pure-white uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-dark-grey pb-4">
            <MessageCircle size={20} className="text-mid-grey" />
            Contacto y Atención
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
            <div className="space-y-6">
              <div>
                <label className="label">Correo Electrónico Público</label>
                <input type="email" className="input-field" {...register('contact.email')} />
              </div>
              <div>
                <label className="label">Teléfono (Línea Fija o Celular)</label>
                <input type="text" className="input-field" {...register('contact.phone')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Ciudad</label>
                  <input type="text" className="input-field" {...register('contact.city')} />
                </div>
                <div>
                  <label className="label">Departamento</label>
                  <input type="text" className="input-field" {...register('contact.department')} />
                </div>
              </div>
              <div>
                <label className="label">Dirección Física</label>
                <input type="text" className="input-field" {...register('contact.address')} />
              </div>
            </div>

            <div className="space-y-6 bg-primary-black p-6 border border-dark-grey">
              <div>
                <label className="label">Número de WhatsApp (Con código país, ej. 573001234567)</label>
                <input type="text" className="input-field" {...register('contact.whatsapp')} placeholder="57300..." />
                <p className="text-xs text-mid-grey mt-2">Habilita el botón flotante y los enlaces rápidos.</p>
              </div>
              <div>
                <label className="label">Mensaje Predeterminado de WhatsApp</label>
                <textarea className="input-field min-h-[80px]" {...register('contact.whatsappMessage')} placeholder="Hola, estoy interesado..." />
              </div>
              <div>
                <label className="label">Horarios de Atención</label>
                <input type="text" className="input-field" {...register('contact.openingHours')} placeholder="Lunes a Sábado: 9AM - 6PM" />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Redes Sociales */}
        <section className="bg-surface-black border border-dark-grey p-6 md:p-8">
          <h2 className="font-serif text-xl text-pure-white uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-dark-grey pb-4">
            <Share2 size={20} className="text-mid-grey" />
            Redes Sociales (URLs Completas)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
            <div>
              <label className="label">Instagram</label>
              <input type="url" className="input-field" {...register('social.instagram')} placeholder="https://instagram.com/..." />
            </div>
            <div>
              <label className="label">Facebook</label>
              <input type="url" className="input-field" {...register('social.facebook')} placeholder="https://facebook.com/..." />
            </div>
            <div>
              <label className="label">TikTok</label>
              <input type="url" className="input-field" {...register('social.tiktok')} placeholder="https://tiktok.com/@..." />
            </div>
          </div>
        </section>

        {/* 4. Comercio y Pagos */}
        <section className="bg-surface-black border border-dark-grey p-6 md:p-8">
          <h2 className="font-serif text-xl text-pure-white uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-dark-grey pb-4">
            <CreditCard size={20} className="text-mid-grey" />
            Parámetros Comerciales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
            <div>
              <label className="label">Costo de Envío Nacional (COP)</label>
              <input type="number" className="input-field" {...register('commerce.shippingCost', { min: 0 })} />
              <p className="text-xs text-mid-grey mt-2">Pon 0 si el envío es gratuito.</p>
            </div>
            
            <div className="space-y-6">
              <label className="label">Métodos de Pago Habilitados</label>
              
              <label className="flex items-center gap-4 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" className="sr-only" {...register('commerce.cashOnDeliveryEnabled')} />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${watch('commerce.cashOnDeliveryEnabled') ? 'bg-pure-white' : 'bg-dark-grey'}`}></div>
                  <div className={`absolute left-1 top-1 bg-primary-black w-4 h-4 rounded-full transition-transform ${watch('commerce.cashOnDeliveryEnabled') ? 'translate-x-4' : ''}`}></div>
                </div>
                <div>
                  <span className="text-sm text-pure-white uppercase tracking-widest block">Efectivo Contraentrega</span>
                </div>
              </label>

              <label className="flex items-center gap-4 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" className="sr-only" {...register('commerce.nequiOnDeliveryEnabled')} />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${watch('commerce.nequiOnDeliveryEnabled') ? 'bg-pure-white' : 'bg-dark-grey'}`}></div>
                  <div className={`absolute left-1 top-1 bg-primary-black w-4 h-4 rounded-full transition-transform ${watch('commerce.nequiOnDeliveryEnabled') ? 'translate-x-4' : ''}`}></div>
                </div>
                <div>
                  <span className="text-sm text-pure-white uppercase tracking-widest block">Nequi Contraentrega</span>
                </div>
              </label>

              {watch('commerce.nequiOnDeliveryEnabled') && (
                <div className="mt-4 p-4 bg-primary-black border border-dark-grey animate-fade-in">
                  <label className="label">Número de Cuenta Nequi</label>
                  <input type="text" className="input-field" {...register('commerce.nequiNumber')} placeholder="Número para transferencias" />
                </div>
              )}
            </div>
          </div>
        </section>

      </form>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-primary-black border-t border-dark-grey p-4 md:p-6 flex justify-end z-40 px-4 sm:px-8">
        <button 
          type="submit" 
          form="settings-form"
          disabled={isSubmitting} 
          className="btn-primary h-12 flex items-center justify-center gap-2 min-w-[200px]"
        >
          {isSubmitting ? <LoadingSpinner size="small" color="black" /> : (
            <>
              <Save size={18} />
              Guardar Cambios
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;