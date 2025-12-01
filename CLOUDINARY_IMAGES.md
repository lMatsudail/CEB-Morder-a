# 📸 Guía de Imágenes con Cloudinary

## Configuración de URLs de Cloudinary

Las imágenes de fondo con parallax están configuradas en `src/pages/home/Home.js` usando URLs de Cloudinary.

### 🔧 Cómo actualizar las URLs:

1. **Abre el archivo:** `src/pages/home/Home.js`

2. **Busca el objeto `images`** (líneas 11-15 aproximadamente):

```javascript
const images = {
  hero: 'https://res.cloudinary.com/TU_CLOUD_NAME/image/upload/v1/ceb/hero-bg.jpg',
  features: 'https://res.cloudinary.com/TU_CLOUD_NAME/image/upload/v1/ceb/features-bg.jpg',
  pricing: 'https://res.cloudinary.com/TU_CLOUD_NAME/image/upload/v1/ceb/pricing-bg.jpg'
};
```

3. **Reemplaza con tus URLs de Cloudinary**

---

## 📷 Imágenes necesarias:

### 1. **Hero Background** (hero)
- **Sección:** Parte superior de la página
- **Opacidad:** 30% (más visible)
- **Contenido sugerido:** Taller de moldería, mesa de trabajo, OptiTex
- **Dimensiones:** 1920x1080px

### 2. **Features Background** (features)
- **Sección:** Sección de características (fondo blanco)
- **Opacidad:** 15% (muy sutil)
- **Contenido sugerido:** Patrones, telas, herramientas de costura
- **Dimensiones:** 1920x1080px

### 3. **Pricing Background** (pricing)
- **Sección:** Sección de precios (fondo negro)
- **Opacidad:** 20% (sutil)
- **Contenido sugerido:** Ambiente profesional, capacitación, colaboración
- **Dimensiones:** 1920x1080px

---

## 🚀 Cómo subir imágenes a Cloudinary:

1. **Entra a:** https://cloudinary.com/users/login
2. **Sube tus 3 imágenes** al Media Library
3. **Copia la URL** de cada imagen (clic derecho → Copy URL)
4. **Pega las URLs** en el objeto `images` de `Home.js`

### Ejemplo de URL de Cloudinary:
```
https://res.cloudinary.com/tu-nombre/image/upload/v1733097600/ceb/hero-bg.jpg
```

---

## ⚡ Optimización de imágenes en Cloudinary:

Cloudinary puede optimizar tus imágenes automáticamente. Usa transformaciones en la URL:

### URL Optimizada (recomendado):
```javascript
const images = {
  hero: 'https://res.cloudinary.com/tu-nombre/image/upload/w_1920,h_1080,c_fill,q_auto,f_auto/ceb/hero-bg.jpg',
  features: 'https://res.cloudinary.com/tu-nombre/image/upload/w_1920,h_1080,c_fill,q_auto,f_auto/ceb/features-bg.jpg',
  pricing: 'https://res.cloudinary.com/tu-nombre/image/upload/w_1920,h_1080,c_fill,q_auto,f_auto/ceb/pricing-bg.jpg'
};
```

**Parámetros de optimización:**
- `w_1920,h_1080` - Redimensiona a Full HD
- `c_fill` - Rellena el área sin distorsionar
- `q_auto` - Calidad automática según el navegador
- `f_auto` - Formato automático (WebP para navegadores compatibles)

---

## 💡 Tips:

1. **Usa WebP:** Cloudinary convertirá automáticamente con `f_auto`
2. **Responsive:** Puedes crear diferentes tamaños para móvil/desktop
3. **Lazy Loading:** Cloudinary tiene soporte nativo
4. **Sin límites:** No aumenta el peso de tu repositorio Git

---

## 🎨 Ajustar opacidad:

Si quieres cambiar qué tan visible es cada imagen, edita en `Home.css`:

```css
.hero-background { opacity: 0.3; }      /* Hero: 30% */
.features-background { opacity: 0.15; } /* Features: 15% */
.pricing-background { opacity: 0.2; }   /* Pricing: 20% */
```

---

## 🔄 Mientras no tengas imágenes:

La página funcionará perfectamente con **gradientes de color** hasta que agregues tus URLs de Cloudinary. Los fondos mostrarán el degradado amarillo/dorado de CEB.
