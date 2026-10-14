import { dbAdmin } from './_utils/firebase';
import { sendTelegramNotification } from './_utils/telegram';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers (Permitir solicitudes del frontend)
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

  const { customer, shipping, items, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'El carrito está vacío' });
  }

  if (!customer?.name || !customer?.phone || !shipping?.address || !shipping?.city) {
    return res.status(400).json({ message: 'Faltan datos obligatorios del cliente o envío' });
  }

  try {
    // Generar ID de pedido único legible: PED-YYYYMMDD-XXXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderId = `PED-${dateStr}-${randomStr}`;

    // Obtener configuración global para el costo de envío
    const settingsRef = dbAdmin.collection('settings').doc('store');
    const settingsDoc = await settingsRef.get();
    const shippingCost = settingsDoc.exists ? (settingsDoc.data()?.commerce?.shippingCost || 0) : 0;

    let totalSubtotal = 0;
    const processedItems: any[] = [];

    // Utilizar una transacción de Firestore para asegurar consistencia de precios y stock
    await dbAdmin.runTransaction(async (transaction) => {
      const productRefs = items.map((item: any) => dbAdmin.collection('products').doc(item.productId));
      const productDocs = await transaction.getAll(...productRefs);

      productDocs.forEach((doc, index) => {
        if (!doc.exists) {
          throw new Error(`El producto ${items[index].productName} no existe en la base de datos.`);
        }
        
        const pData = doc.data()!;
        if (!pData.activo) {
          throw new Error(`El producto ${pData.nombre} actualmente no está activo o disponible.`);
        }
        if (pData.stock < items[index].quantity) {
          throw new Error(`Stock insuficiente para ${pData.nombre}. Quedan ${pData.stock} unidades.`);
        }

        // Usar el precio REAL de la base de datos, ignorando el del frontend
        const unitPrice = pData.precio;
        const subtotal = unitPrice * items[index].quantity;
        totalSubtotal += subtotal;

        processedItems.push({
          productId: doc.id,
          productName: pData.nombre,
          presentation: pData.presentacion || '',
          quantity: items[index].quantity,
          unitPrice: unitPrice,
          subtotal: subtotal,
          image: pData.imagen
        });

        // Descontar el stock en la misma transacción
        transaction.update(doc.ref, { stock: pData.stock - items[index].quantity });
      });

      const total = totalSubtotal + shippingCost;
      const orderRef = dbAdmin.collection('orders').doc(orderId);

      const newOrder = {
        orderId,
        createdAt: new Date(),
        status: 'pending',
        paymentMethod,
        paymentMethodLabel: paymentMethod === 'cash_on_delivery' ? 'Efectivo Contraentrega' : 'Nequi Contraentrega',
        paymentStatus: 'pending',
        customer,
        shipping,
        items: processedItems,
        subtotal: totalSubtotal,
        shippingCost,
        total,
        telegramNotificationSent: false,
        statusHistory: [{
          status: 'pending',
          changedAt: new Date(),
          changedBy: 'system'
        }]
      };

      transaction.set(orderRef, newOrder);
    });

    // Enviar notificación a Telegram de forma asíncrona fuera de la transacción
    const methodIcon = paymentMethod === 'cash_on_delivery' ? '💵 Efectivo Contraentrega' : '📱 Nequi Contraentrega';
    
    // Formatear moneda para Telegram
    const formatCop = (num: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(num);

    const tgMessage = 
      `<b>🛒 NUEVO PEDIDO RECIBIDO</b>\n\n` +
      `<b>ID:</b> ${orderId}\n` +
      `<b>Cliente:</b> ${customer.name}\n` +
      `<b>Teléfono:</b> ${customer.phone}\n` +
      `<b>Ubicación:</b> ${shipping.city}, ${shipping.department}\n\n` +
      `<b>📦 Productos:</b>\n` +
      processedItems.map(i => `- ${i.quantity}x ${i.productName} (${formatCop(i.unitPrice)})`).join('\n') + `\n\n` +
      `<b>Subtotal:</b> ${formatCop(totalSubtotal)}\n` +
      `<b>Envío:</b> ${shippingCost === 0 ? 'Gratis' : formatCop(shippingCost)}\n` +
      `<b>Total:</b> ${formatCop(totalSubtotal + shippingCost)}\n\n` +
      `<b>Método de Pago:</b>\n${methodIcon}`;

    const tgSent = await sendTelegramNotification(tgMessage);
    
    // Si se envía correctamente, actualizamos el flag (sin romper el flujo si falla)
    if (tgSent) {
      await dbAdmin.collection('orders').doc(orderId).update({ telegramNotificationSent: true });
    }

    return res.status(200).json({ success: true, orderId });

  } catch (error: any) {
    console.error('Error procesando checkout:', error);
    return res.status(500).json({ message: error.message || 'Error interno del servidor al procesar el pedido.' });
  }
}