import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import './ProductModal.css';

const ProductModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [selectedOption, setSelectedOption] = useState('basic');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen || !product) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getSelectedPrice = () => {
    return selectedOption === 'basic' ? product.basicPrice : product.trainingPrice;
  };

  const getOptionDetails = () => {
    if (selectedOption === 'basic') {
      return {
        type: 'basic',
        title: 'Molde Básico',
        price: product.basicPrice,
        features: [
          'Archivo digital del molde',
          'Instrucciones básicas',
          'Tallas incluidas: ' + (product.sizes && Array.isArray(product.sizes) ? product.sizes.join(', ') : 'Estándar')
        ]
      };
    } else {
      return {
        type: 'training',
        title: 'Molde + Capacitación Personalizada',
        price: product.trainingPrice,
        features: [
          'Archivo digital del molde',
          'Capacitación personalizada 1 a 1',
          'Soporte técnico durante el proyecto',
          'Material didáctico adicional',
          'Seguimiento del progreso',
          'Tallas incluidas: ' + (product.sizes && Array.isArray(product.sizes) ? product.sizes.join(', ') : 'Estándar')
        ]
      };
    }
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    try {
      const option = getOptionDetails();
      addToCart(product, option);
      
      // Simular un pequeño delay para mejor UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onClose();
    } catch (error) {
      // Error agregando al carrito
    } finally {
      setIsAdding(false);
    }
  };

  const currentOption = getOptionDetails();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="modal-header">
          <h2>{product.title}</h2>
          <div className="product-patronista-modal">
            <span>Por: <strong>{product.patronista}</strong></span>
          </div>
        </div>

        <div className="modal-body">
          <div className="product-image-section">
            <div className="product-image-large">
              <div className="product-placeholder-large">
                📷
              </div>
              <div className="difficulty-badge-large">
                <span className={`difficulty-badge ${product.difficulty?.toLowerCase()}`}>
                  {product.difficulty}
                </span>
              </div>
            </div>
          </div>

          <div className="product-details-section">
            <div className="product-description-full">
              <h3>Descripción</h3>
              <p>{product.description || 'Sin descripción disponible'}</p>
            </div>

            <div className="product-specifications">
              <h3>Especificaciones</h3>
              <div className="spec-grid">
                <div className="spec-item">
                  <strong>Tallas disponibles:</strong>
                  <span>{product.sizes && Array.isArray(product.sizes) ? product.sizes.join(', ') : 'Estándar'}</span>
                </div>
                <div className="spec-item">
                  <strong>Nivel de dificultad:</strong>
                  <span>{product.difficulty}</span>
                </div>
                <div className="spec-item">
                  <strong>Categoría:</strong>
                  <span>{product.category || 'General'}</span>
                </div>
                <div className="spec-item">
                  <strong>Medidas:</strong>
                  <span>{product.measurements || 'Estándar'}</span>
                </div>
              </div>
            </div>

            <div className="purchase-options">
              <h3>Opciones de Compra</h3>
              
              <div className="option-selector">
                <label className={`option-card ${selectedOption === 'basic' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="purchaseOption"
                    value="basic"
                    checked={selectedOption === 'basic'}
                    onChange={(e) => setSelectedOption(e.target.value)}
                  />
                  <div className="option-content">
                    <div className="option-header">
                      <span className="option-title">Solo Molde</span>
                      <span className="option-price">{formatPrice(product.basicPrice)}</span>
                    </div>
                    <ul className="option-features">
                      <li>Archivo digital del molde</li>
                      <li>Instrucciones básicas</li>
                      <li>Todas las tallas incluidas</li>
                    </ul>
                  </div>
                </label>

                <label className={`option-card ${selectedOption === 'training' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="purchaseOption"
                    value="training"
                    checked={selectedOption === 'training'}
                    onChange={(e) => setSelectedOption(e.target.value)}
                  />
                  <div className="option-content">
                    <div className="option-header">
                      <span className="option-title">Molde + Capacitación</span>
                      <span className="option-price popular">{formatPrice(product.trainingPrice)}</span>
                    </div>
                    <div className="popular-badge">Más Popular</div>
                    <ul className="option-features">
                      <li>Todo lo del molde básico</li>
                      <li>Capacitación personalizada 1 a 1</li>
                      <li>Soporte técnico completo</li>
                      <li>Material didáctico adicional</li>
                      <li>Seguimiento de progreso</li>
                    </ul>
                  </div>
                </label>
              </div>
            </div>

            <div className="selected-option-summary">
              <h4>Has seleccionado:</h4>
              <div className="summary-card">
                <div className="summary-header">
                  <span className="summary-title">{currentOption.title}</span>
                  <span className="summary-price">{formatPrice(currentOption.price)}</span>
                </div>
                <p className="summary-description">
                  {currentOption.type === 'basic' 
                    ? 'Perfecto para comenzar con el molde y desarrollar tu proyecto de forma independiente.'
                    : 'La mejor opción para aprender técnicas avanzadas y recibir apoyo personalizado durante todo el proceso.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className={`btn-add-to-cart ${isAdding ? 'adding' : ''}`}
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? (
              <>
                <span className="loading-spinner-small"></span>
                Agregando...
              </>
            ) : (
              <>
                Agregar al Carrito - {formatPrice(getSelectedPrice())}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;