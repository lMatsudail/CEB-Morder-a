/**
 * Utilidades para localStorage con manejo de errores
 */

/**
 * Guarda un valor en localStorage
 * @param {string} key - La clave
 * @param {any} value - El valor a guardar
 * @returns {boolean} - True si se guardó exitosamente
 */
export const setLocalStorage = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Obtiene un valor de localStorage
 * @param {string} key - La clave
 * @param {any} defaultValue - Valor por defecto si no existe
 * @returns {any} - El valor obtenido o el valor por defecto
 */
export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Elimina un valor de localStorage
 * @param {string} key - La clave a eliminar
 * @returns {boolean} - True si se eliminó exitosamente
 */
export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Limpia todo el localStorage
 * @returns {boolean} - True si se limpió exitosamente
 */
export const clearLocalStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Verifica si localStorage está disponible
 * @returns {boolean} - True si está disponible
 */
export const isLocalStorageAvailable = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
};

// Claves comunes para localStorage
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  CART_ITEMS: 'cart_items',
  PREFERENCES: 'user_preferences',
  RECENT_SEARCHES: 'recent_searches',
};