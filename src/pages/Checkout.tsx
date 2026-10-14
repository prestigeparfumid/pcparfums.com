import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-form'; // Utilizaremos react-hook-form
import { useForm as useReactHookForm } from 'react-hook-form';
import { ShieldCheck, Truck, Lock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { formatCurrency } from '@/utils/formatters';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

interface CheckoutFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  department: string;
  additionalInfo: string;
  paymentMethod: 'cash_on_delivery' | 'nequi_on_delivery';
}

const Checkout: React.FC = () => {
  const { items, subtotal, clearCart } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useReactHookForm<CheckoutFormData>({
    defaultValues: {
      paymentMethod: settings.commerce.cashOnDeliveryEnabled ? 'cash_on_delivery' : 'nequi_on_delivery'
    }
  });

  const selectedPaymentMethod = watch('paymentMethod');
  const shippingCost = settings.commerce.shippingCost || 0;
  const total = subtotal + shippingCost;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (items.length === 0 && !isProcessing) {
      navigate('/carrito');
    }
  }, [items, navigate, isProcessing]);

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      toast.error("Tu carrito está vacío.");
      return;
    }

    setIsProcessing(true);
    
    // Preparar el payload con el modelo de backend
    const orderItems = items.map(item => ({
      productId: item.product.id!,
      productName: item.product.nombre,
      presentation: item.product.presentacion,
      quantity: item.quantity,
      unitPrice: item.product.precio,
      subtotal: item.product.precio * item.quantity,
      image: item.product.imagen
    }));

    const orderData = {
      customer: {
        name: data.name,
        phone: data.phone,
        email: data.email,
      },
      shipping: {
        address: data.address,
        city: data.city,
        department: data.department,
        additionalInfo: data.additionalInfo || '',
      },
      items: orderItems,
      paymentMethod: data.paymentMethod,
    };

    try {
      // Llamada al backend de Vercel para procesar orden
      const response = await apiService.createOrder(orderData);
      clearCart();
      toast.success("¡Pedido procesado con éxito!");
      navigate(`/pedido-confirmado/${response.orderId}`);
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error(error.message || "Ocurrió un error al procesar el pedido. Intenta nuevamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !isProcessing) return null;

  return (
    <div className="bg-primary-black min-h-screen py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <ShieldCheck size={40} className="mx-auto text-pure-white mb-4" strokeWidth={1} />
          <h1 className="font-serif text-3xl md:text-4xl text-pure-white uppercase tracking-widest">
            Checkout Seguro
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Columna Izquierda: Formularios */}
          <div className="flex-1 space-y-12">
            
            {/* 1. Datos del Cliente */}
            <section className="bg-surface-black border border-dark-grey p-6 md:p-8">
              <h2 className="font-serif text-2xl text-pure-white uppercase tracking-widest mb-6 pb-4 border-b border-dark-grey flex items-center gap-3">
                <span className="bg-pure-white text-primary-black w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold font-sans">1</span>
                Datos Personales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                <div className="md:col-span-2">
                  <label className="label">Nombre Completo</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Ej. Juan Pérez"
                    {...register('name', { required: 'El nombre es obligatorio' })}
                  />
                  {errors.name && <span className="text-red-500 text-xs mt-1 block">{errors.name.message}</span>}
                </div>
                <div>
                  <label className="label">Correo Electrónico</label>
                  <input 
                    type="email" 
                    className="input-field" 
                    placeholder="correo@ejemplo.com"
                    {...register('email', { 
                      required: 'El correo es obligatorio',
                      pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' }
                    })}
                  />
                  {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>}
                </div>
                <div>
                  <label className="label">Teléfono / Celular</label>
                  <input 
                    type="tel" 
                    className="input-field" 
                    placeholder="Ej. 300 123 4567"
                    {...register('phone', { required: 'El teléfono es obligatorio' })}
                  />
                  {errors.phone && <span className="text-red-500 text-xs mt-1 block">{errors.phone.message}</span>}
                </div>
              </div>
            </section>

            {/* 2. Dirección de Entrega */}
            <section className="bg-surface-black border border-dark-grey p-6 md:p-8">
              <h2 className="font-serif text-2xl text-pure-white uppercase tracking-widest mb-6 pb-4 border-b border-dark-grey flex items-center gap-3">
                <span className="bg-pure-white text-primary-black w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold font-sans">2</span>
                Dirección de Entrega
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                <div className="md:col-span-2">
                  <label className="label">Dirección Exacta</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Calle, Carrera, Número..."
                    {...register('address', { required: 'La dirección es obligatoria' })}
                  />
                  {errors.address && <span className="text-red-500 text-xs mt-1 block">{errors.address.message}</span>}
                </div>
                <div>
                  <label className="label">Ciudad</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Ej. Bogotá"
                    {...register('city', { required: 'La ciudad es obligatoria' })}
                  />
                  {errors.city && <span className="text-red-500 text-xs mt-1 block">{errors.city.message}</span>}
                </div>
                <div>
                  <label className="label">Departamento</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Ej. Cundinamarca"
                    {...register('department', { required: 'El departamento es obligatorio' })}
                  />
                  {errors.department && <span className="text-red-500 text-xs mt-1 block">{errors.department.message}</span>}
                </div>
                <div className="md:col-span-2">
                  <label className="label">Información Adicional (Opcional)</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Apto, Torre, Barrio, Indicaciones..."
                    {...register('additionalInfo')}
                  />
                </div>
              </div>
            </section>

            {/* 3. Método de Pago */}
            <section className="bg-surface-black border border-dark-grey p-6 md:p-8">
              <h2 className="font-serif text-2xl text-pure-white uppercase tracking-widest mb-6 pb-4 border-b border-dark-grey flex items-center gap-3">
                <span className="bg-pure-white text-primary-black w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold font-sans">3</span>
                Método de Pago
              </h2>
              <div className="space-y-4 font-sans">
                
                {settings.commerce.cashOnDeliveryEnabled && (
                  <label className={`block border p-4 cursor-pointer transition-colors ${selectedPaymentMethod === 'cash_on_delivery' ? 'border-pure-white bg-dark-grey/50' : 'border-dark-grey hover:border-mid-grey'}`}>
                    <div className="flex items-center gap-4">
                      <input 
                        type="radio" 
                        value="cash_on_delivery" 
                        {...register('paymentMethod')}
                        className="w-4 h-4 text-primary-black focus:ring-pure-white bg-primary-black border-mid-grey"
                      />
                      <div>
                        <span className="block text-pure-white font-medium uppercase tracking-wider text-sm">Efectivo Contraentrega</span>
                        <span className="text-mid-grey text-xs">Pagas en efectivo al recibir tu pedido en la puerta de tu casa.</span>
                      </div>
                    </div>
                  </label>
                )}

                {settings.commerce.nequiOnDeliveryEnabled && (
                  <label className={`block border p-4 cursor-pointer transition-colors ${selectedPaymentMethod === 'nequi_on_delivery' ? 'border-pure-white bg-dark-grey/50' : 'border-dark-grey hover:border-mid-grey'}`}>
                    <div className="flex items-center gap-4">
                      <input 
                        type="radio" 
                        value="nequi_on_delivery" 
                        {...register('paymentMethod')}
                        className="w-4 h-4 text-primary-black focus:ring-pure-white bg-primary-black border-mid-grey"
                      />
                      <div>
                        <span className="block text-pure-white font-medium uppercase tracking-wider text-sm">Nequi Contraentrega</span>
                        <span className="text-mid-grey text-xs">Transfiere mediante Nequi al momento de recibir el producto.</span>
                      </div>
                    </div>
                  </label>
                )}
              </div>
            </section>
          </div>

          {/* Columna Derecha: Resumen de Orden */}
          <div className="w-full lg:w-[400px] flex-shrink-0">
            <div className="bg-surface-black border border-dark-grey p-6 md:p-8 sticky top-24">
              <h2 className="font-serif text-2xl text-pure-white uppercase tracking-widest mb-6 pb-4 border-b border-dark-grey">
                Tu Pedido
              </h2>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => (
                  <div key={item.product.id} className="flex gap-4">
                    <div className="w-16 h-20 bg-primary-black border border-dark-grey flex-shrink-0">
                      <img src={item.product.imagen} alt={item.product.nombre} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 font-sans">
                      <h4 className="text-pure-white text-sm line-clamp-2 leading-tight">{item.product.nombre}</h4>
                      <p className="text-mid-grey text-xs mt-1">Cant: {item.quantity}</p>
                      <p className="text-pure-white text-sm font-medium mt-1">{formatCurrency(item.product.precio * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 font-sans border-t border-dark-grey pt-6">
                <div className="flex justify-between text-light-grey text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-light-grey text-sm">
                  <span>Envío</span>
                  <span>{shippingCost === 0 ? 'Gratis' : formatCurrency(shippingCost)}</span>
                </div>
                <div className="pt-4 border-t border-dark-grey flex justify-between text-pure-white font-medium text-xl mt-2">
                  <span>Total a Pagar</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary w-full mt-8 flex justify-center items-center h-14"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <LoadingSpinner size="small" color="black" />
                ) : (
                  'Confirmar Pedido'
                )}
              </button>

              <div className="mt-6 flex flex-col gap-3 font-sans text-xs text-mid-grey text-center">
                <div className="flex items-center justify-center gap-2">
                  <Lock size={14} />
                  Información encriptada y segura
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Truck size={14} />
                  Despacho en 24/48 horas hábiles
                </div>
              </div>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;