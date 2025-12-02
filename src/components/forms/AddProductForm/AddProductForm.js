import React, { useState, useEffect } from 'react';
import { productService } from '../../../services/productService';
import { 
  GARMENT_TYPES, 
  SIZES, 
  DIFFICULTY_LEVELS,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_PATTERN_TYPES,
  MAX_IMAGE_SIZE,
  MAX_PATTERN_SIZE,
  MAX_IMAGES_PER_PRODUCT
} from '../../../constants/productConstants';
import './AddProductForm.css';

const AddProductForm = ({ onProductAdded, onCancel, productToEdit = null }) => {
  const isEditing = !!productToEdit;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    sizes: [],
    difficulty: 'Principiante',
    basicPrice: '',
    trainingPrice: '',
    tags: '',
    active: true,
    measurements: {
      bust: '',
      waist: '',
      hip: '',
      length: ''
    },
    includesTraining: false,
    trainingDuration: '',
    trainingDescription: '',
    status: 'draft'
  });

  const [images, setImages] = useState([]);
  const [patternFiles, setPatternFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar datos del producto si se está editando
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        title: productToEdit.title || '',
        description: productToEdit.description || '',
        category: productToEdit.category || '',
        sizes: productToEdit.sizes ? (typeof productToEdit.sizes === 'string' ? JSON.parse(productToEdit.sizes) : productToEdit.sizes) : [],
        difficulty: productToEdit.difficulty || 'Principiante',
        basicPrice: productToEdit.basicPrice || '',
        trainingPrice: productToEdit.trainingPrice || '',
        tags: productToEdit.tags || '',
        active: productToEdit.active !== undefined ? productToEdit.active : true,
        measurements: {
          bust: productToEdit.measurements?.bust || '',
          waist: productToEdit.measurements?.waist || '',
          hip: productToEdit.measurements?.hip || '',
          length: productToEdit.measurements?.length || ''
        },
        includesTraining: !!productToEdit.trainingPrice,
        trainingDuration: productToEdit.trainingDuration || '',
        trainingDescription: productToEdit.trainingDescription || '',
        status: productToEdit.status || 'draft'
      });
    }
  }, [productToEdit]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSizeChange = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validImages = [];
    const newErrors = {};

    if (images.length + files.length > MAX_IMAGES_PER_PRODUCT) {
      newErrors.images = `Máximo ${MAX_IMAGES_PER_PRODUCT} imágenes permitidas`;
    }

    files.forEach((file, index) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        newErrors[`image_${index}`] = 'Tipo de archivo no válido. Solo JPG, PNG, WebP';
        return;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        newErrors[`image_${index}`] = 'Imagen muy grande. Máximo 5MB';
        return;
      }

      validImages.push({
        file,
        preview: URL.createObjectURL(file),
        id: Date.now() + index
      });
    });

    if (Object.keys(newErrors).length === 0) {
      setImages(prev => [...prev, ...validImages].slice(0, MAX_IMAGES_PER_PRODUCT));
      setErrors(prev => ({ ...prev, images: null }));
    } else {
      setErrors(prev => ({ ...prev, ...newErrors }));
    }
  };

  const handlePatternUpload = (e) => {
    const files = Array.from(e.target.files);
    const validPatterns = [];
    const newErrors = {};

    files.forEach((file, index) => {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!ALLOWED_PATTERN_TYPES.includes(extension)) {
        newErrors[`pattern_${index}`] = 'Tipo de archivo no válido. Solo .pds, .rul, .ptn, .dxf';
        return;
      }

      if (file.size > MAX_PATTERN_SIZE) {
        newErrors[`pattern_${index}`] = 'Archivo muy grande. Máximo 50MB';
        return;
      }

      validPatterns.push({
        file,
        name: file.name,
        size: file.size,
        id: Date.now() + index
      });
    });

    if (Object.keys(newErrors).length === 0) {
      setPatternFiles(prev => [...prev, ...validPatterns]);
      setErrors(prev => ({ ...prev, patterns: null }));
    } else {
      setErrors(prev => ({ ...prev, ...newErrors }));
    }
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const removePattern = (id) => {
    setPatternFiles(prev => prev.filter(pattern => pattern.id !== id));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Título es requerido';
    if (!formData.description.trim()) newErrors.description = 'Descripción es requerida';
    if (!formData.category) newErrors.category = 'Categoría es requerida';
    if (formData.sizes.length === 0) newErrors.sizes = 'Selecciona al menos una talla';
    if (!formData.basicPrice || formData.basicPrice <= 0) newErrors.basicPrice = 'Precio básico válido es requerido';
    
    // Validar que tenga al menos una imagen
    if (!isEditing && images.length === 0) {
      newErrors.images = 'Al menos una imagen es requerida';
    }

    // Validar que tenga al menos un archivo de molde (.PDS u otro)
    if (!isEditing && patternFiles.length === 0) {
      newErrors.patterns = 'Al menos un archivo de molde es requerido';
    }

    if (formData.trainingPrice && formData.trainingPrice <= formData.basicPrice) {
      newErrors.trainingPrice = 'Precio con capacitación debe ser mayor al precio básico';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔍 Iniciando submit del formulario...');
    console.log('📋 Datos del formulario:', formData);
    console.log('🖼️ Imágenes:', images);
    console.log('📁 Archivos de patrón:', patternFiles);
    
    if (!validateForm()) {
      console.log('❌ Validación fallida:', errors);
      // Los errores se mostrarán encima del botón Guardar
      return;
    }

    console.log('✅ Validación exitosa, enviando datos...');
    setLoading(true);

    try {
      // Preparar datos del producto
      const productData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        sizes: JSON.stringify(formData.sizes),
        difficulty: formData.difficulty,
        basicPrice: parseFloat(formData.basicPrice),
        trainingPrice: formData.trainingPrice ? parseFloat(formData.trainingPrice) : null,
        tags: formData.tags,
        active: formData.active,
        // Adjuntar archivos para envío multipart/form-data
        images: images.map(img => img.file),
        files: patternFiles.map(p => p.file)
      };

      console.log('📦 Datos preparados para envío:', productData);

      let result;

      if (isEditing) {
        console.log('✏️ Actualizando producto existente...');
        // Actualizar producto existente
        result = await productService.updateProduct(productToEdit.id, productData);
      } else {
        console.log('➕ Creando nuevo producto...');
        // Crear nuevo producto
        result = await productService.createProduct(productData);
      }

      console.log('✅ Producto guardado exitosamente:', result);

      // Notificar al componente padre
      onProductAdded(result);
      
      // Limpiar formulario si no está editando
      if (!isEditing) {
        setFormData({
          title: '',
          description: '',
          category: '',
          sizes: [],
          difficulty: 'Principiante',
          basicPrice: '',
          trainingPrice: '',
          tags: '',
          active: true,
          measurements: {
            bust: '',
            waist: '',
            hip: '',
            length: ''
          },
          includesTraining: false,
          trainingDuration: '',
          trainingDescription: '',
          status: 'draft'
        });
        setImages([]);
        setPatternFiles([]);
      }
      
    } catch (error) {
      console.error('❌ Error guardando producto:', error);
      console.error('📄 Detalles del error:', error.response?.data || error.message);
      const errorMessage = isEditing ? 
        'Error al actualizar el producto. Intenta nuevamente.' : 
        'Error al crear el producto. Intenta nuevamente.';
      setErrors({ submit: error.response?.data?.message || errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-form">
      <div className="form-header">
        <h3>{isEditing ? 'Editar Molde' : 'Agregar Nuevo Molde'}</h3>
      </div>

      <form onSubmit={handleSubmit} className="product-form">
        {/* Información Básica */}
        <div className="form-section">
          <h4>Información Básica</h4>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="title">Título del Molde *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ej: Blusa Elegante Manga Larga"
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="category">Categoría *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={errors.category ? 'error' : ''}
              >
                <option value="">Seleccionar categoría</option>
                {GARMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.category && <span className="error-text">{errors.category}</span>}
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Descripción *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe el molde, estilo, características especiales..."
                rows="4"
                className={errors.description ? 'error' : ''}
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>
          </div>
        </div>

        {/* Tallas y Medidas */}
        <div className="form-section">
          <h4>Tallas y Medidas</h4>
          
          <div className="form-group">
            <label>Tallas Disponibles *</label>
            <div className="size-selector">
              {SIZES.map(size => (
                <label key={size} className="size-option">
                  <input
                    type="checkbox"
                    checked={formData.sizes.includes(size)}
                    onChange={() => handleSizeChange(size)}
                  />
                  <span className="size-label">{size}</span>
                </label>
              ))}
            </div>
            {errors.sizes && <span className="error-text">{errors.sizes}</span>}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="measurements.bust">Busto Base (cm)</label>
              <input
                type="number"
                id="measurements.bust"
                name="measurements.bust"
                value={formData.measurements.bust}
                onChange={handleInputChange}
                placeholder="86"
              />
            </div>
            <div className="form-group">
              <label htmlFor="measurements.waist">Cintura Base (cm)</label>
              <input
                type="number"
                id="measurements.waist"
                name="measurements.waist"
                value={formData.measurements.waist}
                onChange={handleInputChange}
                placeholder="66"
              />
            </div>
            <div className="form-group">
              <label htmlFor="measurements.hip">Cadera Base (cm)</label>
              <input
                type="number"
                id="measurements.hip"
                name="measurements.hip"
                value={formData.measurements.hip}
                onChange={handleInputChange}
                placeholder="92"
              />
            </div>
            <div className="form-group">
              <label htmlFor="measurements.length">Largo (cm)</label>
              <input
                type="number"
                id="measurements.length"
                name="measurements.length"
                value={formData.measurements.length}
                onChange={handleInputChange}
                placeholder="60"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="difficulty">Nivel de Dificultad</label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
            >
              {DIFFICULTY_LEVELS.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Imágenes */}
        <div className="form-section">
          <h4>Imágenes de Referencia *</h4>
          
          <div className="file-upload-area">
            <input
              type="file"
              id="images"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="images" className="upload-label">
              <div className="upload-icon">📷</div>
              <div className="upload-text">
                Seleccionar Imágenes ({images.length}/{MAX_IMAGES_PER_PRODUCT})
              </div>
              <div className="upload-hint">
                JPG, PNG, WebP - Máximo 5MB cada una
              </div>
            </label>
          </div>

          {images.length > 0 && (
            <div className="image-preview">
              {images.map(img => (
                <div key={img.id} className="image-item">
                  <img src={img.preview} alt="Preview" />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => removeImage(img.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          {errors.images && <span className="error-text">{errors.images}</span>}
        </div>

        {/* Archivos de Molde */}
        <div className="form-section">
          <h4>Archivos de Molde OptiTex</h4>
          
          <div className="file-upload-area">
            <input
              type="file"
              id="patterns"
              multiple
              accept=".pds,.rul,.ptn,.dxf"
              onChange={handlePatternUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="patterns" className="upload-label">
              <div className="upload-icon">📄</div>
              <div className="upload-text">
                Seleccionar Archivos de Molde
              </div>
              <div className="upload-hint">
                .pds, .rul, .ptn, .dxf - Máximo 50MB cada uno
              </div>
            </label>
          </div>

          {patternFiles.length > 0 && (
            <div className="file-list">
              {patternFiles.map(pattern => (
                <div key={pattern.id} className="file-item">
                  <span className="file-name">{pattern.name}</span>
                  <span className="file-size">
                    {(pattern.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <button
                    type="button"
                    className="remove-file"
                    onClick={() => removePattern(pattern.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Precios */}
        <div className="form-section">
          <h4>Precios</h4>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="basicPrice">Precio Molde Solo (COP) *</label>
              <input
                type="number"
                id="basicPrice"
                name="basicPrice"
                value={formData.basicPrice}
                onChange={handleInputChange}
                placeholder="25000"
                min="1000"
                className={errors.basicPrice ? 'error' : ''}
              />
              {errors.basicPrice && <span className="error-text">{errors.basicPrice}</span>}
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="includesTraining"
                  checked={formData.includesTraining}
                  onChange={handleInputChange}
                />
                Ofrecer capacitación personalizada
              </label>
            </div>

            {formData.includesTraining && (
              <>
                <div className="form-group">
                  <label htmlFor="trainingPrice">Precio con Capacitación (COP)</label>
                  <input
                    type="number"
                    id="trainingPrice"
                    name="trainingPrice"
                    value={formData.trainingPrice}
                    onChange={handleInputChange}
                    placeholder="45000"
                    min={parseInt(formData.basicPrice) + 1000 || 1000}
                    className={errors.trainingPrice ? 'error' : ''}
                  />
                  {errors.trainingPrice && <span className="error-text">{errors.trainingPrice}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="trainingDuration">Duración de Capacitación *</label>
                  <input
                    type="text"
                    id="trainingDuration"
                    name="trainingDuration"
                    value={formData.trainingDuration}
                    onChange={handleInputChange}
                    placeholder="2 horas"
                    className={errors.trainingDuration ? 'error' : ''}
                  />
                  {errors.trainingDuration && <span className="error-text">{errors.trainingDuration}</span>}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="trainingDescription">Descripción de la Capacitación *</label>
                  <textarea
                    id="trainingDescription"
                    name="trainingDescription"
                    value={formData.trainingDescription}
                    onChange={handleInputChange}
                    placeholder="Descripción de lo que incluye la capacitación..."
                    rows="3"
                    className={errors.trainingDescription ? 'error' : ''}
                  />
                  {errors.trainingDescription && <span className="error-text">{errors.trainingDescription}</span>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Etiquetas y Estado */}
        <div className="form-section">
          <h4>Información Adicional</h4>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="tags">Etiquetas (separadas por comas)</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="verano, elegante, oficina"
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Estado</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Panel de errores justo antes de los botones */}
        {errors.submit && (
          <div className="error-message error-before-button">
            <strong>❌ Error al guardar:</strong> {errors.submit}
          </div>
        )}

        {submitAttempted && Object.keys(errors).length > 0 && !errors.submit && (
          <div className="error-message validation-errors error-before-button">
            <strong>⚠️ Faltan campos obligatorios para guardar:</strong>
            <ul style={{ marginTop: '10px', marginLeft: '20px' }}>
              {errors.title && <li>Título del molde</li>}
              {errors.description && <li>Descripción del producto</li>}
              {errors.category && <li>Categoría</li>}
              {errors.sizes && <li>Seleccionar al menos una talla</li>}
              {errors.basicPrice && <li>Precio básico válido</li>}
              {errors.trainingPrice && <li>Precio con capacitación debe ser mayor al básico</li>}
              {errors.images && <li><strong>IMÁGENES:</strong> Debes subir al menos 1 imagen del producto</li>}
              {errors.patterns && <li><strong>ARCHIVOS DE MOLDE:</strong> Debes subir al menos 1 archivo (.PDS, .MKR, etc.)</li>}
            </ul>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-save"
            disabled={loading}
          >
            {loading ? (isEditing ? 'Actualizando...' : 'Guardando...') : (isEditing ? 'Actualizar Molde' : 'Guardar Molde')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm;