import React, { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

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
    
    try {
      // Simular proceso de checkout (aquí se integrará con el backend)
      const orderData = {
        items: cartItems,
        total: getCartTotal(),
        userId: user.id,
        date: new Date().toISOString()
      };
      
      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Limpiar carrito después del checkout exitoso
      clearCart();
      
      // Redirigir a página de confirmación
      navigate('/order-confirmation', { state: { order: orderData } });
      
    } catch (error) {
      alert('Error al procesar la orden. Inténtalo de nuevo.');
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

          <div className="cart-actions">
            <Link to="/catalog" className="continue-shopping-link">
              ← Continuar Comprando
            </Link>
            
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
                'Finalizar Compra'
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