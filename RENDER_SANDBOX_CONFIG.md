# 🔧 Variables de Entorno para Render (Sandbox Mode)

## 📋 Copiar y pegar en Render Dashboard

### Backend (Web Service)

Ve a: **Render Dashboard** → **ceb-molderia-api** → **Environment** → **Add Environment Variable**

```env
NODE_ENV=production
PORT=10000

JWT_SECRET=Mtsu.0128

DATABASE_URL=postgresql://ceb_molderia_user:NyhT18ltTrQip9dRupC8QOK4Iavz2Zlf@dpg-d4kuh4qli9vc73e0cd30-a.oregon-postgres.render.com/ceb_molderia

UPLOAD_DIR=./server/uploads
MAX_FILE_SIZE=10485760

FRONTEND_URL=https://ceb-molderia-web.onrender.com
BACKEND_URL=https://ceb-molderia-api.onrender.com

# WOMPI - MODO SANDBOX (PRUEBAS)
WOMPI_PUBLIC_KEY=pub_test_QxG0jJJQQGwh3OOl1EwOHkG3CxTVhfSU
WOMPI_PRIVATE_KEY=
WOMPI_EVENT_SECRET=
WOMPI_URL=https://sandbox.wompi.co/v1
WOMPI_PAYMENT_METHODS=CARD,PSE,NEQUI

EMAIL_SERVICE=gmail
EMAIL_USER=
EMAIL_PASS=

GENERATE_SOURCEMAP=false
ESLINT_NO_DEV_ERRORS=true
TSC_COMPILE_ON_ERROR=true
```

---

### Frontend (Static Site)

Ve a: **Render Dashboard** → **ceb-molderia-web** → **Environment** → **Add Environment Variable**

```env
REACT_APP_API_URL=https://ceb-molderia-api.onrender.com
GENERATE_SOURCEMAP=false
REACT_APP_SUPPRESS_RESIZEOBSERVER_ERROR=true
ESLINT_NO_DEV_ERRORS=true
TSC_COMPILE_ON_ERROR=true
```

---

## 🚀 Pasos para Actualizar

### 1. Actualizar Backend

1. Ir a: https://dashboard.render.com
2. Click en **ceb-molderia-api**
3. Menú lateral → **Environment**
4. Buscar `WOMPI_PUBLIC_KEY` (o crear si no existe)
5. Cambiar valor a: `pub_test_QxG0jJJQQGwh3OOl1EwOHkG3CxTVhfSU`
6. Buscar `WOMPI_URL` (o crear)
7. Cambiar valor a: `https://sandbox.wompi.co/v1`
8. Agregar `WOMPI_PAYMENT_METHODS=CARD,PSE,NEQUI` si no existe
9. Click **Save Changes**
10. El servicio se reiniciará automáticamente

### 2. Verificar Deploy

Espera 2-3 minutos y verifica los logs:

```
✅ Debe aparecer:
Conectado a PostgreSQL exitosamente
Servidor ejecutándose en puerto 10000
```

❌ NO debe aparecer:
```
Error creando link de pago Wompi: {
  error: { type: 'INVALID_ACCESS_TOKEN', reason: 'Solicitud no autorizada' }
}
```

---

## 🧪 Probar en Producción (Render)

1. Ir a: https://ceb-molderia-web.onrender.com
2. Agregar productos al carrito
3. Click **Pagar con Wompi**
4. Usar tarjeta de prueba: `4242 4242 4242 4242`
5. Completar pago
6. Verificar redirección a checkout con estado

---

## 📝 Notas Importantes

- ✅ En modo sandbox NO se procesa dinero real
- ✅ Las tarjetas de prueba solo funcionan en sandbox
- ✅ Los webhooks en sandbox son limitados
- ⚠️ **NUNCA** subas llaves reales de producción a GitHub
- 🔄 Cuando vayas a producción real, cambia:
  - `WOMPI_PUBLIC_KEY=pub_prod_TU_LLAVE_REAL`
  - `WOMPI_URL=https://production.wompi.co/v1`

---

## 🆘 Si hay errores después del deploy

1. Verifica los logs en Render Dashboard
2. Asegúrate que `WOMPI_PUBLIC_KEY` empiece con `pub_test_`
3. Reinicia el servicio manualmente: **Manual Deploy** → **Clear build cache & deploy**
4. Espera 2-3 minutos
5. Prueba nuevamente

---

¡Listo! Tu app en Render ahora está en modo sandbox sin riesgo de errores con APIs reales. 🎉
