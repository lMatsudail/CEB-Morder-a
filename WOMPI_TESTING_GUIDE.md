# 🧪 Guía de Pruebas con Wompi - Modo Sandbox

## 📌 Introducción

Esta guía te ayudará a **familiarizarte con la plataforma Wompi** sin usar API keys reales. Perfecto para desarrollo y pruebas mientras construyes tu proyecto.

---

## 🔑 Credenciales de Prueba (Sandbox)

### Backend - Usar estas en tu `.env` local:

```env
# WOMPI - MODO SANDBOX (PRUEBAS)
WOMPI_PUBLIC_KEY=pub_test_QxG0jJJQQGwh3OOl1EwOHkG3CxTVhfSU
WOMPI_PRIVATE_KEY=prv_test_ABC123_OPCIONAL
WOMPI_EVENT_SECRET=test_events_SECRET_OPCIONAL
WOMPI_URL=https://sandbox.wompi.co/v1

# Métodos de pago habilitados en sandbox
WOMPI_PAYMENT_METHODS=CARD,PSE,NEQUI,BANCOLOMBIA_TRANSFER,CASH

# URLs locales
FRONTEND_URL=http://localhost:5000
BACKEND_URL=http://localhost:3000
```

> ⚠️ **IMPORTANTE**: En sandbox, la `WOMPI_PRIVATE_KEY` y `WOMPI_EVENT_SECRET` son **opcionales**. Los webhooks no funcionan completamente en modo prueba.

---

## 💳 Tarjetas de Prueba

### ✅ Tarjeta APROBADA

```
Número:  4242 4242 4242 4242
CVV:     123 (cualquier 3 dígitos)
Vence:   12/25 (cualquier fecha futura)
Nombre:  Juan Perez (cualquier nombre)
```

**Resultado:** Pago aprobado instantáneamente ✅

---

### ❌ Tarjeta RECHAZADA

```
Número:  4111 1111 1111 1111
CVV:     123
Vence:   12/25
Nombre:  Test User
```

**Resultado:** Pago rechazado por banco emisor ❌

---

### ⏳ Tarjeta PENDIENTE

```
Número:  4151 6111 1111 1117
CVV:     123
Vence:   12/25
Nombre:  Test User
```

**Resultado:** Transacción queda en estado PENDING ⏳

---

## 🏦 PSE - Transferencia Bancaria (Sandbox)

Cuando selecciones **PSE** en el checkout:

1. Se abrirá un simulador de banco
2. Selecciona **Banco de Bogotá** o **Bancolombia**
3. Usuario: `prueba`
4. Clave: `cualquier texto`
5. Click en **"Pagar"**

**Estados posibles:**
- ✅ **Aprobado**: Simula pago exitoso
- ❌ **Rechazado**: Simula rechazo del banco
- ⏳ **Pendiente**: Simula pago pendiente de confirmación

---

## 📱 Nequi (Sandbox)

Cuando selecciones **Nequi**:

1. Se mostrará un QR simulado o botón de pago
2. En sandbox, el pago se aprueba automáticamente después de 5-10 segundos
3. El estado quedará en **PENDING** hasta recibir la notificación

> 💡 En producción real, el usuario debe confirmar desde su app Nequi.

---

## 💵 Efecty/Cash (Sandbox)

Cuando selecciones **CASH**:

1. Se genera un código de referencia
2. En sandbox, no puedes "simular" el pago físico
3. El estado quedará en **PENDING** permanentemente

> 💡 En producción real, el usuario lleva el código a un punto Efecty y paga en efectivo.

---

## 🔄 Flujo de Prueba Completo

### 1️⃣ Iniciar tu servidor backend

```bash
cd "C:\Users\thaur\Desktop\Proyecto CEB"
npm start
```

### 2️⃣ Iniciar tu frontend

```bash
npm run dev
# o
npm start
```

### 3️⃣ Simular una compra

1. Agrega productos al carrito
2. Selecciona método(s) de pago (ej: ✅ Tarjeta, ✅ PSE)
3. Click en **"Pagar con Wompi"**
4. Se abre Wompi en nueva ventana
5. Usa la **tarjeta aprobada** (4242...)
6. Completa el pago
7. Serás redirigido al checkout
8. Verás el estado del pago

---

## 🐛 Depuración y Logs

### Ver logs del backend

Busca en la consola:

```
[WOMPI] Creando payment_link con datos: { orderId: 123, amount: 50000, ... }
✅ Link de pago creado: https://checkout.wompi.co/l/xxx
```

### Estados posibles de una transacción

| Estado | Significado |
|--------|-------------|
| `PENDING` | ⏳ Esperando confirmación del pago |
| `APPROVED` | ✅ Pago aprobado y completado |
| `DECLINED` | ❌ Pago rechazado por banco |
| `VOIDED` | 🚫 Pago anulado |
| `ERROR` | ⚠️ Error en la transacción |

---

## 🎯 Casos de Prueba Recomendados

### ✅ Caso 1: Pago exitoso con tarjeta

1. Selecciona solo **Tarjeta de Crédito**
2. Usa `4242 4242 4242 4242`
3. Completa el pago
4. ✅ Estado final: `APPROVED`

---

### ❌ Caso 2: Pago rechazado

1. Selecciona **Tarjeta de Crédito**
2. Usa `4111 1111 1111 1111`
3. Intenta pagar
4. ❌ Estado final: `DECLINED`

---

### ⏳ Caso 3: Pago pendiente (PSE)

1. Selecciona **PSE**
2. Completa el flujo del banco simulado
3. Selecciona opción **"Pendiente"** si está disponible
4. ⏳ Estado final: `PENDING`

---

### 🔄 Caso 4: Múltiples métodos

1. Selecciona: ✅ Tarjeta, ✅ PSE, ✅ Nequi
2. Wompi te mostrará las 3 opciones
3. Elige una y completa el pago
4. Verifica que solo se usó el método seleccionado

---

## 📚 Documentación Oficial Wompi

- **Sandbox Dashboard**: https://sandbox.wompi.co
- **API Docs**: https://docs.wompi.co/docs/en/introduction
- **Test Cards**: https://docs.wompi.co/docs/en/test-cards
- **Comercios (Producción)**: https://comercios.wompi.co

---

## 🚀 Próximos Pasos (Cuando vayas a Producción)

### 1. Crear cuenta real en Wompi

1. Ir a https://comercios.wompi.co
2. Registrarte con tu empresa
3. Completar validación de documentos
4. Activar métodos de pago (PSE, Nequi, etc.)

### 2. Obtener llaves de producción

```env
WOMPI_PUBLIC_KEY=pub_prod_TU_LLAVE_REAL
WOMPI_PRIVATE_KEY=prv_prod_TU_LLAVE_REAL
WOMPI_EVENT_SECRET=prod_events_TU_SECRET_REAL
WOMPI_URL=https://production.wompi.co/v1
```

### 3. Configurar webhooks

URL: `https://ceb-molderia-api.onrender.com/api/payments/webhook`

### 4. Configurar variables en Render

Agregar las llaves reales en Render > Environment Variables

---

## ⚠️ Recordatorios Importantes

- ✅ **Nunca** subas llaves reales a GitHub
- ✅ En sandbox, **no se procesa dinero real**
- ✅ Los webhooks en sandbox son **limitados**
- ✅ PSE y Nequi sandbox son **simuladores**
- ✅ El estado `PENDING` en sandbox puede no cambiar automáticamente
- ✅ Guarda tus llaves de producción en **variables de entorno seguras**

---

## 🆘 Solución de Problemas

### Error: "Solicitud no autorizada"

```javascript
Error creando link de pago Wompi: {
  error: { type: 'INVALID_ACCESS_TOKEN', reason: 'Solicitud no autorizada' }
}
```

**Solución:**
1. Verifica que `WOMPI_PUBLIC_KEY` empiece con `pub_test_` (sandbox) o `pub_prod_` (producción)
2. Verifica que la URL sea correcta: `https://sandbox.wompi.co/v1` (sandbox)
3. Reinicia tu servidor backend después de cambiar `.env`

### El pago se queda en PENDING

- En **sandbox**, esto es normal para PSE y Nequi
- Los webhooks de sandbox son limitados
- Tu frontend debe hacer polling del estado cada 3-5 segundos
- Usa la tarjeta `4242 4242 4242 4242` para aprobar instantáneamente

### No recibo webhooks

- Los webhooks en **sandbox** pueden no funcionar al 100%
- No te preocupes, esto es normal en modo prueba
- En **producción**, los webhooks funcionan correctamente
- Por eso tu app hace polling del estado

---

## 📞 Contacto y Soporte

- **Documentación Wompi**: https://docs.wompi.co
- **Soporte Wompi**: soporte@wompi.co
- **WhatsApp Wompi**: +57 321 123 4567 (ejemplo)

---

¡Listo! Ahora puedes probar pagos sin riesgo y familiarizarte con la plataforma antes de ir a producción. 🎉
