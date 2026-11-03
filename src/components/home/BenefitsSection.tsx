import React from 'react';
import { ShieldCheck, Truck, Clock, Gem } from 'lucide-react';

const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: <Gem size={32} strokeWidth={1} />,
      title: 'Calidad Premium',
      description: 'Seleccionamos cuidadosamente cada fragancia de nuestra colección.'
    },
    {
      icon: <Truck size={32} strokeWidth={1} />,
      title: 'Envíos Nacionales',
      description: 'Llegamos a todo el país con tiempos de entrega optimizados.'
    },
    {
      icon: <ShieldCheck size={32} strokeWidth={1} />,
      title: 'Pago Seguro',
      description: 'Paga al recibir tu pedido con Efectivo o Nequi.'
    },
    {
      icon: <Clock size={32} strokeWidth={1} />,
      title: 'Atención 24/7',
      description: 'Asesoría personalizada a través de WhatsApp.'
    }
  ];

  return (
    <section className="py-20 bg-surface-black border-y border-dark-grey">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className="text-mid-grey mb-6 group-hover:text-pure-white transition-colors duration-300">
                {benefit.icon}
              </div>
              <h3 className="font-serif text-lg text-pure-white uppercase tracking-widest mb-3">
                {benefit.title}
              </h3>
              <p className="font-sans text-sm text-mid-grey leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;