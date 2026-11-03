// Servicio para manejar llamadas al backend Serverless de Vercel
// Todas las llamadas sensibles (crear pedido, consultar info crítica) pasan por aquí.

import { Order } from "@/types";

const API_URL = '/api';

export const apiService = {
  // Crear un nuevo pedido
  createOrder: async (orderData: Partial<Order>) => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el pedido');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in createOrder API:', error);
      throw error;
    }
  },

  // Rastrear un pedido (requiere orden ID y email o teléfono para seguridad)
  trackOrder: async (orderId: string, contactInfo: string) => {
    try {
      const response = await fetch(`${API_URL}/tracking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, contactInfo }),
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 401) {
            throw new Error('No se encontró el pedido o los datos no coinciden.');
        }
        throw new Error('Error al consultar el rastreo');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in trackOrder API:', error);
      throw error;
    }
  }
};