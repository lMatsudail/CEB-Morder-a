# GUÍA COMPLETA: DEPLOY EN RENDER

## Tu Repositorio GitHub
- **URL**: https://github.com/lMatsudail/CEB-Morder-a
- **Rama**: main
- **Estado**: ✅ Listo

---

## PASO 1: Crear Base de Datos PostgreSQL

### En Render Dashboard:

1. Abre: https://render.com/dashboard
2. Click en **"New +"** (arriba a la derecha)
3. Selecciona **"PostgreSQL"**
4. Completa los datos:
   - **Name**: `ceb-molderia-db`
   - **Database**: `ceb_molderia`
   - **User**: `postgres` (default)
   - **Password**: Render lo genera automáticamente
   - **Region**: Tu región más cercana
   - **Plan**: **Free** ← Importante
5. Click **"Create Database"**

### Espera 2-3 minutos a que se cree

Cuando esté lista, verás:
- **Internal Database URL** (úsala localmente)
- **External Database URL** (úsala desde el backend)

**COPIAR y GUARDAR** la **External Database URL** (se ve así):
```
postgresql://user:password@host.render.com:5432/database
```

---

## PASO 2: Crear Backend (Web Service)

### En Render Dashboard:

1. Click **"New +"**
2. Selecciona **"Web Service"**
3. Click **"Connect an existing repository"**
4. Busca y selecciona: **`CEB-Morder-a`**
5. Click **"Connect"**

### Configurar el Backend:

Completa los campos:

```
Name: ceb-molderia-api
Root Directory: server
Runtime: Node
Build Command: npm install
Start Command: npm start
Plan: Free
```

### NO HAGAS CLICK EN "DEPLOY" TODAVÍA

Primero necesitas agregar las variables de entorno.

---

## PASO 3: Agregar Variables de Entorno (Backend)

En la misma página del Web Service, busca **"Environment"** o **"Env"**

Agrega estas variables:

```
DATABASE_URL = postgresql://user:password@host.render.com:5432/ceb_molderia
(Reemplaza con la URL que copiaste del paso 1)

JWT_SECRET = tu-clave-super-segura-cambiar-esto

NODE_ENV = production

FRONTEND_URL = (dejar vacío por ahora, se actualizará)

BACKEND_URL = (dejar vacío por ahora)
```

### Guarda las variables

---

## PASO 4: Deploy del Backend

1. Click en **"Deploy"** (botón grande)
2. Espera 5-10 minutos
3. Ver logs en la pestaña **"Logs"**
4. Cuando veas **"Build successful"**, está listo

### Anotar la URL del Backend

Cuando esté desplegado, Render te muestra una URL como:
```
https://ceb-molderia-api.onrender.com
```

**GUARDAR esta URL** - la necesitarás en el siguiente paso.

---

## PASO 5: Crear Frontend (Static Site)

### En Render Dashboard:

1. Click **"New +"**
2. Selecciona **"Static Site"**
3. Click **"Connect an existing repository"**
4. Selecciona: **`CEB-Morder-a`**
5. Click **"Connect"**

### Configurar el Frontend:

```
Name: ceb-molderia-web
Root Directory: . (punto, significa raíz)
Build Command: npm run build
Publish Directory: build
Plan: Free
```

### Agregar Variable de Entorno (Frontend):

En **"Environment"** agrega:

```
REACT_APP_API_URL = https://ceb-molderia-api.onrender.com
(Reemplaza con la URL exacta del backend que anotaste)
```

---

## PASO 6: Deploy del Frontend

1. Click **"Deploy"**
2. Espera 3-5 minutos
3. Cuando esté listo, Render te muestra la URL como:
```
https://ceb-molderia-web.onrender.com
```

---

## PASO 7: Verificar que TODO Funciona

### Verificar Backend:

Abre en el navegador:
```
https://ceb-molderia-api.onrender.com/api/health
```

Deberías ver:
```json
{
  "message": "Servidor funcionando correctamente",
  "timestamp": "...",
  "version": "1.0.0"
}
```

Si ves esto, ✅ **Backend funciona**

### Verificar Frontend:

Abre en el navegador:
```
https://ceb-molderia-web.onrender.com
```

Deberías ver tu app cargando. ✅ **Frontend funciona**

---

## URLS FINALES

Cuando todo esté listo:

| Servicio | URL |
|----------|-----|
| **Frontend** | https://ceb-molderia-web.onrender.com |
| **Backend API** | https://ceb-molderia-api.onrender.com |
| **Base de Datos** | postgresql://... (privada) |

---

## TROUBLESHOOTING

### Si el backend no se inicia:

1. Click en el servicio "ceb-molderia-api"
2. Pestaña **"Logs"**
3. Ver el error
4. Común: `DATABASE_URL` incorrecta
5. Solución: Copiar y pegar bien la URL

### Si el frontend muestra error 404:

1. Verificar que `REACT_APP_API_URL` esté correcta
2. Redeploy el frontend (botón "Redeploy")

### Si la base de datos no conecta:

1. Verificar que PostgreSQL esté "Available" (estado en verde)
2. Copiar bien la URL (sin espacios)
3. Reintentar

---

## PRÓXIMOS PASOS OPCIONALES

### Agregar Dominio Personalizado (opcional)

En cualquier servicio (frontend o backend):
1. Click en el servicio
2. Pestaña **"Settings"**
3. Buscar **"Custom Domain"**
4. Agregar tu dominio (ej: molderia-ceb.com)
5. Seguir instrucciones para apuntar DNS

**Costo**: $2.50/mes (muy económico)

### Aumentar Recursos (si es necesario)

Si algún servicio se queda sin recursos:
1. Click en el servicio
2. Pestaña **"Settings"**
3. Cambiar Plan de "Free" a "Starter" ($7/mes)

---

## RESUMEN DEL PROCESO

1. ✅ PostgreSQL creada
2. ✅ Backend desplegado
3. ✅ Frontend desplegado
4. ✅ Todo funciona

**Tiempo total**: 20-30 minutos

---

## ¿NECESITAS AYUDA?

Si algo no funciona:
1. Copiar el error exacto de los logs
2. Avisar el error
3. Corregiré juntos

¡Mucho éxito con el deploy! 🚀
