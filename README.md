# CEB Moldería y Patronaje

**Plataforma E-commerce Especializada en Moldería Digital**

Sistema web completo para la comercialización de moldes digitales de patronaje, con integración de archivos OptiTex y opciones de capacitación personalizada. Desarrollado con React.js y Node.js como proyecto académico de ingeniería de software.

## Descripción del Proyecto

Este proyecto implementa una solución completa de e-commerce orientada al mercado de la moldería y patronaje de moda. La plataforma conecta patronistas profesionales con diseñadores y confeccionistas, facilitando la comercialización de moldes digitales compatibles con OptiTex 23.2.

### Características Principales

- **Marketplace de Moldes Digitales**: Catálogo de patrones profesionales listos para producción
- **Sistema de Capacitación Integrado**: Plataforma para coordinar sesiones de formación personalizada
- **Arquitectura de Roles**: Gestión diferenciada de usuarios (Patronistas, Clientes, Administradores)
- **Control de Acceso a Recursos**: Sistema seguro de descarga de archivos digitales
- **Procesamiento de Pagos**: Integración con pasarelas de pago locales
- **Compatibilidad Industrial**: Archivos optimizados para plotters y sistemas CAD

## Modelo de Negocio

### Opciones de Producto

| Opción | Precio (COP) | Incluye |
|--------|--------------|---------|
| Molde Básico | $20,000 | Archivos digitales OptiTex |
| Molde + Capacitación | $80,000 | Archivos + Sesión personalizada 1:1 |

## Stack Tecnológico

### Frontend
- **React.js 18**: Biblioteca para construcción de interfaces de usuario
- **React Router DOM v6**: Enrutamiento declarativo para aplicaciones SPA
- **Context API**: Gestión de estado global (Autenticación, Carrito)
- **Axios**: Cliente HTTP para comunicación con API REST
- **CSS Modules**: Estilos modulares y encapsulados

### Backend
- **Node.js 16+**: Runtime de JavaScript del lado del servidor
- **Express.js 4**: Framework web minimalista y flexible
- **PostgreSQL (pg)**: Base de datos relacional en producción (Render)
- **bcryptjs**: Encriptación de contraseñas con algoritmo bcrypt
- **jsonwebtoken**: Implementación de JWT para autenticación stateless
- **Multer**: Middleware para manejo de archivos multipart/form-data

### Seguridad y Validación
- **JWT (JSON Web Tokens)**: Autenticación y autorización
- **bcrypt**: Hash de contraseñas con salt
- **CORS**: Control de acceso entre orígenes
- **Express Validator**: Sanitización y validación de inputs

## Arquitectura del Sistema

El proyecto implementa una arquitectura cliente-servidor con separación clara de responsabilidades:

```
Proyecto-CEB/
├── src/                      # Aplicación Frontend (React)
│   ├── components/          # Componentes reutilizables
│   │   ├── common/         # Componentes comunes (ErrorBoundary, Loading)
│   │   ├── forms/          # Formularios (AddProductForm, etc.)
│   │   └── layout/         # Layout (Navbar, Footer)
│   ├── pages/              # Páginas/Vistas principales
│   │   ├── auth/           # Autenticación (Login, Register)
│   │   ├── dashboard/      # Paneles (Patronista, Cliente)
│   │   └── shop/           # E-commerce (Catalog, Cart, Checkout)
│   ├── context/            # Context API
│   │   ├── AuthContext.js  # Estado de autenticación global
│   │   └── CartContext.js  # Estado del carrito de compras
│   ├── services/           # Servicios de comunicación con API
│   ├── utils/              # Utilidades (helpers, validators)
│   └── styles/             # Estilos globales
│
├── server/                  # Aplicación Backend (Node.js/Express)
│   ├── models/             # Capa de acceso a datos
│   │   └── database.js     # Configuración e inicialización de BD
│   ├── routes/             # Definición de endpoints API REST
│   │   ├── auth.js         # Autenticación y registro
│   │   ├── products.js     # CRUD de productos
│   │   ├── orders.js       # Gestión de pedidos
│   │   ├── users.js        # Gestión de usuarios
│   │   └── catalog.js      # Catálogo público
│   ├── middleware/         # Middleware de Express
│   │   └── auth.js         # Verificación de JWT
│   ├── config/             # Configuraciones
│   └── uploads/            # Almacenamiento temporal de archivos
│
└── public/                  # Recursos estáticos
    └── images/             # Imágenes de la aplicación
```

### Patrones de Diseño Implementados

- **MVC (Model-View-Controller)**: Separación de lógica de negocio, presentación y datos
- **Context Pattern**: Gestión de estado global en React
- **Repository Pattern**: Abstracción de acceso a datos
- **Middleware Pattern**: Cadena de procesamiento de peticiones HTTP
- **JWT Authentication**: Autenticación sin estado basada en tokens

## Instalación y Configuración

### Requisitos del Sistema

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **Git** para control de versiones
- Navegador web moderno (Chrome, Firefox, Edge)

### Guía de Instalación

#### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/proyecto-ceb.git
cd proyecto-ceb
```

#### 2. Instalar Dependencias
```bash
npm install
```

Este comando instalará todas las dependencias tanto del frontend como del backend especificadas en `package.json`.

#### 3. Configurar Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables (ejemplo para desarrollo local):

```env
# Configuración del Servidor
PORT=3000
NODE_ENV=development

# Base de Datos (usar Postgres en dev/prod)
DATABASE_URL=postgres://usuario:password@localhost:5432/ceb_db

# JWT Secret (generar uno seguro en producción)
JWT_SECRET=tu_clave_secreta_aqui_cambiar_en_produccion

# URLs/CORS
FRONTEND_URL=http://localhost:5000

# Frontend (React) - apunta al backend
REACT_APP_API_URL=http://localhost:3000
```

#### 4. Inicializar Base de Datos

La base de datos se inicializa automáticamente al ejecutar el servidor por primera vez. Las tablas se crean en PostgreSQL usando `server/models/database.js`. En producción se valida/crea el usuario admin (`admin@ceb.com`).

#### 5. Ejecutar en Modo Desarrollo

```bash
npm run dev
```

Este comando ejecuta concurrentemente:
- **Frontend**: http://localhost:5000 (React Development Server)
- **Backend**: http://localhost:3000 (Express Server con Nodemon)

### Scripts NPM Disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Ejecuta solo el frontend en modo desarrollo |
| `npm run server` | Ejecuta solo el backend con auto-reload (nodemon) |
| `npm run dev` | Ejecuta frontend y backend concurrentemente |
| `npm run build` | Compila la aplicación para producción |
| `npm test` | Ejecuta la suite de tests (Jest) |

### Datos de Prueba

Para probar la aplicación, puedes usar las siguientes credenciales:

**Patronista:**
- Email: patronista@ejemplo.com
- Contraseña: 123456

**Cliente:**
- Email: cliente@ejemplo.com
- Contraseña: 123456

## Funcionalidades por Rol de Usuario

### Rol: Patronista (Vendedor)

El patronista tiene acceso a un panel de administración donde puede:

- **Gestión de Productos**
  - Crear nuevos moldes con información detallada
  - Subir archivos OptiTex (.pds, .rul, .ptn, .dxf)
  - Establecer precios diferenciados (básico vs. con capacitación)
  - Categorizar moldes por dificultad y tipo de prenda
  
- **Administración de Ventas**
  - Visualizar estadísticas de ventas
  - Gestionar pedidos recibidos
  - Controlar inventario de moldes digitales
  
- **Gestión de Capacitaciones**
  - Configurar opciones de capacitación personalizada
  - Establecer duración y contenido de sesiones
  - Coordinar horarios con clientes

### Rol: Cliente (Comprador)

Los clientes registrados pueden:

- **Exploración de Catálogo**
  - Navegar el catálogo completo de moldes
  - Filtrar por categoría, dificultad, precio
  - Ver previsualizaciones y especificaciones técnicas
  
- **Proceso de Compra**
  - Agregar moldes al carrito de compras
  - Seleccionar opción básica o con capacitación
  - Completar proceso de checkout seguro
  
- **Gestión de Compras**
  - Acceder a moldes adquiridos
  - Descargar archivos OptiTex ilimitadamente
  - Programar sesiones de capacitación
  - Ver historial de pedidos

## Sistema de Autenticación y Seguridad

### Implementación de JWT

El sistema implementa autenticación basada en JSON Web Tokens (JWT) con las siguientes características:

1. **Generación de Tokens**
   - Se genera un token al iniciar sesión exitosamente
   - El token incluye el ID de usuario y rol
   - Tiempo de expiración configurable (por defecto 24h)

2. **Almacenamiento**
   - Los tokens se almacenan en localStorage del navegador
   - Se incluyen en el header `Authorization` de cada petición: `Bearer <token>`

3. **Verificación**
   - Middleware de autenticación valida el token en rutas protegidas
   - Verifica firma, expiración e integridad del token

### Endpoints de API - Autenticación

| Método | Endpoint | Descripción | Requiere Auth |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Registrar nuevo usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/me` | Obtener usuario actual | Sí |

### Seguridad Implementada

- **Encriptación de Contraseñas**: bcrypt con salt rounds = 10
- **Validación de Inputs**: Express Validator para sanitización
- **CORS Configurado**: Control de orígenes permitidos
- **SQL Injection Prevention**: Uso de prepared statements
- **XSS Protection**: Sanitización de datos de entrada

## Gestión de Archivos Digitales

### Formatos Soportados

#### Archivos de Molde (OptiTex)
- `.pds` - Patrón de diseño OptiTex
- `.rul` - Reglas de gradación
- `.ptn` - Patrón compilado
- `.dxf` - AutoCAD Drawing Exchange Format

#### Archivos Multimedia
- `.jpg`, `.jpeg` - Imágenes de producto
- `.png` - Imágenes con transparencia
- `.webp` - Formato optimizado para web

### Sistema de Almacenamiento

**Entorno de Desarrollo:**
- Almacenamiento local en `server/uploads/`
- Organización por tipo: `products/`, `patterns/`, `images/`

**Consideraciones de Producción:**
- Integración planificada con AWS S3
- CDN para distribución de contenido estático
- Límites de tamaño: 5MB (imágenes), 50MB (archivos de molde)

## API REST Endpoints

### Productos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | Listar todos los productos | No |
| GET | `/api/products/:id` | Obtener producto por ID | No |
| POST | `/api/products` | Crear nuevo producto | Sí (Patronista) |
| PUT | `/api/products/:id` | Actualizar producto | Sí (Patronista) |
| DELETE | `/api/products/:id` | Eliminar producto | Sí (Patronista) |
| GET | `/api/products/my-products` | Productos del patronista | Sí (Patronista) |

### Catálogo Público

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/catalog/products` | Catálogo público | No |
| GET | `/api/catalog/products/:id` | Detalle de producto | No |

### Pedidos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | Crear nuevo pedido | Sí |
| GET | `/api/orders/my-orders` | Pedidos del usuario | Sí |
| GET | `/api/orders/:id` | Detalle de pedido | Sí |

### Usuarios

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/profile` | Obtener perfil | Sí |
| PUT | `/api/users/profile` | Actualizar perfil | Sí |

## Despliegue en Producción

### Preparación para Producción

1. **Compilar Frontend**
```bash
npm run build
```

2. **Configurar Variables de Entorno**
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=clave_secreta_segura_aleatoria
DATABASE_PATH=./database/production.db
```

3. **Iniciar Servidor**
```bash
npm start
```

### Despliegue en Render

**Backend (Web Service):**
- Servicio: `https://ceb-molderia-api.onrender.com`
- Variables: `NODE_ENV=production`, `JWT_SECRET`, `DATABASE_URL` (PostgreSQL de Render)
- CORS: define `FRONTEND_URL=https://ceb-molderia-web.onrender.com`
- Health: `/api/health` y `/api/health/db`

**Frontend (Static Site):**
- Sitio: `https://ceb-molderia-web.onrender.com`
- Variable: `REACT_APP_API_URL=https://ceb-molderia-api.onrender.com`
- Reconstruye cuando cambian `src/**` y `public/**`

### Consideraciones de Producción

- HTTPS provisto por Render
- Rate limiting y cabeceras seguras (Helmet)
- Logs de servidor (Render + futura integración de Winston)
- Backups en Postgres de Render
- Monitoring (Sentry, futuro)

## Base de Datos

### Esquema Relacional (PostgreSQL)

Columnas en minúsculas (sin comillas) para evitar problemas de case-sensitivity.

```sql
-- Usuarios
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  role TEXT CHECK (role IN ('patronista','cliente','admin')) NOT NULL,
  phone TEXT,
  city TEXT,
  createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Productos
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  patronistaid INTEGER REFERENCES users(id),
  category TEXT,
  difficulty TEXT CHECK (difficulty IN ('principiante','intermedio','avanzado')),
  baseprice NUMERIC(12,2) NOT NULL,
  trainingprice NUMERIC(12,2),
  sizes TEXT,
  measurements TEXT,
  tags TEXT,
  status TEXT DEFAULT 'active',
  createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing

El proyecto incluye tests unitarios y de integración:

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm test -- --watch

# Generar reporte de cobertura
npm test -- --coverage
```

## Documentación Adicional

Para información detallada sobre la arquitectura y prácticas de código, consultar:

- **`CODE_QUALITY.md`** - Estándares de código y mejores prácticas implementadas

## Licencia

Este proyecto ha sido desarrollado con fines académicos como parte del programa de Desarrollo Web.

## Autor

**José Luis Florez Casas**
- Contacto: thaurken@hotmail.com

## Agradecimientos

- Comunidad de patronistas y diseñadores de moda colombianos
- OptiTex por proporcionar el estándar de archivos de patronaje
- Profesores y compañeros del programa de Ingeniería de Software

## Estado Actual del Proyecto

### Componentes Completados

- ✅ **Arquitectura Base**: Estructura completa del proyecto con separación frontend/backend
- ✅ **Autenticación**: Sistema completo de registro, login y gestión de sesiones con JWT
- ✅ **Base de Datos**: PostgreSQL (Render) con tablas en minúsculas
- ✅ **API REST**: Endpoints funcionales para usuarios, productos, pedidos y catálogo
- ✅ **Sistema de Roles**: Implementación de permisos diferenciados por rol
- ✅ **Interfaz de Usuario**: Diseño responsivo y profesional
- ✅ **Carrito de Compras**: Persistencia en localStorage
- ✅ **Catálogo Público**: Visualización de productos con filtros y búsqueda
- ✅ **Panel de Patronista/Cliente/Admin**: Gestión y administración
- ✅ **Gestión de Archivos**: Subida y validación de archivos

### Funcionalidades en Desarrollo

- 🔄 **Sistema de Pagos**: Integración con pasarela de pagos pendiente
- 🔄 **Módulo de Capacitación**: Sistema de agendamiento de sesiones
- 🔄 **Dashboard Analytics**: Estadísticas y reportes de ventas
- 🔄 **Sistema de Notificaciones**: Alertas de pedidos y mensajes

### Mejoras Futuras

- **Escalabilidad**
  - Caché con Redis
  - Microservicios para funcionalidades específicas

- **Características Adicionales**
  - Sistema de reviews y calificaciones
  - Chat en tiempo real entre patronistas y clientes
  - Recomendaciones personalizadas con ML
  - Aplicación móvil con React Native

- **Optimizaciones**
  - Server-Side Rendering (SSR) con Next.js
  - Progressive Web App (PWA)
  - CDN para contenido estático
  - Lazy loading de componentes

---

**Proyecto desarrollado por Jose Luis Florez para CEB- Metalmencanica**