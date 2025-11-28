import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import './styles/App.css';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import { Home } from './pages/home';
import { Login, Register } from './pages/auth';
import Catalog from './pages/Catalog';
import { ProductDetail, Cart, Checkout, OrderConfirmation } from './pages/shop';
import { Dashboard, PatronistaPanel, ClientePanel } from './pages/dashboard';
import AdminPanel from './pages/dashboard/AdminPanel/AdminPanel';
import TestAPI from './pages/TestAPI';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="App">
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/test-api" element={<TestAPI />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/catalogo" element={<Catalog />} />
                  <Route path="/producto/:id" element={<ProductDetail />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/patronista" element={<PatronistaPanel />} />
                  <Route path="/cliente" element={<ClientePanel />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation" element={<OrderConfirmation />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;