/**
 * Configuración de la API
 * En Render: el frontend y backend están bajo el mismo dominio,
 * las rutas /api/* se proxean automáticamente al backend
 */

const isDevelopment = process.env.NODE_ENV === 'development';

// En desarrollo, usar localhost:3000
// En producción (Render con dominio personalizado), usar ruta relativa
export const API_BASE = isDevelopment 
  ? (process.env.REACT_APP_API_URL || 'http://localhost:3000')
  : '';

// API_URL siempre incluye /api para rutas relativas
// En producción: /api (se sirve desde cebmolderia.com/api)
// En desarrollo: http://localhost:3000/api
export const API_URL = `${API_BASE}/api`;

// También exportar por defecto para compatibilidad
export default API_URL;


