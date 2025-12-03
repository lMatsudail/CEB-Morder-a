// Campos específicos para productos de moldería
export const PRODUCT_FIELDS = {
  // Información básica
  name: 'Nombre del molde',
  description: 'Descripción detallada',
  category: 'Categoría de prenda',
  
  // Información técnica de moldería
  garmentType: 'Tipo de prenda', // Blusa, Pantalón, Vestido, etc.
  sizes: 'Tallas disponibles', // XS, S, M, L, XL, etc.
  measurements: 'Medidas base', // Busto, cintura, cadera, etc.
  difficulty: 'Nivel de dificultad', // Principiante, Intermedio, Avanzado
  
  // Archivos
  images: 'Imágenes de referencia', // Mínimo 1, máximo 5
  patternFiles: 'Archivos de molde OptiTex', // .pds, .rul, .ptn
  
  // Precios
  basePrice: 'Precio molde solo',
  withTrainingPrice: 'Precio molde + capacitación',
  
  // Capacitación
  includesTraining: 'Incluye capacitación',
  trainingDuration: 'Duración de capacitación',
  trainingDescription: 'Descripción de la capacitación',
  
  // Metadatos
  status: 'Estado', // draft, published, discontinued
  tags: 'Etiquetas', // verano, invierno, fiesta, casual, etc.
};

export const GARMENT_TYPES = [
  'Blusa',
  'Camisa',
  'Vestido',
  'Falda',
  'Pantalón',
  'Short',
  'Chaqueta',
  'Abrigo',
  'Ropa Interior',
  'Traje de Baño',
  'Ropa Deportiva',
  'Otro'
];

export const SIZES = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL',
  '6', '8', '10', '12', '14', '16', '18', '20'
];

export const DIFFICULTY_LEVELS = [
  { value: 'Principiante', label: 'Principiante' },
  { value: 'Intermedio', label: 'Intermedio' },
  { value: 'Avanzado', label: 'Avanzado' }
];

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp'
];

export const ALLOWED_PATTERN_TYPES = [
  '.pds',
  '.rul',
  '.ptn',
  '.dxf' // Formato adicional común en patronaje
];

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_PATTERN_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_IMAGES_PER_PRODUCT = 5;