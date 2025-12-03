import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { productService } from '../../../services/productService';
import { getFirstImageUrl } from '../../../utils/imageUtils';
import { formatSizes } from '../../../utils/formatUtils';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedOption, setSelectedOption] = useState('basic'); // 'basic' o 'training'

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await productService.getProductById(id);
      setProduct(data);
      
      // Establecer la primera imagen como seleccionada
      const firstImage = getFirstImageUrl(data);
      if (firstImage) {
        setSelectedImage(firstImage);
      }
      
      // Establecer la primera talla disponible
      if (data.sizes && data.sizes.length > 0) {
        setSelectedSize(data.sizes[0]);
      }
    } catch (err) {
      console.error('Error cargando producto:', err);
      setError('No se pudo cargar el detalle del producto');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setError('Por favor, selecciona una talla');
      return;
    }

    const cartItem = {
      id: product.id,
      title: product.title,
      price: selectedOption === 'training' ? product.trainingPrice : product.basicPrice,
      image: getFirstImageUrl(product),
      quantity: 1,
      patronista: product.userFirstName,
      size: selectedSize,
      type: selectedOption,
      description: selectedOption === 'training' ? 'Molde + Capacitación' : 'Solo Molde'
    };

    addToCart(cartItem);
    setError('');
    // Mostrar confirmación
    alert(`${product.title} agregado al carrito`);
  };

  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando detalle del molde...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-container">
        <div className="error-state">
          <p>❌ {error || 'Producto no encontrado'}</p>
          <button onClick={() => navigate('/catalogo')} className="btn-back">
            Volver al Catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="product-detail-breadcrumb">
        <button onClick={() => navigate('/catalogo')} className="breadcrumb-link">
          Catálogo
        </button>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">{product.title}</span>
      </div>

      <div className="product-detail-content">
        {/* Galería de imágenes */}
        <div className="product-gallery-section">
          <div className="product-main-image">
            {selectedImage ? (
              <img 
                src={selectedImage} 
                alt={product.title}
                className="main-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.querySelector('.image-placeholder').style.display = 'flex';
                }}
              />
            ) : null}
            <div className="image-placeholder" style={{ display: selectedImage ? 'none' : 'flex' }}>
              📷
            </div>
          </div>

          {/* Miniaturas */}
          {product.images && Array.isArray(product.images) && product.images.length > 1 && (
            <div className="product-thumbnails">
              {product.images.map((image, index) => {
                const imageUrl = image.url || `${process.env.REACT_APP_API_URL}/files/image/${product.id}/${image.id}`;
                return (
                  <div
                    key={index}
                    className={`thumbnail ${selectedImage === imageUrl ? 'active' : ''}`}
                    onClick={() => setSelectedImage(imageUrl)}
                  >
                    <img 
                      src={imageUrl} 
                      alt={`Imagen ${index + 1}`}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const placeholder = e.target.parentElement?.querySelector('.thumbnail-placeholder');
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                    <div className="thumbnail-placeholder">📷</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="product-info-section">
          {/* Encabezado */}
          <div className="product-header">
            <div className="product-title-section">
              <h1 className="product-title">{product.title}</h1>
              <div className="product-meta">
                <span className={`difficulty-badge ${product.difficulty?.toLowerCase()}`}>
                  {product.difficulty}
                </span>
                <span className={`status-badge ${product.active ? 'active' : 'inactive'}`}>
                  {product.active ? 'Disponible' : 'No disponible'}
                </span>
              </div>
            </div>

            {/* Patronista */}
            <div className="patronista-info">
              <div className="patronista-header">Diseñado por:</div>
              <div className="patronista-name">{product.userFirstName} {product.userLastName}</div>
            </div>
          </div>

          {/* Descripción */}
          <div className="product-description-section">
            <h3>Descripción</h3>
            <p className="product-description">{product.description}</p>
          </div>

          {/* Especificaciones */}
          <div className="product-specs">
            <div className="spec-item">
              <span className="spec-label">Categoría:</span>
              <span className="spec-value">{product.category}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Tallas disponibles:</span>
              <span className="spec-value">{formatSizes(product.sizes)}</span>
            </div>
            {product.materials && (
              <div className="spec-item">
                <span className="spec-label">Materiales:</span>
                <span className="spec-value">{product.materials}</span>
              </div>
            )}
            {product.estimatedTime && (
              <div className="spec-item">
                <span className="spec-label">Tiempo de elaboración:</span>
                <span className="spec-value">{product.estimatedTime}</span>
              </div>
            )}
          </div>

          {/* Selector de opciones de compra */}
          <div className="purchase-options">
            <h3>Opciones de Compra</h3>
            
            {/* Selector de talla */}
            <div className="option-group">
              <label htmlFor="size-select">Selecciona una talla:</label>
              <select 
                id="size-select"
                value={selectedSize} 
                onChange={(e) => setSelectedSize(e.target.value)}
                className="size-select"
              >
                <option value="">-- Seleccionar --</option>
                {product.sizes?.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            {/* Opción: Solo molde vs Molde + Capacitación */}
            <div className="option-group">
              <label>¿Qué deseas?</label>
              <div className="option-buttons">
                <button
                  className={`option-btn ${selectedOption === 'basic' ? 'active' : ''}`}
                  onClick={() => setSelectedOption('basic')}
                >
                  <div className="option-title">Solo Molde</div>
                  <div className="option-price">${product.basicPrice?.toLocaleString()} COP</div>
                </button>
                <button
                  className={`option-btn ${selectedOption === 'training' ? 'active' : ''}`}
                  onClick={() => setSelectedOption('training')}
                >
                  <div className="option-title">Molde + Capacitación</div>
                  <div className="option-price">${product.trainingPrice?.toLocaleString()} COP</div>
                </button>
              </div>
            </div>

            {/* Resumen de precio */}
            <div className="price-summary">
              <div className="price-label">Precio total:</div>
              <div className="price-amount">
                ${(selectedOption === 'training' ? product.trainingPrice : product.basicPrice)?.toLocaleString()} COP
              </div>
            </div>

            {/* Error si aplica */}
            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            {/* Botones de acción */}
            <div className="action-buttons">
              <button 
                className="btn-add-cart"
                onClick={handleAddToCart}
                disabled={!selectedSize}
              >
                🛒 Agregar al Carrito
              </button>
              <button 
                className="btn-contact"
                onClick={() => alert('Funcionalidad de contacto próximamente')}
              >
                💬 Contactar Patronista
              </button>
            </div>
          </div>

          {/* Información de entrega */}
          <div className="delivery-info">
            <h3>Información de Entrega</h3>
            <ul className="delivery-list">
              <li>📦 Entrega digital de archivos</li>
              <li>💾 Acceso a través de tu cuenta</li>
              <li>🎓 {product.trainingPrice > product.basicPrice ? 'Capacitación incluida en opción premium' : 'Capacitación disponible'}</li>
              <li>♻️ Actualizaciones futuras del molde</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;