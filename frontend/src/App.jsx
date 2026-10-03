import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { LanguageProvider } from './context/LanguageContext'
import { LocationProvider } from './context/LocationContext'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Payment from './pages/Payment'
import Confirmation from './pages/Confirmation'
import CustomerDashboard from './pages/CustomerDashboard'
import VendorDashboard from './pages/VendorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import WarehouseDashboard from './pages/WarehouseDashboard'

export default function App() {
  return (
    <LanguageProvider>
    <LocationProvider>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/shop" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Storefront - open to any logged-in customer (vendors/admins can browse too) */}
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/confirmation" element={<Confirmation />} />

            {/* Role-specific dashboards */}
            <Route path="/account" element={<ProtectedRoute role="CUSTOMER"><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/vendor" element={<ProtectedRoute role="VENDOR"><VendorDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/warehouse" element={<ProtectedRoute role="WAREHOUSE"><WarehouseDashboard /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/shop" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
    </LocationProvider>
    </LanguageProvider>
  )
}