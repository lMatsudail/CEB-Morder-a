import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ClientePanel.css';

const ClientePanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('mis-pedidos');

  useEffect(() => {
    if (!user || user.role !== 'cliente') {
      navigate('/');
      return;
    }
    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      setError('Error al cargar tus pedidos');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'paid':
      case 'completed': return 'status-paid';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'paid': return 'Pagado';
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente de Pago';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const canDownloadFiles = (order) => {
    // Solo permitir descarga si el pedido está pagado o completado
    return order.status === 'paid' || order.status === 'completed';
  };

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/files/download/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error descargando archivo:', error);
      alert('Error al descargar el archivo. Intenta nuevamente.');
    }
  };

  if (loading) {
    return (
      <div className="cliente-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando tus datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cliente-container">
      <div className="cliente-header">
        <h1>Panel de Cliente</h1>
        <p>Bienvenido, {user?.firstname} {user?.lastname}</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠</span>
          {error}
        </div>
      )}

      <div className="tabs-container">
        <div className="tabs-header">
          <button 
            className={`tab-button ${activeTab === 'mis-pedidos' ? 'active' : ''}`}
            onClick={() => setActiveTab('mis-pedidos')}
          >
            Mis Pedidos
          </button>
          <button 
            className={`tab-button ${activeTab === 'mis-moldes' ? 'active' : ''}`}
            onClick={() => setActiveTab('mis-moldes')}
          >
            Mis Moldes
          </button>
        </div>

        {activeTab === 'mis-pedidos' && (
          <div className="tab-content">
            <h2>Mis Pedidos ({orders.length})</h2>
            
            {orders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <h3>Aún no tienes pedidos</h3>
                <p>Explora nuestro catálogo y encuentra moldes increíbles</p>
                <button onClick={() => navigate('/catalogo')} className="btn-primary">
                  Ir al Catálogo
                </button>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div className="order-info">
                        <h3>Orden #{order.id}</h3>
                        <p className="order-date">{formatDate(order.createdat)}</p>
                      </div>
                      <div className="order-status">
                        <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>

                    <div className="order-items">
                      {order.items?.map((item) => (
                        <div key={item.id} className="order-item">
                          <div className="item-info">
                            <h4>{item.productTitle}</h4>
                            <p className="item-type">
                              {item.optionType === 'basic' ? 'Molde Básico' : 'Molde + Capacitación'}
                            </p>
                          </div>
                          <div className="item-price">
                            {formatPrice(item.price)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-footer">
                      <div className="order-total">
                        <strong>Total:</strong>
                        <span className="total-amount">{formatPrice(order.total)}</span>
                      </div>

                      {canDownloadFiles(order) && (
                        <button 
                          className="btn-download"
                          onClick={() => setActiveTab('mis-moldes')}
                        >
                          📥 Ver Moldes
                        </button>
                      )}

                      {order.status === 'pending' && (
                        <div className="pending-payment-notice">
                          <span className="warning-icon">⏳</span>
                          Completa el pago para acceder a tus moldes
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'mis-moldes' && (
          <div className="tab-content">
            <h2>Mis Moldes Descargables</h2>
            
            {orders.filter(o => canDownloadFiles(o)).length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📁</div>
                <h3>No tienes moldes disponibles</h3>
                <p>Completa el pago de tus pedidos para acceder a los archivos</p>
              </div>
            ) : (
              <div className="moldes-list">
                {orders
                  .filter(order => canDownloadFiles(order))
                  .map((order) => (
                    <div key={order.id} className="molde-group">
                      <h3>Orden #{order.id} - {formatDate(order.createdat)}</h3>
                      {order.items?.map((item) => (
                        <div key={item.id} className="molde-card">
                          <div className="molde-info">
                            <h4>📐 {item.productTitle}</h4>
                            <p className="molde-type">
                              {item.optionType === 'basic' ? 'Molde Básico' : 'Molde + Capacitación'}
                            </p>
                            <span className="access-badge">✅ Acceso Completo</span>
                          </div>

                          <div className="molde-files">
                            <h5>Archivos Disponibles:</h5>
                            {item.files && item.files.length > 0 ? (
                              <div className="files-list">
                                {item.files.map((file) => (
                                  <button
                                    key={file.id}
                                    className="file-download-btn"
                                    onClick={() => handleDownloadFile(file.id, file.filename)}
                                  >
                                    <span className="file-icon">📄</span>
                                    <span className="file-name">{file.filename}</span>
                                    <span className="download-icon">⬇️</span>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="no-files">
                                No hay archivos disponibles para este producto.
                                Contacta al patronista.
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientePanel;