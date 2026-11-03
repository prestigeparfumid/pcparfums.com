import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';
import toast from 'react-hot-toast';

export interface CartItemType {
  product: Product;
  quantity: number;
}

interface CartContextProps {
  items: CartItemType[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextProps>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  itemCount: 0,
  subtotal: 0,
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItemType[]>([]);

  // Cargar carrito desde LocalStorage al inicio
  useEffect(() => {
    const savedCart = localStorage.getItem('prestige_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error parsing cart data", error);
        localStorage.removeItem('prestige_cart');
      }
    }
  }, []);

  // Guardar carrito en LocalStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('prestige_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, quantity: number) => {
    if (!product.id || !product.activo || product.stock <= 0) return;

    setItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      
      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + quantity, product.stock);
        if (existingItem.quantity === newQuantity) {
           toast.error(`Solo hay ${product.stock} unidades disponibles.`);
           return prev;
        }
        toast.success(`Cantidad actualizada en el carrito.`);
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: newQuantity } 
            : item
        );
      }
      
      toast.success(`${product.nombre} añadido al carrito.`);
      return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
    toast.success("Producto eliminado del carrito.");
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        const finalQuantity = Math.min(quantity, item.product.stock);
        return { ...item, quantity: finalQuantity };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('prestige_cart');
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  
  const subtotal = items.reduce((acc, item) => {
    return acc + (item.product.precio * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal
    }}>
      {children}
    </CartContext.Provider>
  );
};