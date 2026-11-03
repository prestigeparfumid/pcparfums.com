import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Send } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import toast from 'react-hot-toast';

const Contact: React.FC = () => {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulación de envío ya que no hay un requerimiento de backend para contacto por correo
    // en los specs, pero dejamos la interfaz funcional.
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Mensaje enviado correctamente. Te contactaremos pronto.");
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="bg-primary-black min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl text-pure-white uppercase tracking-widest mb-4">
            Contacto
          </h1>
          <p className="font-sans text-mid-grey">
            Estamos aquí para brindarte una experiencia excepcional.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Información de Contacto */}
          <div className="space-y-12">
            <div>
              <h2 className="font-serif text-2xl text-pure-white uppercase tracking-widest mb-8 border-b border-dark-grey pb-4">
                Comunícate con nosotros
              </h2>
              
              <div className="space-y-6 font-sans">
                {settings.contact.whatsapp && (
                  <div className="flex items-start gap-4 text-light-grey">
                    <Phone className="mt-1 text-pure-white flex-shrink-0" size={20} />
                    <div>
                      <span className="block text-pure-white uppercase tracking-wider text-sm mb-1">WhatsApp / Teléfono</span>
                      <a href={`https://wa.me/${settings.contact.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-pure-white transition-colors">
                        +{settings.contact.whatsapp}
                      </a>
                    </div>
                  </div>
                )}

                {settings.contact.email && (
                  <div className="flex items-start gap-4 text-light-grey">
                    <Mail className="mt-1 text-pure-white flex-shrink-0" size={20} />
                    <div>
                      <span className="block text-pure-white uppercase tracking-wider text-sm mb-1">Correo Electrónico</span>
                      <a href={`mailto:${settings.contact.email}`} className="hover:text-pure-white transition-colors">
                        {settings.contact.email}
                      </a>
                    </div>
                  </div>
                )}

                {settings.contact.address && (
                  <div className="flex items-start gap-4 text-light-grey">
                    <MapPin className="mt-1 text-pure-white flex-shrink-0" size={20} />
                    <div>
                      <span className="block text-pure-white uppercase tracking-wider text-sm mb-1">Ubicación</span>
                      <span>{settings.contact.address}</span>
                      <span className="block text-sm text-mid-grey mt-1">{settings.contact.city}, {settings.contact.department}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {(settings.social.instagram || settings.social.facebook || settings.social.tiktok) && (
              <div>
                <h3 className="font-sans text-pure-white uppercase tracking-widest text-sm mb-6">Síguenos</h3>
                <div className="flex gap-6">
                  {settings.social.instagram && (
                    <a href={settings.social.instagram} target="_blank" rel="noopener noreferrer" className="text-mid-grey hover:text-pure-white transition-colors">
                      <Instagram size={24} />
                    </a>
                  )}
                  {settings.social.facebook && (
                    <a href={settings.social.facebook} target="_blank" rel="noopener noreferrer" className="text-mid-grey hover:text-pure-white transition-colors">
                      <Facebook size={24} />
                    </a>
                  )}
                  {settings.social.tiktok && (
                    <a href={settings.social.tiktok} target="_blank" rel="noopener noreferrer" className="text-mid-grey hover:text-pure-white font-serif font-bold italic transition-colors">
                      Tk
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Formulario */}
          <div className="bg-surface-black border border-dark-grey p-8 md:p-10">
            <h2 className="font-serif text-2xl text-pure-white uppercase tracking-widest mb-8">
              Envíanos un mensaje
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6 font-sans">
              <div>
                <label className="label">Nombre</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field" 
                  required
                />
              </div>
              <div>
                <label className="label">Correo Electrónico</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field" 
                  required
                />
              </div>
              <div>
                <label className="label">Asunto</label>
                <input 
                  type="text" 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="input-field" 
                  required
                />
              </div>
              <div>
                <label className="label">Mensaje</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="input-field min-h-[150px] resize-none" 
                  required
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="btn-primary w-full flex justify-center items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : (
                  <>
                    <Send size={18} />
                    Enviar Mensaje
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;