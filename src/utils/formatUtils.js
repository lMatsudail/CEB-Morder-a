/**
 * Convierte tallas de cualquier formato (string JSON o array) a string legible
 * @param {string|array|any} sizes - Las tallas en cualquier formato
 * @returns {string} - Las tallas formateadas o "No especificadas"
 */
export const formatSizes = (sizes) => {
  try {
    if (!sizes) return 'No especificadas';
    
    let parsedSizes = sizes;
    
    // Si es string, intentar parsear como JSON
    if (typeof sizes === 'string') {
      parsedSizes = JSON.parse(sizes);
    }
    
    // Si es array, hacer join
    if (Array.isArray(parsedSizes)) {
      return parsedSizes.join(', ');
    }
    
    return 'No especificadas';
  } catch (error) {
    console.warn('Error formateando tallas:', sizes, error);
    return 'No especificadas';
  }
};

/**
 * Convierte tallas para mostrar como texto seguro
 * @param {string|array|any} sizes - Las tallas
 * @returns {string} - Las tallas o valor por defecto
 */
export const getSizesText = (sizes, defaultText = 'Estándar') => {
  const formatted = formatSizes(sizes);
  return formatted === 'No especificadas' ? defaultText : formatted;
};
