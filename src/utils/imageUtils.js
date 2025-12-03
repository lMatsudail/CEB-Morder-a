/**
 * Obtiene la primera imagen del producto
 * @param {object} product - Objeto del producto
 * @returns {object|null} - El objeto de la primera imagen o null
 */
export const getFirstImage = (product) => {
  if (!product || !product.files || product.files.length === 0) {
    return null;
  }
  return product.files.find(f => f.fileType === 'image') || null;
};

/**
 * Obtiene todas las imágenes del producto
 * @param {object} product - Objeto del producto
 * @returns {array} - Array de imágenes
 */
export const getProductImages = (product) => {
  if (!product || !product.files || product.files.length === 0) {
    return [];
  }
  return product.files.filter(f => f.fileType === 'image');
};

/**
 * Construye la URL completa de descarga de una imagen desde BD
 * @param {object} file - Objeto del archivo
 * @param {number} productId - ID del producto
 * @returns {string} - URL completa del archivo desde BD
 */
export const getFileUrl = (file, productId) => {
  if (!file || !file.id || !productId) {
    return null;
  }
  return `/api/files/image/${productId}/${file.id}`;
};

/**
 * Obtiene la URL de la primera imagen del producto
 * @param {object} product - Objeto del producto
 * @returns {string|null} - URL de la imagen o null
 */
export const getFirstImageUrl = (product) => {
  const firstImage = getFirstImage(product);
  return firstImage ? getFileUrl(firstImage, product.id) : null;
};

/**
 * Obtiene el primer patrón/molde del producto
 * @param {object} product - Objeto del producto
 * @returns {object|null} - El objeto del primer patrón o null
 */
export const getFirstPattern = (product) => {
  if (!product || !product.files || product.files.length === 0) {
    return null;
  }
  return product.files.find(f => f.fileType === 'pattern') || null;
};

/**
 * Obtiene todos los patrones/moldes del producto
 * @param {object} product - Objeto del producto
 * @returns {array} - Array de patrones
 */
export const getProductPatterns = (product) => {
  if (!product || !product.files || product.files.length === 0) {
    return [];
  }
  return product.files.filter(f => f.fileType === 'pattern');
};

/**
 * Construye la URL para descargar un patrón desde BD
 * @param {object} pattern - Objeto del patrón
 * @param {number} productId - ID del producto
 * @returns {string} - URL completa del patrón desde BD
 */
export const getPatternUrl = (pattern, productId) => {
  if (!pattern || !pattern.id || !productId) {
    return null;
  }
  return `/api/files/pattern/${productId}/${pattern.id}`;
};

/**
 * Obtiene la URL del primer patrón del producto
 * @param {object} product - Objeto del producto
 * @returns {string|null} - URL del patrón o null
 */
export const getFirstPatternUrl = (product) => {
  const firstPattern = getFirstPattern(product);
  return firstPattern ? getPatternUrl(firstPattern, product.id) : null;
};
