import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import NotFound from '@/pages/NotFound';
import Home from '@/pages/Home';
import Catalog from '@/pages/Catalog';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import OrderConfirmation from '@/pages/OrderConfirmation';
import OrderTracking from '@/pages/OrderTracking';
import Contact from '@/pages/Contact';

// Admin Auth y Layout
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminLayout from '@/layouts/AdminLayout';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminBanners from '@/pages/admin/AdminBanners';
import AdminSettings from '@/pages/admin/AdminSettings';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="catalogo" element={<Catalog />} />
        <Route path="producto/:id" element={<ProductDetail />} />
        <Route path="carrito" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="pedido-confirmado/:id" element={<OrderConfirmation />} />
        <Route path="rastreo" element={<OrderTracking />} />
        <Route path="contacto" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="pedidos" element={<AdminOrders />} />
        <Route path="productos" element={<AdminProducts />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="configuracion" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
};

export default App;