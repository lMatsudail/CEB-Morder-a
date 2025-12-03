/**
 * Configuración de la API
 * En Render: el frontend y backend están bajo el mismo dominio,
 * las rutas /api/* se proxean automáticamente al backend
 */

const isDevelopment = process.env.NODE_ENV === 'development';

// En desarrollo, usar localhost:3000
// En producción (Render), usar ruta relativa (se sirve desde el mismo dominio)
export const API_BASE = isDevelopment 
  ? (process.env.REACT_APP_API_URL || 'http://localhost:3000')
  : '';

// API_URL siempre incluye /api para rutas relativas
export const API_URL = `${API_BASE}/api`;

// También exportar por defecto para compatibilidad
export default API_URL;

