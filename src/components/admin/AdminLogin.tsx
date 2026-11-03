import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    // Si ya está logueado y es admin, redirigir al panel
    if (!loading && user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Completa todos los campos');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // El useEffect de arriba manejará la redirección una vez que AuthContext detecte el cambio y verifique Firestore.
      toast.success('Iniciando sesión...');
    } catch (error: any) {
      console.error("Error en login administrativo:", error);
      toast.error('Credenciales incorrectas o acceso denegado.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-black flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface-black border border-dark-grey p-8 md:p-12 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-black border border-dark-grey rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-pure-white" size={24} />
          </div>
          <h1 className="font-serif text-2xl text-pure-white uppercase tracking-widest">
            Acceso Administrativo
          </h1>
          <p className="font-sans text-mid-grey text-sm mt-2">
            PRESTIGE PARFUM COLLECTION
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 font-sans">
          <div>
            <label className="label text-xs">Correo Electrónico</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field" 
              required
            />
          </div>
          <div>
            <label className="label text-xs">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field" 
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary w-full h-12 flex items-center justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? <LoadingSpinner size="small" color="black" /> : 'Ingresar al Panel'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;