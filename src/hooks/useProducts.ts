import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Product } from '@/types';

export const useProducts = (options?: { onlyActive?: boolean, category?: string }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    let q = collection(db, 'products');

    // Construcción dinámica de la query
    const constraints = [];
    if (options?.onlyActive) {
      constraints.push(where('activo', '==', true));
    }
    if (options?.category && options.category !== 'Todos') {
      constraints.push(where('categoria', '==', options.category));
    }
    
    // Default sort
    constraints.push(orderBy('nombre', 'asc'));

    const finalQuery = query(q, ...constraints);

    const unsubscribe = onSnapshot(finalQuery, 
      (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        setProducts(productsData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching products:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [options?.onlyActive, options?.category]);

  return { products, loading, error };
};