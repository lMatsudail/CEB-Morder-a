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
 * Construye la URL completa de descarga de una imagen
 * @param {object} file - Objeto del archivo
 * @returns {string} - URL completa del archivo
 */
export const getFileUrl = (file) => {
  if (!file || !file.filePath) {
    return null;
  }
  // filePath es algo como "productId/img_xxx_yyy.webp"
  return `/api/products/files/${file.filePath}`;
};

/**
 * Obtiene la URL de la primera imagen del producto
 * @param {object} product - Objeto del producto
 * @returns {string|null} - URL de la imagen o null
 */
export const getFirstImageUrl = (product) => {
  const firstImage = getFirstImage(product);
  return firstImage ? getFileUrl(firstImage) : null;
};
