# Integración de Wompi - Pasarela de Pagos

## 📋 Resumen

Se ha implementado la pasarela de pagos **Wompi** (Bancolombia) para procesar pagos en COP. Incluye:

- ✅ Servicio backend de integración con Wompi API
- ✅ Endpoints de creación de órdenes y links de pago
- ✅ Webhooks para notificaciones automáticas de pago
- ✅ Componente frontend de confirmación de pago
- ✅ Actualización automática de estado de órdenes

## 🔑 Configuración de Producción (Render)

### Variables de Entorno Backend

En el dashboard de Render > Web Service > Environment:

```env
# Wompi Production Keys (obtener en https://comercios.wompi.co)
WOMPI_PUBLIC_KEY=pub_prod_TU_LLAVE_PUBLICA
WOMPI_PRIVATE_KEY=prv_prod_TU_LLAVE_PRIVADA
WOMPI_EVENT_SECRET=prod_events_TU_SECRET
WOMPI_URL=https://production.wompi.co/v1

# Frontend URL para redirección
FRONTEND_URL=https://ceb-molderia-web.onrender.com
```

### Variables de Entorno Frontend

En Render > Static Site > Environment:

```env
REACT_APP_API_URL=https://ceb-molderia-api.onrender.com
```

## 🔗 Configurar Webhooks en Wompi

1. Ir a https://comercios.wompi.co → **Configuración** → **Webhooks**
2. Agregar URL: `https://ceb-molderia-api.onrender.com/api/payments/webhook`
3. Seleccionar eventos:
   - `transaction.updated`
   - `transaction.created`
4. Copiar el **Event Secret** y agregarlo a `WOMPI_EVENT_SECRET`

## 🧪 Modo de Prueba (Sandbox)

### Llaves de Prueba (ya configuradas en `.env.example`)

```env
WOMPI_PUBLIC_KEY=pub_test_QxG0jJJQQGwh3OOl1EwOHkG3CxTVhfSU
WOMPI_URL=https://sandbox.wompi.co/v1
```

### Tarjetas de Prueba

**Aprobada:**
- Número: `4242 4242 4242 4242`
- CVV: cualquier 3 dígitos
- Fecha: cualquier fecha futura
- Nombre: cualquier nombre

**Rechazada:**
- Número: `4111 1111 1111 1111`

Más tarjetas de prueba: https://docs.wompi.co/docs/en/test-cards

## 📂 Archivos Creados/Modificados

### Backend
- ✅ `server/services/wompiService.js` - Servicio de integración Wompi
- ✅ `server/routes/payments.js` - Endpoints de pagos y webhooks
- ✅ `server/server.js` - Montaje de rutas de pago

### Frontend
- ✅ `src/pages/shop/Cart/Cart.js` - Integración con API de pagos
- ✅ `src/pages/shop/Checkout/Checkout.js` - Confirmación de pago
- ✅ `src/pages/shop/Checkout/Checkout.css` - Estilos de confirmación

### Configuración
- ✅ `.env.example` - Variables de entorno documentadas

## 🔄 Flujo de Pago

1. **Usuario en carrito** → Click "Pagar con Wompi"
2. **Frontend** → POST `/api/payments/create-order` (crea orden + link Wompi)
3. **Redirect** → Usuario va a URL de Wompi para pagar
4. **Pago en Wompi** → Usuario completa el pago
5. **Redirect de retorno** → Wompi redirige a `/checkout?orderId=123`
6. **Verificación** → Frontend consulta `/api/payments/status/:orderId`
7. **Webhook** → Wompi notifica a `/api/payments/webhook` (actualiza estado)
8. **Confirmación** → Usuario ve estado final (exitoso/fallido/pendiente)

## 🚀 Deployment

### 1. Commit y Push

```bash
git add .
git commit -m "Feat: Implementar pasarela de pagos Wompi con webhooks"
git push origin main
```

### 2. Deploy Manual en Render

- **Backend:** Dashboard > ceb-molderia-api > Manual Deploy
- **Frontend:** Dashboard > ceb-molderia-web > Clear build cache & deploy

### 3. Configurar Variables en Render

Agregar las variables de entorno listadas arriba en cada servicio.

### 4. Configurar Webhook

Seguir instrucciones en sección **Configurar Webhooks en Wompi**.

## 🧪 Pruebas Locales

### 1. Iniciar Backend y Frontend

```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
npm start
```

### 2. Crear archivo `.env` local

Copiar `.env.example` a `.env` y usar llaves de sandbox.

### 3. Probar flujo completo

1. Ir a http://localhost:5000/catalog
2. Agregar productos al carrito
3. Click "Pagar con Wompi"
4. Usar tarjeta de prueba `4242 4242 4242 4242`
5. Verificar redirección a `/checkout` con confirmación

## 📊 Endpoints de API

### POST `/api/payments/create-order`
Crea orden y genera link de pago Wompi.

**Auth:** Requiere Bearer token

**Request:**
```json
{
  "items": [
    {
      "productId": 1,
      "optionType": "basic",
      "price": 20000,
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "message": "Orden creada exitosamente",
  "orderId": 5,
  "total": 20000,
  "payment": {
    "paymentUrl": "https://checkout.wompi.co/l/xxxxx",
    "paymentId": "xxxxx",
    "reference": "ORDER-5-1234567890",
    "expiresAt": "2025-12-01T04:00:00Z"
  }
}
```

### GET `/api/payments/status/:orderId`
Consulta estado de pago de una orden.

**Auth:** Requiere Bearer token

**Response:**
```json
{
  "orderId": 5,
  "status": "paid",
  "total": 20000,
  "paymentStatus": "APPROVED",
  "paymentMethod": "CARD",
  "createdAt": "2025-12-01T03:00:00Z"
}
```

### POST `/api/payments/webhook`
Webhook para notificaciones de Wompi (uso interno).

**Auth:** Validación de firma `x-wompi-signature`

## 🛡️ Seguridad

- ✅ Validación de firma en webhooks (producción)
- ✅ Autenticación JWT en todos los endpoints
- ✅ Verificación de propiedad de orden (userId)
- ✅ HTTPS obligatorio en producción (Render)
- ✅ Event Secret para validar eventos de Wompi

## 📝 Próximos Pasos (Opcional)

- [ ] Notificaciones por email al confirmar pago
- [ ] Dashboard de transacciones en AdminPanel
- [ ] Reintento automático de pagos fallidos
- [ ] Soporte para PSE (transferencias bancarias)
- [ ] Exportar reporte de ventas

## 📞 Soporte

- Documentación Wompi: https://docs.wompi.co
- Comercios Wompi: https://comercios.wompi.co
- Soporte: soporte@wompi.co

---

**Implementado por:** GitHub Copilot  
**Fecha:** 30 de noviembre de 2025  
**Versión:** 1.0.0
