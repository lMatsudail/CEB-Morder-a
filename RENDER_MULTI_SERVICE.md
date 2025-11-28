# Múltiples Servicios en Render (Misma Cuenta)

## Tu Situación Actual

- **Servicio 1**: Bot de Discord (ya alojado en Render)
- **Servicio 2**: CEB Moldería y Patronaje (nuevo)

## Solución: Completamente Independientes

### Opción A: Repositorio Único - Estructura Monorepo (RECOMENDADO)

**Ventaja**: 1 repositorio GitHub, fácil de mantener

```
tu-repo-github/
├── bot-discord/
│   ├── src/
│   ├── package.json
│   ├── render.yaml    (configuración Bot)
│   └── ...
│
├── ceb-molderia/
│   ├── server/
│   ├── src/
│   ├── package.json
│   ├── render.yaml    (configuración CEB)
│   └── ...
│
└── README.md
```

**En Render**:
1. 1er Service: **Bot Discord**
   - Root Directory: `bot-discord`
   - Build Command: `npm install`
   - Start Command: `npm start`

2. 2do Service: **CEB Backend**
   - Root Directory: `ceb-molderia/server`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. 3er Service: **CEB Frontend**
   - Root Directory: `ceb-molderia`
   - Build Command: `npm run build`
   - Publish Directory: `build`

---

### Opción B: Repositorios Separados (MÁXIMA INDEPENDENCIA)

**Ventaja**: Cada proyecto completamente separado

```
Repositorio 1: tu-bot-discord-repo/
├── src/
├── package.json
└── ...

Repositorio 2: ceb-molderia-repo/
├── server/
├── src/
├── package.json
└── ...
```

**En Render**:
- Servicio 1: Conectado a repo bot-discord
- Servicio 2: Conectado a repo ceb-molderia
- Variables de entorno separadas por servicio
- Deploy independientes

---

## MEJOR OPCIÓN PARA TI

### Opción B: Repositorios Separados

**Razones**:
1. ✅ Cada proyecto tiene su propio deployment
2. ✅ Bot Discord no se ve afectado si hay cambios en CEB
3. ✅ Variables de entorno completamente separadas
4. ✅ Histórico de commits independiente
5. ✅ Si hay problema en uno, el otro sigue funcionando

**Configuración**:

```
En Render Dashboard:
├── Service 1: bot-discord
│   - GitHub Repo: tu-usuario/bot-discord
│   - Environment: NODE_ENV, DISCORD_TOKEN, etc.
│   - Runs: Siempre corriendo en paralelo
│
└── Service 2: ceb-molderia-backend
    - GitHub Repo: tu-usuario/ceb-molderia
    - Environment: DATABASE_URL, JWT_SECRET, etc.
    - Runs: Siempre corriendo en paralelo

Database PostgreSQL: Compartida (opcional) o separada (recomendado)
```

---

## Paso a Paso: Configurar Repo Separado para CEB

### Paso 1: Crear Repositorio GitHub

```bash
# En tu proyecto CEB local
cd "C:\Users\thaur\Desktop\Proyecto CEB"

# Inicializar git (si no está ya)
git init
git add .
git commit -m "Initial commit: CEB Moldería y Patronaje"

# Crear repo en GitHub: https://github.com/new
# Nombre: ceb-molderia (o el que prefieras)

# Conectar y subir
git remote add origin https://github.com/tu-usuario/ceb-molderia.git
git branch -M main
git push -u origin main
```

### Paso 2: En Render Dashboard

**Para Backend (Node.js)**:
1. Click en "New +" → "Web Service"
2. Seleccionar repositorio: `ceb-molderia`
3. Configurar:
   ```
   Name: ceb-molderia-api
   Root Directory: server
   Build Command: npm install
   Start Command: npm start
   Plan: Free
   ```
4. Environment Variables:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=tu-clave-segura
   NODE_ENV=production
   CORS_ORIGIN=https://ceb-molderia-web.onrender.com
   ```

**Para Frontend (React)**:
1. Click en "New +" → "Static Site"
2. Seleccionar mismo repo: `ceb-molderia`
3. Configurar:
   ```
   Name: ceb-molderia-web
   Build Command: npm run build
   Publish Directory: build
   ```
4. Environment Variables:
   ```
   REACT_APP_API_URL=https://ceb-molderia-api.onrender.com
   ```

**Para Base de Datos**:
1. Click en "New +" → "PostgreSQL"
2. Configurar:
   ```
   Name: ceb-molderia-db
   Plan: Free
   ```
3. Copiar `DATABASE_URL` y agregarlo al Web Service

---

## Resultado: Tu Cuenta Render

```
Dashboard Render (tu-usuario)
│
├── bot-discord (Service - corriendo 24/7)
│   - URL: https://bot-discord-xxx.onrender.com
│   - Database: Propia (o compartida)
│   - Independiente
│
├── ceb-molderia-api (Web Service - corriendo 24/7)
│   - URL: https://ceb-molderia-api.onrender.com
│   - Database: ceb-molderia-db (PostgreSQL)
│   - Independiente
│
├── ceb-molderia-web (Static Site - siempre activo)
│   - URL: https://ceb-molderia-web.onrender.com
│   - Independiente
│
└── ceb-molderia-db (PostgreSQL - Gratis)
    - URL: postgresql://...
```

---

## Ventajas de esta Configuración

| Aspecto | Ventaja |
|---|---|
| **Independencia** | Bot y CEB nunca se interfieren |
| **Deploy** | Cada uno se despliega por separado |
| **Variables** | Cada servicio tiene sus propias variables |
| **Escalabilidad** | Puedes escalar servicios independientemente |
| **Costos** | Siguen siendo gratis ambos |
| **Control** | Control total sobre cada proyecto |

---

## Costos (Siguen siendo GRATIS)

```
Servicios en Render:
├── Bot Discord: $0 (free tier)
├── CEB Backend: $0 (free tier)
├── CEB Frontend: $0 (free tier)
└── PostgreSQL: $0 (500 MB gratis)

Total: $0 USD/mes
```

**Nota**: El plan Free tiene limitaciones (backend se duerme después de 15 min), pero para un proyecto académico de testing es perfecto.

---

## Resumen: Qué Hacer

### Opción Recomendada (Repositorios Separados)

1. **Crear repo GitHub** para CEB (`ceb-molderia`)
2. **Hacer push** de tu código actual
3. **En Render**: Crear 3 servicios nuevos
   - Web Service (Backend)
   - Static Site (Frontend)
   - PostgreSQL (Base de datos)
4. **Tu bot Discord** sigue igual, sin cambios

**Tiempo**: ~30 minutos

**Resultado**: Dos proyectos completamente independientes en Render

---

## ¿Preguntas Frecuentes?

**P: ¿Se va a caer el bot si despiego CEB?**
R: No, son completamente independientes. Son servicios separados.

**P: ¿Puedo compartir la misma PostgreSQL?**
R: Sí, pero no es recomendable. Mejor cada uno su propia BD para evitar conflictos.

**P: ¿Hay límite de servicios?**
R: No, Render no limita cantidad de servicios en plan free. Tienes tantos como quieras.

**P: ¿El costo sigue siendo $0?**
R: Sí, ambos proyectos siguen siendo gratis con las limitaciones del plan free.

---

## Próximo Paso

¿Quieres que te ayude a:

1. **Preparar GitHub** (crear repo y hacer push)
2. **Configurar Render** (crear los 3 servicios nuevos)
3. **Migrar SQLite a PostgreSQL** (cambiar database.js)
4. **Todo lo anterior** (setup completo)

¿Cuál prefieres?
