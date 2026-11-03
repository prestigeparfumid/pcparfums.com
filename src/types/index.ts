// Tipos e Interfaces Centralizadas del Proyecto

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "shipped"
  | "in_transit"
  | "delivered"
  | "cancelled";

export type PaymentMethod =
  | "cash_on_delivery"
  | "nequi_on_delivery";

export interface OrderItem {
  productId: string;
  productName: string;
  presentation?: string; // Ej: "100ml"
  quantity: number;
  unitPrice: number;
  subtotal: number;
  image?: string;
}

export interface Order {
  id?: string;
  orderId: string; // ID legible Ej: PED-20261014-A8F42
  createdAt: any; // Timestamp de Firestore
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentMethodLabel: string;
  paymentStatus: "pending" | "paid";
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  shipping: {
    address: string;
    city: string;
    department: string;
    additionalInfo?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  telegramNotificationSent: boolean;
  statusHistory: Array<{
    status: OrderStatus;
    changedAt: any;
    changedBy: string;
  }>;
}

export interface Product {
  id?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precioAnterior?: number;
  imagen: string; // URL externa obligatoria
  imagenes?: string[]; // URLs externas adicionales
  categoria: string;
  marca?: string;
  genero?: string;
  ml?: number;
  presentacion?: string;
  especificaciones?: string;
  stock: number;
  activo: boolean;
  destacado: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Banner {
  id?: string;
  titulo: string;
  subtitulo?: string;
  descripcion?: string;
  imagen: string; // URL externa
  precioAnterior?: number;
  precioNuevo?: number;
  descuento?: number;
  botonTexto: string;
  link: string;
  activo: boolean;
  orden: number;
  fechaInicio?: any;
  fechaFin?: any;
}

export interface AdminUser {
  id?: string;
  email: string;
  role: "admin";
  active: boolean;
  createdAt?: any;
}

// Configuración Global de la Tienda (Documento único en Firestore)
export interface StoreSettings {
  name: string;
  description?: string;
  slogan?: string;
  branding: {
    logoUrl?: string; // URL externa
    faviconUrl?: string; // URL externa
    primaryColor: string;
    secondaryColor: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsapp: string; // Incluir código de país
    whatsappMessage: string;
    address?: string;
    city?: string;
    department?: string;
    openingHours?: string;
  };
  social: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
  commerce: {
    shippingCost: number;
    cashOnDeliveryEnabled: boolean;
    nequiOnDeliveryEnabled: boolean;
    nequiNumber?: string;
  };
}

// Valores por defecto para inicializar la tienda si no hay configuración
export const defaultStoreSettings: StoreSettings = {
  name: "PRESTIGE PARFUM COLLECTION",
  description: "Exclusividad y elegancia en cada fragancia.",
  branding: {
    primaryColor: "#0A0A0A",
    secondaryColor: "#141414",
  },
  contact: {
    email: "contacto@prestigeparfum.com",
    phone: "",
    whatsapp: "573000000000",
    whatsappMessage: "Hola, estoy interesado en comprar un perfume y quisiera recibir asesoría.",
  },
  social: {},
  commerce: {
    shippingCost: 0,
    cashOnDeliveryEnabled: true,
    nequiOnDeliveryEnabled: true,
  }
};