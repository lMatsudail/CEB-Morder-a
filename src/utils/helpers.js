/**
 * Formatea un precio en pesos colombianos
 * @param {number} price - El precio a formatear
 * @returns {string} - El precio formateado
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price);
};

/**
 * Formatea una fecha
 * @param {string|Date} date - La fecha a formatear
 * @returns {string} - La fecha formateada
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

/**
 * Valida si un email es válido
 * @param {string} email - El email a validar
 * @returns {boolean} - True si es válido
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida si una contraseña es fuerte
 * @param {string} password - La contraseña a validar
 * @returns {object} - Objeto con validación y mensaje
 */
export const validatePassword = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  if (password.length < minLength) {
    return {
      isValid: false,
      message: `La contraseña debe tener al menos ${minLength} caracteres`,
    };
  }
  
  return {
    isValid: true,
    message: 'Contraseña válida',
    strength: hasUpperCase && hasLowerCase && hasNumbers ? 'strong' : 'medium',
  };
};

/**
 * Genera un slug a partir de un texto
 * @param {string} text - El texto a convertir
 * @returns {string} - El slug generado
 */
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9 -]/g, '') // Eliminar caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios por guiones
    .replace(/-+/g, '-') // Eliminar guiones múltiples
    .trim('-'); // Eliminar guiones al inicio y final
};

/**
 * Trunca un texto a un número específico de caracteres
 * @param {string} text - El texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} - El texto truncado
 */
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Obtiene las iniciales de un nombre
 * @param {string} name - El nombre completo
 * @returns {string} - Las iniciales
 */
export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
};

/**
 * Debounce para funciones
 * @param {Function} func - La función a hacer debounce
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} - La función con debounce
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Verifica si un archivo es de un tipo permitido
 * @param {File} file - El archivo a verificar
 * @param {Array} allowedTypes - Tipos permitidos
 * @returns {boolean} - True si es permitido
 */
export const isFileTypeAllowed = (file, allowedTypes) => {
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  return allowedTypes.includes(extension);
};

/**
 * Convierte bytes a formato legible
 * @param {number} bytes - Número de bytes
 * @returns {string} - Tamaño formateado
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};