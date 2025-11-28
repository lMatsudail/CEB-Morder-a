// Suprimir errores molestos que no afectan la funcionalidad
const suppressResizeObserverError = () => {
  // Parche más agresivo para ResizeObserver
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Interceptar y suprimir errores específicos
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string') {
      if (args[0].includes('ResizeObserver loop completed') ||
          args[0].includes('ResizeObserver loop limit exceeded')) {
        return; // No mostrar estos errores
      }
    }
    originalConsoleError.apply(console, args);
  };

  // Handler de errores global
  const errorHandler = (e) => {
    if (e.message && (
        e.message.includes('ResizeObserver loop completed') ||
        e.message.includes('ResizeObserver loop limit exceeded')
    )) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return false;
    }
  };

  window.addEventListener('error', errorHandler, true);
  
  // También manejar errores no capturados
  window.addEventListener('unhandledrejection', (e) => {
    if (e.reason && e.reason.message && 
        (e.reason.message.includes('ResizeObserver loop completed') ||
         e.reason.message.includes('ResizeObserver loop limit exceeded'))) {
      e.preventDefault();
      return false;
    }
  });

  // Ocultar overlay de error de webpack si aparece
  const hideWebpackErrorOverlay = debounce(() => {
    const errorOverlay = document.querySelector('iframe[src*="webpack-dev-server"]');
    const errorDiv = document.querySelector('div[data-test-id="error-overlay"]');
    const nextErrorOverlay = document.querySelector('#nextjs__container_errors_label');
    
    [errorOverlay, errorDiv, nextErrorOverlay].forEach(element => {
      if (element && element.style) {
        element.style.display = 'none';
      }
    });
  }, 100);

  // Observar cambios en el DOM para ocultar overlays
  const observer = new MutationObserver(hideWebpackErrorOverlay);
  observer.observe(document.body, { childList: true, subtree: true });

  // Ejecutar una vez al cargar
  hideWebpackErrorOverlay();
};

// Ejecutar inmediatamente
suppressResizeObserverError();

// También ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', suppressResizeObserverError);
} else {
  suppressResizeObserverError();
}

export default suppressResizeObserverError;