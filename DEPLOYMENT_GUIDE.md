# Guía de Deployment: CEB Moldería y Patronaje

## Análisis del Proyecto

Tu proyecto tiene estas características:
- **Frontend**: React 18.3.1 (aplicación SPA)
- **Backend**: Node.js + Express 4.18.2
- **Base de Datos**: SQLite3 (desarrollo) - NECESITA CAMBIO PARA PRODUCCIÓN
- **Tamaño estimado**: Pequeño-Medio (e-commerce académico)
- **Requisitos**: Node.js 16+, npm

---

## PROBLEMA CRÍTICO: SQLite en Producción

**SQLite NO es recomendable para producción** porque:
- No soporta concurrencia real
- No es escalable
- Problemas con múltiples conexiones simultáneas
- Riesgo de corrupción de datos

**Solución**: Migrar a PostgreSQL (gratis y robusto)

---

## MEJORES OPCIONES ECONÓMICAS

### Opción 1: RENDER (RECOMENDADO - 100% Gratis + Pago opcional)

**Características**:
- ✅ Hosting gratis para frontend y backend
- ✅ PostgreSQL gratuito (500 MB)
- ✅ SSL/HTTPS automático
- ✅ Redeploy automático con Git
- ✅ Logs en tiempo real
- ✅ Sin tarjeta de crédito requerida

**Costos**:
- **Gratis**: Todo (mientras esté en tier gratuito)
- **Pago** (opcional): $7/mes por servicio si necesitas más recursos

**Límites Gratuitos**:
- Backend se duerme después de 15 min sin actividad (se reactiva al acceder)
- PostgreSQL: 500 MB
- Ancho de banda limitado pero suficiente para testing
- CPU compartida

**Para tu proyecto**: PERFECTO. Es ideal para una demo académica.

---

### Opción 2: RAILWAY (Muy Buena - Crédito Gratis)

**Características**:
- ✅ $5 USD crédito gratuito (suficiente 1-2 meses)
- ✅ PostgreSQL gratis
- ✅ Hosting rápido
- ✅ Variables de entorno integradas

**Costos**:
- **Gratuito**: $5 crédito inicial (dura ~1-2 meses)
- **Pago**: $5-20/mes después (muy económico)

**Para tu proyecto**: Buena opción si quieres máxima velocidad gratis

---

### Opción 3: NETLIFY + HEROKU (Clásico)

**Características**:
- ✅ Netlify: Frontend gratis (excelente para React)
- ✅ Heroku: Backend con dyno gratuito (pero lento)
- ✅ PostgreSQL en Heroku gratis

**Costos**:
- **Netlify**: $0 (siempre gratuito para proyectos estáticos)
- **Heroku**: $0 (dyno free but will sleep)

**Problema**: Heroku cambió su modelo gratuito en 2022, ya no es tan bueno

---

### Opción 4: VERCEL + CUSTOM NODE SERVER (Intermedio)

**Características**:
- ✅ Vercel: Frontend React gratuito (ultrarrápido)
- ✅ Necesitas backend en otro lado
- ✅ Serverless functions posible

**Problema**: Vercel es para frontend estático, tu backend necesita servidor corriendo

---

## PLAN RECOMENDADO: RENDER

### Paso 1: Preparar el Proyecto

**A. Migrar de SQLite a PostgreSQL**

```bash
# Cambiar database.js para usar PostgreSQL
npm install pg
```

**B. Crear archivo .env.production**

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=tu_url_de_postgres_aqui
JWT_SECRET=una_clave_segura_muy_larga
CORS_ORIGIN=https://tu-frontend.onrender.com
```

**C. Preparar estructura para Render**

```
Proyecto CEB/
├── server/
│   ├── server.js
│   ├── package.json
│   ├── models/database.js (actualizado para PostgreSQL)
│   └── ...
├── src/                    (Frontend React)
├── public/
├── package.json            (SOLO scripts de build)
└── render.yaml            (configuración Render)
```

---

### Paso 2: Crear Cuentas

1. **Render** (https://render.com)
   - Crear cuenta con GitHub/Google
   - Conectar repositorio GitHub

2. **GitHub** (si no tienes)
   - Crear cuenta
   - Hacer push de tu proyecto

---

### Paso 3: Desplegar en Render

**Para el Backend**:
1. Dashboard de Render → "New Service" → "Web Service"
2. Conectar repositorio GitHub
3. Configurar:
   - **Name**: ceb-patronaje-api
   - **Root Directory**: server
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. Agregar variables de entorno (Environment)

**Para el Frontend**:
1. Dashboard de Render → "New" → "Static Site"
2. Conectar mismo repositorio
3. Configurar:
   - **Name**: ceb-patronaje-web
   - **Root Directory**: .
   - **Build Command**: `npm run build`
   - **Publish Directory**: build

---

### Paso 4: Configurar Base de Datos

**En Render**:
1. Dashboard → "Databases" → "New PostgreSQL"
2. Configurar:
   - **Name**: ceb-db
   - **Plan**: Free
3. Copiar URL de conexión
4. Agregar a variables de entorno como `DATABASE_URL`

---

## COMPARATIVA FINAL

| Característica | Render | Railway | Netlify+Heroku |
|---|---|---|---|
| **Frontend Gratis** | ✅ | ✅ | ✅ Netlify |
| **Backend Gratis** | ✅ (duerme) | ✅ (1-2 meses) | ❌ Heroku |
| **PostgreSQL Gratis** | ✅ | ✅ | ✅ Heroku |
| **SSL/HTTPS** | ✅ | ✅ | ✅ |
| **Facilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Para tu Proyecto** | 🏆 MEJOR | 2do lugar | 3er lugar |

---

## PASOS RESUMIDOS

### Opción Rápida (30 minutos):

**1. Preparar GitHub**
```bash
cd "C:\Users\thaur\Desktop\Proyecto CEB"
git init
git add .
git commit -m "Initial commit: CEB Moldería"
git branch -M main
git remote add origin https://github.com/tu-usuario/ceb-molderia.git
git push -u origin main
```

**2. En Render.com**
- Conectar GitHub
- Crear 1 Web Service (backend)
- Crear 1 Static Site (frontend)
- Crear PostgreSQL
- Listo en 5-10 minutos

**3. Actualizar variables de entorno**
- En Backend: DATABASE_URL, JWT_SECRET
- En Frontend: REACT_APP_API_URL

---

## PASOS DETALLADOS DESPUÉS

### Fase 1: Migrar SQLite → PostgreSQL

**Archivo: server/models/database.js**

Cambiar de:
```javascript
const sqlite3 = require('sqlite3');
```

A:
```javascript
const { Client } = require('pg');
```

### Fase 2: Actualizar Variables de Entorno

**Frontend (.env.production)**:
```
REACT_APP_API_URL=https://ceb-patronaje-api.onrender.com
```

**Backend (.env.production)**:
```
DATABASE_URL=postgresql://user:password@host/dbname
JWT_SECRET=genera-una-clave-aleatoria-super-segura
```

### Fase 3: Test en Local

```bash
npm run build       # Compilar React
npm run server      # Iniciar backend
```

---

## COSTO FINAL ANUAL

| Servicio | Render | Railway | Netlify+Heroku |
|---|---|---|---|
| **Año 1** | $0 | $5 | Revisión necesaria |
| **Año 2+** | $0-84 (si escalas) | $60+ | Revisión |

**Para tu proyecto académico**: **$0 TODO EL AÑO con Render**

---

## DOMINIO (OPCIONAL)

Si quieres dominio personalizado (ejemplo: molderia-ceb.com):

**Opciones económicas**:
- **Namecheap**: $0.99-3.99/año (primera vez)
- **Google Domains**: $12/año
- **Porkbun**: $0.99-4.99/año

**Apuntar a Render**: Agregar registros CNAME

**Costo total dominio + hosting**: $1-5/año = ULTRA ECONÓMICO

---

## RECOMENDACIÓN FINAL

### Para Demo/Test (HOY):
✅ **Render** (gratis, sin tarjeta, 5-10 minutos)

### Para Producción:
✅ **Render** ($7-10/mes) o **Railway** ($5-20/mes)

### Con Dominio Personalizado:
✅ **Render ($0-7/mes) + Dominio Namecheap ($1-3/año) = $10-90/año total**

---

## Siguiente Paso

¿Quieres que te ayude a:
1. Migrar SQLite → PostgreSQL?
2. Preparar el proyecto para Render?
3. Hacer push a GitHub?
4. Configurar el deployment en Render?

Elige el siguiente paso 👇
