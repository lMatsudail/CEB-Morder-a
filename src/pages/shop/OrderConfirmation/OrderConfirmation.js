import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const location = useLocation();
  const order = location.state?.order;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!order) {
    return (
      <div className="confirmation-container">
        <div className="no-order">
          <h2>No se encontró información de la orden</h2>
          <p>Parece que no tienes una orden reciente.</p>
          <Link to="/catalogo" className="btn-primary">
            Volver al Catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmation-container">
      <div className="confirmation-content">
        {/* Header de confirmación */}
        <div className="confirmation-header">
          <div className="success-icon">✅</div>
          <h1>¡Orden Confirmada!</h1>
          <p className="confirmation-message">
            Tu orden ha sido procesada exitosamente. Recibirás un email con los detalles y enlaces de descarga.
          </p>
        </div>

        {/* Detalles de la orden */}
        <div className="order-details">
          <h2>Detalles de tu Orden</h2>
          
          <div className="order-info">
            <div className="info-row">
              <span className="label">Fecha:</span>
              <span className="value">{formatDate(order.date)}</span>
            </div>
            <div className="info-row">
              <span className="label">Total:</span>
              <span className="value total-price">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Items comprados */}
          <div className="purchased-items">
            <h3>Productos Comprados</h3>
            <div className="items-list">
              {order.items.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="item-image">
                    <img 
                      src={item.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-family="Arial" font-size="12"%3ESin imagen%3C/text%3E%3C/svg%3E'} 
                      alt={item.title}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-family="Arial" font-size="12"%3ESin imagen%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                  
                  <div className="item-details">
                    <h4>{item.title}</h4>
                    <p className="item-option">
                      {item.option.type === 'basic' ? 'Molde Básico' : 'Molde + Capacitación'}
                    </p>
                    <p className="item-quantity">Cantidad: {item.quantity}</p>
                  </div>
                  
                  <div className="item-price">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Próximos pasos */}
          <div className="next-steps">
            <h3>¿Qué sigue?</h3>
            <div className="steps-list">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Recibe tu confirmación</h4>
                  <p>Te enviaremos un email con todos los detalles de tu compra y los enlaces de descarga.</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Descarga tus moldes</h4>
                  <p>Accede a los archivos digitales desde tu panel de cliente o desde los enlaces del email.</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Agenda tu capacitación</h4>
                  <p>Si compraste capacitación, el patronista se pondrá en contacto contigo para coordinar las sesiones.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="contact-info">
            <h3>¿Necesitas ayuda?</h3>
            <p>Si tienes alguna pregunta sobre tu orden, no dudes en contactarnos:</p>
            <div className="contact-details">
              <p>Email: soporte@cebmolderia.com</p>
              <p>WhatsApp: +57 300 123 4567</p>
              <p>Horario: Lunes a Viernes, 9:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="confirmation-actions">
          <Link to="/cliente" className="btn-secondary">
            Ver Mi Panel
          </Link>
          <Link to="/catalogo" className="btn-primary">
            Seguir Comprando
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;