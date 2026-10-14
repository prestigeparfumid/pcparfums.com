import { dbAdmin } from './_utils/firebase';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { orderId, contactInfo } = req.body;

  if (!orderId || !contactInfo) {
    return res.status(400).json({ message: 'Faltan parámetros de consulta.' });
  }

  try {
    // Buscar la orden directamente por su ID de documento
    const orderRef = dbAdmin.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ message: 'No se encontró ningún pedido con este número.' });
    }

    const data = orderDoc.data()!;

    // Verificación de seguridad: el contacto debe coincidir con email o teléfono
    const emailMatch = data.customer.email.toLowerCase() === contactInfo.toLowerCase().trim();
    // Limpiar espacios en el teléfono para una comparación más flexible
    const phoneMatch = data.customer.phone.replace(/\s+/g, '') === contactInfo.replace(/\s+/g, '');

    if (!emailMatch && !phoneMatch) {
      return res.status(401).json({ message: 'Acceso denegado. Los datos de contacto no coinciden con este pedido.' });
    }

    // Convertir Timestamps de Firestore a formato ISO para el frontend
    const formattedData = {
      ...data,
      id: orderDoc.id,
      createdAt: data.createdAt.toDate().toISOString(),
      statusHistory: data.statusHistory.map((h: any) => ({
        ...h,
        changedAt: h.changedAt.toDate().toISOString()
      }))
    };

    return res.status(200).json(formattedData);

  } catch (error: any) {
    console.error('Error consultando rastreo:', error);
    return res.status(500).json({ message: 'Error interno del servidor al consultar el pedido.' });
  }
}