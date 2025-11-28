import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            <span>CEB Moldería</span>
          </Link>

          {/* Menu hamburguesa para móvil */}
          <button 
            className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Enlaces de navegación */}
          <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
            <ul className="navbar-nav">
              <li>
                <Link to="/" onClick={closeMenu}>Inicio</Link>
              </li>
              <li>
                <Link to="/catalogo" onClick={closeMenu}>Catálogo</Link>
              </li>
              
              {!isAuthenticated ? (
                <>
                  <li>
                    <Link to="/login" onClick={closeMenu}>Iniciar Sesión</Link>
                  </li>
                  <li>
                    <Link to="/register" className="btn btn-primary" onClick={closeMenu}>
                      Registrarse
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link 
                      to={
                        user?.role === 'admin' ? '/admin' :
                        user?.role === 'patronista' ? '/patronista' : 
                        '/cliente'
                      } 
                      onClick={closeMenu}
                    >
                      Mi Panel
                    </Link>
                  </li>
                  <li className="user-info">
                    <span>Hola, {user?.firstName}</span>
                  </li>
                  <li>
                    <button 
                      onClick={handleLogout}
                      className="btn btn-secondary"
                    >
                      Cerrar Sesión
                    </button>
                  </li>
                </>
              )}
              
              {/* Carrito */}
              <li>
                <Link 
                  to="/cart"
                  className="cart-button"
                  onClick={closeMenu}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  {getCartItemsCount() > 0 && (
                    <span className="cart-badge">{getCartItemsCount()}</span>
                  )}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;