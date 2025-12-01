# 🧪 MODO SANDBOX - Inicio Rápido

## ✅ Tu proyecto YA está configurado en modo prueba

### 📂 Archivos configurados:

- ✅ `.env` → Credenciales sandbox locales
- ✅ `.env.example` → Template con explicaciones
- 📚 `WOMPI_TESTING_GUIDE.md` → **Guía completa de pruebas**
- 🔧 `RENDER_SANDBOX_CONFIG.md` → Config para producción en Render

---

## 🚀 Cómo empezar

### 1️⃣ Probar localmente

```bash
# Backend
npm start

# Frontend (otra terminal)
cd client  # o donde esté tu frontend
npm run dev
```

### 2️⃣ Hacer una compra de prueba

1. Agregar productos al carrito
2. Click **Pagar con Wompi**
3. Usar esta tarjeta: `4242 4242 4242 4242`
4. CVV: `123`, Vence: `12/25`
5. ✅ Pago aprobado!

---

## 💳 Tarjetas de Prueba

| Tarjeta | CVV | Resultado |
|---------|-----|-----------|
| `4242 4242 4242 4242` | 123 | ✅ APROBADO |
| `4111 1111 1111 1111` | 123 | ❌ RECHAZADO |
| `4151 6111 1111 1117` | 123 | ⏳ PENDIENTE |

---

## 📱 Métodos disponibles en sandbox

- ✅ **Tarjeta de crédito/débito** (inmediato)
- ✅ **PSE** (transferencia bancaria simulada)
- ✅ **Nequi** (simulador de app)
- ⏳ **Cash/Efecty** (queda pendiente)

---

## 🔧 Actualizar Render a modo sandbox

1. Abrir `RENDER_SANDBOX_CONFIG.md`
2. Copiar variables de entorno
3. Pegar en Render Dashboard
4. Reiniciar servicio
5. ✅ Tu app en producción también estará en sandbox

---

## 📚 Ver guía completa

Abrir: **`WOMPI_TESTING_GUIDE.md`**

Incluye:
- Todas las tarjetas de prueba
- Flujos de PSE y Nequi
- Solución de problemas
- Cómo pasar a producción real

---

## ⚠️ Recordatorio

- 🧪 **SANDBOX = Sin dinero real**
- ✅ Perfecto para desarrollo
- 🚀 Cuando termines tu app, cambia a llaves de producción
- 📖 Sigue la guía en `WOMPI_TESTING_GUIDE.md` para producción

---

## 🆘 ¿Errores?

### Error: "Solicitud no autorizada"

1. Verificar `.env` tenga: `WOMPI_PUBLIC_KEY=pub_test_...`
2. Verificar `.env` tenga: `WOMPI_URL=https://sandbox.wompi.co/v1`
3. Reiniciar servidor: `Ctrl+C` y `npm start`

### El pago se queda en PENDING

- ✅ Normal en sandbox para PSE/Nequi
- ✅ Usa la tarjeta `4242...` para aprobar instantáneamente

---

¡Listo! Ahora puedes probar pagos sin riesgo. 🎉

**Siguiente paso**: Familiarízate con el flujo y lee `WOMPI_TESTING_GUIDE.md`
