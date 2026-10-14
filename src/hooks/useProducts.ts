import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Product } from '@/types';

export const useProducts = ({ onlyActive = false } = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Empezamos asumiendo que queremos todos
        let q: any = collection(db, 'products');
        
        // Si pedimos solo activos (como en el catálogo), filtramos SIN orderBy
        if (onlyActive) {
          q = query(collection(db, 'products'), where('activo', '==', true));
        }

        const snapshot = await getDocs(q);
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];

        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [onlyActive]);

  return { products, loading };
};