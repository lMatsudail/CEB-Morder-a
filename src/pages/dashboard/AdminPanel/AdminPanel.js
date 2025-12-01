import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import adminService from '../../../services/adminService';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('usuarios'); // 'usuarios' o 'pedidos'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    // Verificar que el usuario sea admin
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [usersData, statsData, ordersData] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getStats(),
        adminService.getAllOrders()
      ]);

      setUsers(usersData);
      setStats(statsData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError(error.message || 'Error cargando datos del sistema');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = (userToEdit) => {
    setSelectedUser(userToEdit);
    setNewRole(userToEdit.role);
    setShowModal(true);
    setError('');
    setSuccessMessage('');
  };

  const confirmChangeRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      setLoading(true);
      await adminService.changeUserRole(selectedUser.id, newRole);
      
      setSuccessMessage(`Rol de ${selectedUser.firstname} ${selectedUser.lastname} cambiado a ${newRole} exitosamente`);
      setShowModal(false);
      setSelectedUser(null);
      
      // Recargar datos
      await loadData();
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error cambiando rol:', error);
      setError(error.message || 'Error cambiando rol de usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userItem) => {
    // No permitir eliminar el usuario actual
    if (user.userId === userItem.id) {
      setError('No puedes eliminar tu propia cuenta');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setUserToDelete(userItem);
    setShowDeleteModal(true);
    setError('');
    setSuccessMessage('');
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setLoading(true);
      await adminService.deleteUser(userToDelete.id);
      
      setSuccessMessage(`Usuario ${userToDelete.firstname} ${userToDelete.lastname} eliminado exitosamente`);
      setShowDeleteModal(false);
      setUserToDelete(null);
      
      // Recargar datos
      await loadData();
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      setError(error.message || 'Error eliminando usuario');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'admin': return 'role-badge-admin';
      case 'patronista': return 'role-badge-patronista';
      case 'cliente': return 'role-badge-cliente';
      default: return 'role-badge-default';
    }
  };

  const getRoleText = (role) => {
    switch(role) {
      case 'admin': return 'Administrador';
      case 'patronista': return 'Patronista';
      case 'cliente': return 'Cliente';
      default: return role;
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
      case 'paid': return 'status-paid';
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'paid': return 'Pagado';
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (loading && !users.length) {
    return (
      <div className="admin-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Panel de Administración</h1>
        <p>Gestión de usuarios y sistema</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠</span>
          {error}
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <span className="alert-icon">✓</span>
          {successMessage}
        </div>
      )}

      {/* Estadísticas */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats.users.total}</h3>
              <p>Usuarios Totales</p>
              <div className="stat-breakdown">
                <span>Admin: {stats.users.byRole.admin || 0}</span>
                <span>Patronistas: {stats.users.byRole.patronista || 0}</span>
                <span>Clientes: {stats.users.byRole.cliente || 0}</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon products-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats.products.total}</h3>
              <p>Productos Totales</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orders-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats.orders.total}</h3>
              <p>Pedidos Totales</p>
              <div className="stat-breakdown">
                {stats.orders.byStatus.pending && <span>Pendientes: {stats.orders.byStatus.pending}</span>}
                {stats.orders.byStatus.completed && <span>Completados: {stats.orders.byStatus.completed}</span>}
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon revenue-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div className="stat-content">
              <h3>${stats.revenue.total.toLocaleString('es-CO')}</h3>
              <p>Ingresos Totales</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Usuarios */}
      <div className="tabs-container">
        <div className="tabs-header">
          <button 
            className={`tab-button ${activeTab === 'usuarios' ? 'active' : ''}`}
            onClick={() => setActiveTab('usuarios')}
          >
            Gestión de Usuarios
          </button>
          <button 
            className={`tab-button ${activeTab === 'pedidos' ? 'active' : ''}`}
            onClick={() => setActiveTab('pedidos')}
          >
            Pedidos y Ventas
          </button>
        </div>

        {activeTab === 'usuarios' && (
          <div className="users-section">
            <div className="section-header">
              <h2>Gestión de Usuarios</h2>
              <button 
                className="btn-refresh" 
                onClick={loadData}
                disabled={loading}
              >
                Actualizar
              </button>
            </div>

            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Teléfono</th>
                    <th>Ciudad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(userItem => (
                    <tr key={userItem.id}>
                      <td>{userItem.id}</td>
                      <td>{userItem.firstname} {userItem.lastname}</td>
                      <td>{userItem.email}</td>
                      <td>
                        <span className={`role-badge ${getRoleBadgeClass(userItem.role)}`}>
                          {getRoleText(userItem.role)}
                        </span>
                      </td>
                      <td>{userItem.phone || '-'}</td>
                      <td>{userItem.city || '-'}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-action btn-edit"
                            onClick={() => handleChangeRole(userItem)}
                            disabled={loading}
                            title="Cambiar rol del usuario"
                          >
                            Cambiar Rol
                          </button>
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteUser(userItem)}
                            disabled={loading || user.userId === userItem.id}
                            title={user.userId === userItem.id ? 'No puedes eliminarte a ti mismo' : 'Eliminar usuario'}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pedidos' && (
          <div className="orders-section">
            <div className="section-header">
              <h2>Historial de Pedidos</h2>
              <button 
                className="btn-refresh" 
                onClick={loadData}
                disabled={loading}
              >
                Actualizar
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="empty-state">
                <p>No hay pedidos registrados</p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.order_id} className="order-card">
                    <div className="order-header">
                      <div className="order-id-section">
                        <h3>Pedido #{order.order_id}</h3>
                        <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="order-total">
                        <strong>{formatPrice(order.total)}</strong>
                      </div>
                    </div>

                    <div className="order-details">
                      <div className="order-info">
                        <p><strong>Cliente:</strong> {order.cliente_firstname} {order.cliente_lastname}</p>
                        <p><strong>Email:</strong> {order.cliente_email}</p>
                        <p><strong>Fecha:</strong> {formatDate(order.order_date)}</p>
                        <p><strong>Método de Pago:</strong> {order.paymentmethod || 'N/A'}</p>
                      </div>

                      <div className="order-items">
                        <h4>Productos Comprados:</h4>
                        <table className="items-table">
                          <thead>
                            <tr>
                              <th>Producto</th>
                              <th>Tipo</th>
                              <th>Patronista</th>
                              <th>Ganancia</th>
                              <th>Cant.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item, idx) => (
                              <tr key={idx}>
                                <td>{item.product_title}</td>
                                <td>
                                  <span className={`option-badge ${item.option_type === 'training' ? 'training' : 'basic'}`}>
                                    {item.option_type === 'basic' ? 'Básico' : 'Con Capacitación'}
                                  </span>
                                </td>
                                <td>{item.patronista_firstname} {item.patronista_lastname}</td>
                                <td className="price-cell">{formatPrice(item.price)}</td>
                                <td className="qty-cell">{item.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para eliminar usuario */}
      {showDeleteModal && userToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content modal-delete" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Confirmar Eliminación</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="warning-message">
                <p>¿Estás seguro de que deseas eliminar a este usuario?</p>
                <p className="warning-text">Esta acción es <strong>irreversible</strong> y eliminará:</p>
                <ul className="warning-list">
                  <li>Todos los datos del usuario</li>
                  <li>Sus productos publicados</li>
                  <li>Su historial de pedidos</li>
                  <li>Cualquier otro dato relacionado</li>
                </ul>
              </div>

              <div className="user-info delete-info">
                <p><strong>Usuario:</strong> {userToDelete.firstname} {userToDelete.lastname}</p>
                <p><strong>Email:</strong> {userToDelete.email}</p>
                <p><strong>Rol:</strong> <span className={`role-badge ${getRoleBadgeClass(userToDelete.role)}`}>
                  {getRoleText(userToDelete.role)}
                </span></p>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-danger" 
                onClick={confirmDeleteUser}
                disabled={loading}
              >
                {loading ? 'Eliminando...' : 'Sí, Eliminar Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para cambiar rol */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cambiar Rol de Usuario</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="user-info">
                <p><strong>Usuario:</strong> {selectedUser.firstname} {selectedUser.lastname}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Rol Actual:</strong> <span className={`role-badge ${getRoleBadgeClass(selectedUser.role)}`}>
                  {getRoleText(selectedUser.role)}
                </span></p>
              </div>

              <div className="form-group">
                <label htmlFor="newRole">Nuevo Rol:</label>
                <select
                  id="newRole"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="form-select"
                >
                  <option value="cliente">Cliente</option>
                  <option value="patronista">Patronista</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary" 
                onClick={confirmChangeRole}
                disabled={loading || newRole === selectedUser.role}
              >
                {loading ? 'Guardando...' : 'Confirmar Cambio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
