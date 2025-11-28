# PASOS PARA GITHUB Y RENDER

## Paso 3: Subir a GitHub

### 3.1 Crear Repositorio

1. Ir a https://github.com/new
2. Crear nuevo repositorio:
   - **Repository name**: `ceb-molderia`
   - **Description**: "Plataforma e-commerce de moldería y patronaje"
   - **Public** (para que sea accesible)
   - **NO** inicializar con README
3. Click en "Create repository"

### 3.2 Inicializar Git y Hacer Push

Ejecutar en PowerShell (desde la carpeta del proyecto):

```powershell
# Inicializar git
git init

# Agregar todos los archivos
git add .

# Primer commit
git commit -m "Initial commit: CEB Moldería y Patronaje - PostgreSQL migration"

# Cambiar rama a main (si es necesario)
git branch -M main

# Agregar remote origin
git remote add origin https://github.com/TU_USUARIO/ceb-molderia.git

# Push a GitHub
git push -u origin main
```

**Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub**

### 3.3 Verificar en GitHub

- Ve a https://github.com/TU_USUARIO/ceb-molderia
- Deberías ver todos los archivos del proyecto

---

## Paso 4: Configurar Render

### 4.1 Crear Base de Datos PostgreSQL

1. Ir a https://render.com/dashboard
2. Click en "New +" → "PostgreSQL"
3. Configurar:
   - **Name**: `ceb-molderia-db`
   - **Database**: `ceb_molderia`
   - **User**: `postgres` (default)
   - **Plan**: Free
4. Click "Create Database"
5. **COPIAR** la URL de conexión (CONNECTION STRING)
   - Se vea así: `postgresql://user:password@host:5432/database`
   - **GUARDAR en un lugar seguro**

### 4.2 Crear Backend (Web Service)

1. Click en "New +" → "Web Service"
2. Conectar GitHub:
   - Buscar y seleccionar: `ceb-molderia`
   - Click "Connect"
3. Configurar:
   - **Name**: `ceb-molderia-api`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
4. **NO** hacer click en "Deploy" todavía. Primero agregar variables de entorno.

### 4.3 Agregar Variables de Entorno (Backend)

En Render, en "ceb-molderia-api":

1. Click en "Environment"
2. Agregar variables:

```
DATABASE_URL=postgresql://user:password@host:5432/database
(Reemplazar con la URL que copiaste de la BD)

JWT_SECRET=tu-clave-super-segura-aqui-cambiar-esto

NODE_ENV=production

FRONTEND_URL=https://ceb-molderia-web.onrender.com
(Esto se actualizará después)
```

3. Click "Save"

### 4.4 Deploy Backend

1. Click "Deploy"
2. Ver logs (toma 2-5 minutos)
3. Cuando veas "Build successful", anotar URL:
   - Se ve así: `https://ceb-molderia-api.onrender.com`

### 4.5 Crear Frontend (Static Site)

1. Click en "New +" → "Static Site"
2. Conectar GitHub:
   - Buscar y seleccionar: `ceb-molderia`
   - Click "Connect"
3. Configurar:
   - **Name**: `ceb-molderia-web`
   - **Root Directory**: `.` (raíz)
   - **Build Command**: `npm run build`
   - **Publish Directory**: `build`
4. **Agregar variable de entorno:**
   - Click en "Environment"
   - Variable: `REACT_APP_API_URL`
   - Valor: `https://ceb-molderia-api.onrender.com`
5. Click "Deploy"

### 4.6 URLs Finales

Después de desplegar, tendrás:

- **Backend API**: https://ceb-molderia-api.onrender.com
- **Frontend**: https://ceb-molderia-web.onrender.com
- **Base de datos**: postgresql://... (Render)

---

## Paso 5: Verificar que Todo Funciona

### 5.1 Revisar Backend

1. Ir a: `https://ceb-molderia-api.onrender.com/api/health`
2. Deberías ver:
```json
{
  "message": "Servidor funcionando correctamente",
  "timestamp": "...",
  "version": "1.0.0"
}
```

### 5.2 Revisar Frontend

1. Ir a: `https://ceb-molderia-web.onrender.com`
2. Deberías ver tu aplicación cargando

### 5.3 Ver Logs

En Render Dashboard:
- Click en "ceb-molderia-api"
- Pestaña "Logs"
- Ver mensajes de conexión a PostgreSQL

---

## Resumen de URLs

| Servicio | URL |
|----------|-----|
| Frontend | https://ceb-molderia-web.onrender.com |
| Backend API | https://ceb-molderia-api.onrender.com |
| Database | postgresql://... (privada) |

---

## Próximos Pasos

Después de esto:

1. Crear usuario de prueba en la app
2. Probar compras
3. Verificar que todo funciona
4. Opcional: Agregar dominio personalizado a Render ($2.50/mes)

---

## Troubleshooting

### Si el backend no se inicia:

1. Ver logs en Render
2. Común: DATABASE_URL incorrecta
3. Solución: Copiar y pegar bien la URL

### Si el frontend no conecta:

1. Verificar variable `REACT_APP_API_URL`
2. Debe ser la URL completa del backend
3. Redeploy el frontend

### Base de datos vacía:

1. Las tablas se crean automáticamente
2. Ver logs del backend
3. Si hay error, revisar DATABASE_URL

---

¿Necesitas ayuda en algún paso?
