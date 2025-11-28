// Configuración de la API
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || '/api',
  TIMEOUT: 10000,
};

// URLs de la aplicación
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CATALOG: '/catalogo',
  PRODUCT_DETAIL: '/producto/:id',
  DASHBOARD: '/dashboard',
  PATRONISTA_PANEL: '/patronista',
  CLIENTE_PANEL: '/cliente',
  CART: '/carrito',
  CHECKOUT: '/checkout',
};

// Roles de usuario
export const USER_ROLES = {
  CLIENTE: 'cliente',
  PATRONISTA: 'patronista',
};

// Tipos de producto
export const PRODUCT_TYPES = {
  BASIC: 'basic',
  TRAINING: 'training',
};

// Precios por defecto (en COP)
export const DEFAULT_PRICES = {
  BASIC_PRICE: 20000,
  TRAINING_PRICE: 80000,
};

// Estados de pedidos
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Tipos de archivo permitidos
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['.jpg', '.jpeg', '.png', '.webp'],
  PATTERNS: ['.pds', '.rul', '.ptn'],
  DOCUMENTS: ['.pdf'],
};

// Tamaños máximos de archivo (en bytes)
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  PATTERN: 50 * 1024 * 1024, // 50MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
};

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
};