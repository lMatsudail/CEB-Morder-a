# ✅ Checklist: Actualizar Render a Modo Sandbox

## 🎯 Objetivo
Configurar tu app en Render para usar Wompi en **modo sandbox** (sin dinero real)

---

## 📋 Pasos para Backend (ceb-molderia-api)

### 1. Ir al Dashboard de Render

🔗 https://dashboard.render.com

### 2. Seleccionar tu servicio backend

- Click en **ceb-molderia-api**

### 3. Ir a Environment Variables

- Menú lateral → **Environment**

### 4. Actualizar/Agregar estas variables:

| Variable | Valor | Acción |
|----------|-------|--------|
| `WOMPI_PUBLIC_KEY` | `pub_test_QxG0jJJQQGwh3OOl1EwOHkG3CxTVhfSU` | ✏️ Editar o ➕ Agregar |
| `WOMPI_URL` | `https://sandbox.wompi.co/v1` | ✏️ Editar o ➕ Agregar |
| `WOMPI_PAYMENT_METHODS` | `CARD,PSE,NEQUI` | ✏️ Editar o ➕ Agregar |
| `WOMPI_PRIVATE_KEY` | *(dejar vacío)* | ✏️ Editar o ➕ Agregar |
| `WOMPI_EVENT_SECRET` | *(dejar vacío)* | ✏️ Editar o ➕ Agregar |

### 5. Guardar cambios

- Click en **Save Changes**
- El servicio se reiniciará automáticamente ⏳

### 6. Esperar el redeploy

- Espera 2-3 minutos
- Ver logs en tiempo real

### 7. Verificar logs exitosos

Debe aparecer:
```
✅ Conectado a PostgreSQL exitosamente
✅ Servidor ejecutándose en puerto 10000
```

NO debe aparecer:
```
❌ Error creando link de pago Wompi: INVALID_ACCESS_TOKEN
```

---

## 🧪 Probar en Producción

### 1. Ir a tu app

🔗 https://ceb-molderia-web.onrender.com

### 2. Hacer una compra de prueba

1. Agregar productos al carrito
2. Click **Pagar con Wompi**
3. Usar tarjeta: `4242 4242 4242 4242`
4. CVV: `123`, Vence: `12/25`
5. Completar pago

### 3. Verificar resultado

- ✅ Debe redirigir a `/checkout?orderId=...`
- ✅ Debe mostrar estado **APROBADO**
- ✅ Debe mostrar badges animados con gradientes

---

## 🎨 Resultado Visual Esperado

```
╔══════════════════════════════════════════╗
║  ✅ ¡Pago Exitoso!                       ║
║                                          ║
║  Tu pedido ha sido aprobado             ║
║                                          ║
║  Métodos de Pago Utilizados:            ║
║  ┌────────────────┐                     ║
║  │ 💳 TARJETA    │ ← Gradiente púrpura ║
║  └────────────────┘                     ║
║                                          ║
║  Detalles del Pedido                    ║
║  • ID: #123                             ║
║  • Total: $50,000 COP                   ║
║  • Estado: APROBADO                     ║
╚══════════════════════════════════════════╝
```

---

## 🚨 Si algo sale mal

### Error en logs: INVALID_ACCESS_TOKEN

**Solución:**

1. Verificar que `WOMPI_PUBLIC_KEY` en Render sea: `pub_test_QxG0jJJQQGwh3OOl1EwOHkG3CxTVhfSU`
2. Verificar que `WOMPI_URL` sea: `https://sandbox.wompi.co/v1`
3. No debe haber espacios ni comillas extras
4. Guardar cambios y esperar redeploy
5. Refrescar logs

### El servicio no reinicia

**Solución:**

1. Ir a **Manual Deploy**
2. Click en **Clear build cache & deploy**
3. Esperar 3-5 minutos

### No aparece el botón de Wompi

**Solución:**

1. Verificar que el frontend esté desplegado
2. Verificar `REACT_APP_API_URL` apunte al backend correcto
3. Abrir consola del navegador (F12) y buscar errores
4. Verificar que el backend esté respondiendo: `https://ceb-molderia-api.onrender.com/api/health`

---

## ✅ Checklist Final

Marca cuando completes cada paso:

### Backend (Render)

- [ ] Agregar `WOMPI_PUBLIC_KEY=pub_test_...`
- [ ] Agregar `WOMPI_URL=https://sandbox.wompi.co/v1`
- [ ] Agregar `WOMPI_PAYMENT_METHODS=CARD,PSE,NEQUI`
- [ ] Guardar cambios
- [ ] Esperar redeploy
- [ ] Verificar logs sin errores

### Testing

- [ ] Ir a https://ceb-molderia-web.onrender.com
- [ ] Agregar productos al carrito
- [ ] Click "Pagar con Wompi"
- [ ] Usar tarjeta `4242 4242 4242 4242`
- [ ] Completar pago
- [ ] Verificar redirección correcta
- [ ] Ver estado APROBADO
- [ ] Ver badges animados

### Documentación

- [ ] Leer `SANDBOX_QUICKSTART.md`
- [ ] Leer `WOMPI_TESTING_GUIDE.md`
- [ ] Entender el flujo completo
- [ ] Guardar tarjetas de prueba

---

## 🎓 Conceptos Clave

### ¿Qué es Sandbox?

> **Sandbox** = Entorno de pruebas donde NO se procesa dinero real. Perfecto para desarrollo.

### ¿Qué pasa con mis llaves?

- **Sandbox**: `pub_test_...` → Tarjetas de prueba
- **Producción**: `pub_prod_...` → Tarjetas reales (más adelante)

### ¿Por qué algunos pagos quedan PENDING?

- PSE y Nequi en sandbox pueden quedar pendientes
- Es normal, en producción funcionan correctamente
- Usa la tarjeta `4242...` para aprobar instantáneamente

---

## 📞 Soporte

Si tienes problemas:

1. Revisar logs en Render Dashboard
2. Abrir consola del navegador (F12)
3. Revisar `WOMPI_TESTING_GUIDE.md`
4. Verificar que todas las variables estén correctas

---

## 🚀 Siguiente Nivel

Cuando termines tu app y quieras aceptar **pagos reales**:

1. Crear cuenta en https://comercios.wompi.co
2. Completar verificación de empresa
3. Activar métodos de pago
4. Obtener llaves `pub_prod_...` y `prv_prod_...`
5. Cambiar variables en Render
6. Configurar webhooks con URL real
7. ¡Listo para vender! 💰

---

**¡Adelante! Actualiza Render y prueba tu primer pago en sandbox.** 🎉

> 💡 Tip: Toma capturas de pantalla del proceso para tu documentación personal.
