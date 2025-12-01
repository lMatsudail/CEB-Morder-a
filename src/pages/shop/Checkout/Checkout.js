import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import './Checkout.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orderStatus, setOrderStatus] = useState('loading');
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!orderId) {
      setError('No se encontró información de la orden');
      setOrderStatus('error');
      return;
    }

    // Verificar estado del pago
    const checkPaymentStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_URL}/api/payments/status/${orderId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        setOrderData(response.data);
        
        // Determinar estado basado en la respuesta
        if (response.data.status === 'paid') {
          setOrderStatus('success');
        } else if (response.data.status === 'cancelled') {
          setOrderStatus('failed');
        } else {
          setOrderStatus('pending');
        }

      } catch (error) {
        console.error('Error verificando estado del pago:', error);
        setError('Error al verificar el estado del pago');
        setOrderStatus('error');
      }
    };

    checkPaymentStatus();

    // Recheck cada 3 segundos si está pendiente
    const interval = setInterval(() => {
      if (orderStatus === 'pending' || orderStatus === 'loading') {
        checkPaymentStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, user, navigate, orderStatus]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (orderStatus === 'loading') {
    return (
      <div className="checkout-container">
        <div className="checkout-loading">
          <div className="loading-spinner"></div>
          <h2>Verificando estado del pago...</h2>
          <p>Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  if (orderStatus === 'error') {
    return (
      <div className="checkout-container">
        <div className="checkout-error">
          <div className="error-icon">❌</div>
          <h2>Error</h2>
          <p>{error || 'Ocurrió un error al procesar tu solicitud'}</p>
          <button onClick={() => navigate('/catalog')} className="btn-primary">
            Volver al Catálogo
          </button>
        </div>
      </div>
    );
  }

  if (orderStatus === 'success') {
    return (
      <div className="checkout-container">
        <div className="checkout-success">
          <div className="success-icon">✅</div>
          <h1>¡Pago Exitoso!</h1>
          <p className="success-message">
            Tu pago ha sido procesado correctamente
          </p>
          
          {orderData && (
            <div className="order-details">
              <h3>Detalles de la Orden</h3>
              <div className="detail-row">
                <span>Número de Orden:</span>
                <strong>#{orderData.orderId}</strong>
              </div>
              <div className="detail-row">
                <span>Total Pagado:</span>
                <strong>{formatPrice(orderData.total)}</strong>
              </div>
              <div className="detail-row">
                <span>Método de Pago:</span>
                <strong>{orderData.paymentMethod || 'Wompi'}</strong>
              </div>
              <div className="detail-row">
                <span>Estado:</span>
                <span className="status-badge success">Pagado</span>
              </div>
            </div>
          )}

          <div className="next-steps">
            <h3>Próximos pasos</h3>
            <ul>
              <li>✅ Recibirás un correo de confirmación</li>
              <li>✅ Podrás descargar tus moldes desde tu panel</li>
              <li>✅ Si incluiste capacitación, el patronista se pondrá en contacto</li>
            </ul>
          </div>

          <div className="action-buttons">
            <button onClick={() => navigate('/dashboard/cliente')} className="btn-primary">
              Ir a Mi Panel
            </button>
            <button onClick={() => navigate('/catalog')} className="btn-secondary">
              Seguir Comprando
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (orderStatus === 'failed') {
    return (
      <div className="checkout-container">
        <div className="checkout-failed">
          <div className="failed-icon">❌</div>
          <h1>Pago Rechazado</h1>
          <p className="failed-message">
            Tu pago no pudo ser procesado
          </p>
          
          {orderData && (
            <div className="order-details">
              <div className="detail-row">
                <span>Número de Orden:</span>
                <strong>#{orderData.orderId}</strong>
              </div>
              <div className="detail-row">
                <span>Estado:</span>
                <span className="status-badge failed">Cancelado</span>
              </div>
            </div>
          )}

          <div className="retry-info">
            <h3>¿Qué puedo hacer?</h3>
            <ul>
              <li>Verifica los datos de tu tarjeta</li>
              <li>Asegúrate de tener saldo suficiente</li>
              <li>Intenta con otro método de pago</li>
              <li>Contacta a tu banco si el problema persiste</li>
            </ul>
          </div>

          <div className="action-buttons">
            <button onClick={() => navigate('/cart')} className="btn-primary">
              Reintentar Pago
            </button>
            <button onClick={() => navigate('/catalog')} className="btn-secondary">
              Volver al Catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Estado pendiente
  return (
    <div className="checkout-container">
      <div className="checkout-pending">
        <div className="pending-icon">⏳</div>
        <h1>Pago Pendiente</h1>
        <p className="pending-message">
          Estamos esperando la confirmación de tu pago
        </p>
        
        {orderData && (
          <div className="order-details">
            <div className="detail-row">
              <span>Número de Orden:</span>
              <strong>#{orderData.orderId}</strong>
            </div>
            <div className="detail-row">
              <span>Total:</span>
              <strong>{formatPrice(orderData.total)}</strong>
            </div>
            <div className="detail-row">
              <span>Estado:</span>
              <span className="status-badge pending">Pendiente</span>
            </div>
          </div>
        )}

        <p className="info-text">
          Esta página se actualizará automáticamente cuando confirmemos tu pago.
          Por favor no cierres esta ventana.
        </p>

        <div className="action-buttons">
          <button onClick={() => navigate('/dashboard/cliente')} className="btn-secondary">
            Ir a Mi Panel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;