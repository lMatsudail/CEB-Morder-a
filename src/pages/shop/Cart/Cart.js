import React, { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Cart.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMethods, setSelectedMethods] = useState(['CARD']); // métodos por defecto

  const paymentMethodOptions = [
    { code: 'CARD', label: 'Tarjeta (Crédito/Débito)' },
    { code: 'PSE', label: 'Transferencia PSE' },
    { code: 'NEQUI', label: 'Nequi' },
    { code: 'BANCOLOMBIA_TRANSFER', label: 'Bancolombia Transfer' },
    { code: 'CASH', label: 'Efectivo (Efecty)' }
  ];

  const toggleMethod = (code) => {
    setSelectedMethods(prev => {
      if (prev.includes(code)) {
        return prev.filter(m => m !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      // Redirigir al login si no está autenticado
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      // Preparar items para el backend
      const items = cartItems.map(item => ({
        productId: item.productId,
        optionType: item.option.type,
        price: item.price,
        quantity: item.quantity
      }));

      // Crear orden y obtener link de pago de Wompi
      const token = localStorage.getItem('token');
      const methodsToSend = selectedMethods.length ? selectedMethods : ['CARD'];

      const response = await axios.post(
        `${API_URL}/api/payments/create-order`,
        { items, paymentMethods: methodsToSend },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.payment && response.data.payment.paymentUrl) {
        // Persistir métodos seleccionados para mostrarlos en checkout
        try {
          localStorage.setItem('selectedPaymentMethods', JSON.stringify(methodsToSend));
        } catch (e) {
          console.warn('No se pudo guardar selectedPaymentMethods', e);
        }
        // Limpiar carrito antes de redirigir a Wompi
        clearCart();
        
        // Redirigir a la URL de pago de Wompi
        window.location.href = response.data.payment.paymentUrl;
      } else {
        throw new Error('No se generó el link de pago');
      }
      
    } catch (error) {
      console.error('Error al procesar la orden:', error);
      setError(
        error.response?.data?.message || 
        'Error al procesar la orden. Por favor, inténtalo de nuevo.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-header">
          <h1>Carrito de Compras</h1>
        </div>
        <div className="empty-cart">
          <div className="empty-cart-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h3>Tu carrito está vacío</h3>
          <p>¡Descubre nuestros increíbles moldes y comienza tu proyecto!</p>
          <Link to="/catalog" className="continue-shopping-btn">
            Ver Catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Carrito de Compras</h1>
        <button 
          className="clear-cart-btn"
          onClick={clearCart}
          title="Vaciar carrito"
        >
          Vaciar Carrito
        </button>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                <img 
                  src={item.image || '/images/molde-placeholder.jpg'} 
                  alt={item.title}
                  onError={(e) => {
                    e.target.src = '/images/molde-placeholder.jpg';
                  }}
                />
              </div>
              
              <div className="cart-item-details">
                <h3 className="cart-item-title">{item.title}</h3>
                <p className="cart-item-option">
                  <strong>{item.option.type === 'basic' ? 'Molde Básico' : 'Molde + Capacitación'}</strong>
                </p>
                {item.option.type === 'training' && (
                  <p className="cart-item-features">
                    • Incluye capacitación personalizada<br/>
                    • Soporte técnico<br/>
                    • Material adicional
                  </p>
                )}
                <p className="cart-item-price">{formatPrice(item.price)}</p>
              </div>

              <div className="cart-item-actions">
                <div className="quantity-controls">
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                
                <button
                  className="remove-item-btn"
                  onClick={() => removeFromCart(item.id)}
                  title="Eliminar del carrito"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>

              <div className="cart-item-subtotal">
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Resumen del Pedido</h3>
          
          <div className="summary-line">
            <span>Subtotal ({cartItems.reduce((total, item) => total + item.quantity, 0)} artículos):</span>
            <span>{formatPrice(getCartTotal())}</span>
          </div>
          
          <div className="summary-line">
            <span>Envío:</span>
            <span className="free-shipping">Gratis</span>
          </div>
          
          <div className="summary-line total-line">
            <span><strong>Total:</strong></span>
            <span className="cart-total"><strong>{formatPrice(getCartTotal())}</strong></span>
          </div>

          <div className="payment-methods-selector" style={{
            marginTop: '20px',
            padding: '15px',
            border: '1px solid var(--brand-black)',
            borderRadius: '8px',
            backgroundColor: 'var(--brand-white)'
          }}>
            <h4 style={{ marginBottom: '10px' }}>Medios de Pago</h4>
            <p style={{ fontSize: '12px', color: '#444', marginBottom: '8px' }}>
              Selecciona los métodos que deseas habilitar en el checkout de Wompi. Solo se mostrarán los activos en tu cuenta.
            </p>
            <div className="methods-grid" style={{ display: 'grid', gap: '6px' }}>
              {paymentMethodOptions.map(opt => (
                <label key={opt.code} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={selectedMethods.includes(opt.code)}
                    onChange={() => toggleMethod(opt.code)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            {selectedMethods.length === 0 && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#c00' }}>
                Debes seleccionar al menos un método. Usaremos TARJETA por defecto si no eliges.
              </div>
            )}
          </div>

          <div className="cart-actions">
            <Link to="/catalog" className="continue-shopping-link">
              ← Continuar Comprando
            </Link>
            
            {error && (
              <div className="error-message" style={{
                padding: '10px',
                marginBottom: '10px',
                backgroundColor: '#fee',
                color: '#c00',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}
            
            <button
              className={`checkout-button ${isProcessing ? 'processing' : ''}`}
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="loading-spinner"></span>
                  Procesando...
                </>
              ) : (
                'Pagar con Wompi'
              )}
            </button>
          </div>

          {!user && (
            <div className="login-notice">
              <p><strong>¿No tienes cuenta?</strong></p>
              <p>Necesitas iniciar sesión para completar tu compra.</p>
              <Link to="/register" className="register-link">
                Crear cuenta nueva
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;