/**
 * Formatea un número como moneda local (COP - Pesos Colombianos)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Genera un identificador único y legible para un pedido.
 * Formato: PED-AAAAMMDD-XXXXX
 */
export const generateOrderId = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Genera 5 caracteres alfanuméricos aleatorios en mayúsculas
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let random = '';
  for (let i = 0; i < 5; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `PED-${year}${month}${day}-${random}`;
};

/**
 * Traduce el estado del pedido al español.
 */
export const translateOrderStatus = (status: string): string => {
  const statuses: Record<string, string> = {
    'pending': 'Pendiente',
    'confirmed': 'Confirmado',
    'preparing': 'En Preparación',
    'ready': 'Listo para Envío',
    'shipped': 'Enviado',
    'in_transit': 'En Camino',
    'delivered': 'Entregado',
    'cancelled': 'Cancelado'
  };
  return statuses[status] || status;
};

/**
 * Traduce el método de pago al español.
 */
export const translatePaymentMethod = (method: string): string => {
  const methods: Record<string, string> = {
    'cash_on_delivery': 'Efectivo Contraentrega',
    'nequi_on_delivery': 'Nequi Contraentrega'
  };
  return methods[method] || method;
};