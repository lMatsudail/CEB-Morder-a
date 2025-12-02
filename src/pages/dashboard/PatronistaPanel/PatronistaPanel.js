import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { productService } from '../../../services/productService';
import { orderService } from '../../../services/orderService';
import AddProductForm from '../../../components/forms/AddProductForm';
import './PatronistaPanel.css';

const PatronistaPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    // Cargar datos del patronista
    loadPatronistaData();
  }, []);

  const loadPatronistaData = async () => {
    setLoading(true);
    setError(''); // Limpiar errores previos
    try {
      // Cargar productos del patronista
      const myProducts = await productService.getMyProducts();
      setProducts(myProducts);
      
      // Cargar pedidos del patronista
      const myOrders = await orderService.getPatronistaOrders();
      setOrders(myOrders);
      
      // Calcular estadísticas reales
      const totalRevenue = myOrders.reduce((sum, order) => {
        if (order.status === 'paid' || order.status === 'completed') {
          return sum + (order.total || 0);
        }
        return sum;
      }, 0);
      
      const pendingOrders = myOrders.filter(order => 
        order.status === 'pending'
      ).length;
      
      // Actualizar estadísticas
      setStats({
        totalProducts: myProducts.length,
        totalSales: myOrders.length,
        totalRevenue: totalRevenue,
        pendingOrders: pendingOrders
      });
      
    } catch (error) {
      console.error('❌ Error cargando datos del patronista:', error);
      
      // Mensaje de error más descriptivo
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          setError('No se encontró el endpoint. Contacta al administrador.');
        } else if (status === 401 || status === 403) {
          setError('No tienes permisos para ver estos datos. Inicia sesión nuevamente.');
        } else {
          setError(`Error del servidor (${status}): ${error.response.data?.message || 'Intenta más tarde'}`);
        }
      } else if (error.request) {
        setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else {
        setError('Error inesperado: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProductAdded = (newProduct) => {
    setProducts(prev => [...prev, newProduct]);
    setStats(prev => ({
      ...prev,
      totalProducts: prev.totalProducts + 1
    }));
    setActiveTab('products'); // Cambiar a la pestaña de productos
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setActiveTab('edit-product');
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setEditingProduct(null);
    setActiveTab('products');
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    setLoading(true);
    try {
      await productService.deleteProduct(productToDelete.id);
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      setStats(prev => ({
        ...prev,
        totalProducts: prev.totalProducts - 1
      }));
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      setError('Error eliminando producto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const renderDashboard = () => (
    <div className="tab-content">
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-number">{stats.totalProducts}</div>
          <div className="stat-label">Moldes Publicados</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalSales}</div>
          <div className="stat-label">Ventas Totales</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">${stats.totalRevenue.toLocaleString()}</div>
          <div className="stat-label">Ingresos Totales</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.pendingOrders}</div>
          <div className="stat-label">Pedidos Pendientes</div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Acciones Rápidas</h3>
        <div className="action-buttons">
          <button 
            className="btn-add-product"
            onClick={() => setActiveTab('add-product')}
          >
            ➕ Agregar Nuevo Molde
          </button>
          <button 
            className="btn-view-orders"
            onClick={() => setActiveTab('orders')}
          >
            📋 Ver Pedidos
          </button>
          <button 
            className="btn-view-products"
            onClick={() => setActiveTab('products')}
          >
            👗 Gestionar Moldes
          </button>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="tab-content">
      <div className="products-header">
        <h3>Mis Moldes ({products.length})</h3>
        <button 
          className="btn-add-product"
          onClick={() => setActiveTab('add-product')}
        >
          ➕ Agregar Molde
        </button>
      </div>
      
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando moldes...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={loadPatronistaData} className="btn-retry">
            Reintentar
          </button>
        </div>
      )}
      
      {!loading && !error && products.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">👗</div>
          <h4>Aún no has publicado moldes</h4>
          <p>Comienza agregando tu primer molde para empezar a vender</p>
          <button 
            className="btn-add-product"
            onClick={() => setActiveTab('add-product')}
          >
            Agregar Mi Primer Molde
          </button>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <div className="product-placeholder">
                  📷
                </div>
                <div className="product-status">
                  <span className={`status-badge ${product.active ? 'active' : 'inactive'}`}>
                    {product.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              
              <div className="product-info">
                <h4 className="product-title">{product.title}</h4>
                <p className="product-description">
                  {product.description?.substring(0, 100)}
                  {product.description?.length > 100 ? '...' : ''}
                </p>
                
                <div className="product-details">
                  <div className="product-difficulty">
                    <span className={`difficulty-badge ${product.difficulty?.toLowerCase()}`}>
                      {product.difficulty}
                    </span>
                  </div>
                  
                  <div className="product-sizes">
                    <strong>Tallas:</strong> {
                      product.sizes ? 
                        (typeof product.sizes === 'string' ? 
                          JSON.parse(product.sizes).join(', ') : 
                          (Array.isArray(product.sizes) ? 
                            product.sizes.join(', ') : 
                            'No especificadas'
                          )
                        ) : 
                        'No especificadas'
                    }
                  </div>
                </div>

                <div className="product-pricing">
                  <div className="price-item">
                    <span className="price-label">Solo molde:</span>
                    <span className="price-value">${product.basicPrice?.toLocaleString()} COP</span>
                  </div>
                  <div className="price-item">
                    <span className="price-label">Con capacitación:</span>
                    <span className="price-value">${product.trainingPrice?.toLocaleString()} COP</span>
                  </div>
                </div>

                <div className="product-meta">
                  <small>Creado: {new Date(product.createdAt).toLocaleDateString()}</small>
                </div>
              </div>

              <div className="product-actions">
                <button 
                  className="btn-edit" 
                  title="Editar"
                  onClick={() => handleEditProduct(product)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button 
                  className="btn-view" 
                  title="Ver detalles"
                  onClick={() => window.open(`/producto/${product.id}`, '_blank')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
                <button 
                  className="btn-delete" 
                  title="Eliminar"
                  onClick={() => handleDeleteClick(product)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAddProduct = () => (
    <div className="tab-content">
      <h3>Agregar Nuevo Molde</h3>
      <AddProductForm 
        onProductAdded={handleProductAdded}
        onCancel={() => setActiveTab('products')}
      />
    </div>
  );

  const renderOrders = () => {
    const getStatusBadgeClass = (status) => {
      switch(status) {
        case 'completed': return 'status-completed';
        case 'paid': return 'status-completed';
        case 'pending': return 'status-pending';
        case 'cancelled': return 'status-cancelled';
        default: return 'status-pending';
      }
    };

    const getStatusText = (status) => {
      switch(status) {
        case 'completed': return 'Completado';
        case 'paid': return 'Pagado';
        case 'pending': return 'Pendiente';
        case 'cancelled': return 'Cancelado';
        default: return status;
      }
    };

    return (
      <div className="tab-content">
        <h3>Pedidos ({orders.length})</h3>
        
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Cargando pedidos...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={loadPatronistaData} className="btn-retry">
              Reintentar
            </button>
          </div>
        )}
        
        {!loading && !error && orders.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </div>
            <h4>No tienes pedidos aún</h4>
            <p>Los pedidos de tus moldes aparecerán aquí</p>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map(order => {
              const orderDate = new Date(order.createdAt);
              let items = [];
              try {
                if (order.items) {
                  // Si ya es un array, usarlo directamente
                  if (Array.isArray(order.items)) {
                    items = order.items;
                  } 
                  // Si es un string que parece JSON, parsearlo
                  else if (typeof order.items === 'string') {
                    // SQLite GROUP_CONCAT devuelve objetos JSON separados por comas
                    // Necesitamos envolverlos en un array
                    const itemsStr = order.items.trim();
                    if (itemsStr.startsWith('[')) {
                      // Ya es un array JSON
                      items = JSON.parse(itemsStr);
                    } else if (itemsStr.startsWith('{')) {
                      // Es uno o más objetos JSON separados por comas
                      items = JSON.parse(`[${itemsStr}]`);
                    }
                    // Filtrar items null (productos que no son del patronista)
                    items = items.filter(item => item !== null);
                  }
                }
              } catch (e) {
                // Error parseando items del pedido
                items = [];
              }

              return (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h4>Pedido #{order.id}</h4>
                      <p className="order-date">
                        {orderDate.toLocaleDateString('es-ES', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="order-badges">
                      <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      {order.paymentMethod && (
                        <span className="payment-badge payment-info">
                          {order.paymentMethod}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="order-customer">
                    <strong>Cliente:</strong> {order.clientFirstName || 'N/A'} {order.clientLastName || ''}
                    <br />
                    <small>{order.clientEmail || 'Sin email'}</small>
                  </div>

                  <div className="order-items">
                    <strong>Productos:</strong>
                    {items.length > 0 ? (
                      <ul>
                        {items.map((item, index) => (
                          <li key={index}>
                            {item.productTitle} - {item.optionType === 'training' ? 'Con capacitación' : 'Solo molde'}
                            {' '}(x{item.quantity}) - ${item.price?.toLocaleString()} COP
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No hay items</p>
                    )}
                  </div>

                  <div className="order-total">
                    <strong>Total:</strong> <span className="total-amount">${order.total?.toLocaleString()} COP</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderEditProduct = () => (
    <div className="tab-content">
      <h3>Editar Molde</h3>
      <AddProductForm 
        productToEdit={editingProduct}
        onProductAdded={handleProductUpdated}
        onCancel={() => {
          setEditingProduct(null);
          setActiveTab('products');
        }}
      />
    </div>
  );

  return (
    <div className="patronista-panel">
      <div className="panel-header">
        <h1 className="panel-title">Panel de Patronista</h1>
        <p className="panel-subtitle">Bienvenido, {user?.firstName}</p>
      </div>

      <div className="patronista-tabs">
        <button 
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          👗 Mis Moldes
        </button>
        <button 
          className={`tab-button ${activeTab === 'add-product' ? 'active' : ''}`}
          onClick={() => setActiveTab('add-product')}
        >
          ➕ Agregar Molde
        </button>
        <button 
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📋 Pedidos
        </button>
      </div>

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'products' && renderProducts()}
      {activeTab === 'add-product' && renderAddProduct()}
      {activeTab === 'edit-product' && renderEditProduct()}
      {activeTab === 'orders' && renderOrders()}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={handleDeleteCancel}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmar Eliminación</h3>
              <button className="modal-close" onClick={handleDeleteCancel}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <p>¿Estás seguro de que deseas eliminar el molde:</p>
              <p className="product-name">"{productToDelete?.title}"?</p>
              <p className="warning-text">Esta acción no se puede deshacer.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={handleDeleteCancel}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                className="btn-delete-confirm" 
                onClick={handleDeleteConfirm}
                disabled={loading}
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatronistaPanel;