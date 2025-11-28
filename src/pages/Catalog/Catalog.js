import React, { useState, useEffect } from 'react';
import ProductModal from '../../components/ProductModal';
import './Catalog.css';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    difficulty: '',
    priceRange: '',
    category: ''
  });
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/catalog/products`);
      
      if (!response.ok) {
        throw new Error('Error obteniendo catálogo');
      }
      
      const data = await response.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         product.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesDifficulty = !filters.difficulty || product.difficulty === filters.difficulty;
    
    const matchesPriceRange = () => {
      if (!filters.priceRange) return true;
      const price = product.basicPrice;
      switch (filters.priceRange) {
        case 'low': return price < 20000;
        case 'medium': return price >= 20000 && price <= 30000;
        case 'high': return price > 30000;
        default: return true;
      }
    };

    return matchesSearch && matchesDifficulty && matchesPriceRange();
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.basicPrice - b.basicPrice;
      case 'price-high':
        return b.basicPrice - a.basicPrice;
      case 'name':
        return a.title.localeCompare(b.title);
      case 'newest':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="catalog-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="catalog-container">
        <div className="error-state">
          <h3>Error cargando catálogo</h3>
          <p>{error}</p>
          <button onClick={fetchCatalog} className="btn-retry">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h1>Catálogo de Moldes</h1>
        <p>Descubre moldes únicos creados por patronistas expertos</p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="catalog-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar moldes..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-group">
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
            className="filter-select"
          >
            <option value="">Todas las dificultades</option>
            <option value="Principiante">Principiante</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>

          <select
            value={filters.priceRange}
            onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
            className="filter-select"
          >
            <option value="">Todos los precios</option>
            <option value="low">Menos de $20,000</option>
            <option value="medium">$20,000 - $30,000</option>
            <option value="high">Más de $30,000</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Más recientes</option>
            <option value="price-low">Precio: menor a mayor</option>
            <option value="price-high">Precio: mayor a menor</option>
            <option value="name">Nombre A-Z</option>
          </select>
        </div>
      </div>

      {/* Resultados */}
      <div className="catalog-results">
        <p className="results-count">
          {sortedProducts.length} molde{sortedProducts.length !== 1 ? 's' : ''} encontrado{sortedProducts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Grilla de productos */}
      {sortedProducts.length === 0 ? (
        <div className="empty-catalog">
          <div className="empty-icon">🔍</div>
          <h3>No se encontraron moldes</h3>
          <p>Intenta ajustar los filtros de búsqueda</p>
        </div>
      ) : (
        <div className="catalog-grid">
          {sortedProducts.map(product => (
            <div key={product.id} className="catalog-product-card" onClick={() => handleProductClick(product)}>
              <div className="product-image-catalog">
                <div className="product-placeholder-catalog">
                  📷
                </div>
                <div className="product-difficulty-badge">
                  <span className={`difficulty-badge ${product.difficulty?.toLowerCase()}`}>
                    {product.difficulty}
                  </span>
                </div>
              </div>
              
              <div className="product-content-catalog">
                <h3 className="product-title-catalog">{product.title}</h3>
                <p className="product-description-catalog">
                  {product.description?.substring(0, 120)}
                  {product.description?.length > 120 ? '...' : ''}
                </p>
                
                <div className="product-patronista">
                  <span className="patronista-label">Por:</span>
                  <span className="patronista-name">{product.patronista}</span>
                </div>

                <div className="product-sizes-catalog">
                  <strong>Tallas:</strong> {
                    product.sizes && Array.isArray(product.sizes) ? 
                      product.sizes.join(', ') : 
                      'No especificadas'
                  }
                </div>

                <div className="product-pricing-catalog">
                  <div className="price-option">
                    <span className="price-label">Solo molde</span>
                    <span className="price-value-main">${product.basicPrice?.toLocaleString()} COP</span>
                  </div>
                  <div className="price-option">
                    <span className="price-label">Con capacitación</span>
                    <span className="price-value">${product.trainingPrice?.toLocaleString()} COP</span>
                  </div>
                </div>

                <button className="btn-view-product">
                  Ver Detalles y Comprar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal de producto */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Catalog;