// src/serviceWorkerRegistration.js

// Este archivo registra un service worker para hacer la app instalable (PWA)
// Compatible con Create React App

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] es la dirección IPv6 de localhost
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 es considerado localhost para IPv4
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // La URL pública del service worker
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Si PUBLIC_URL está en otro origen, no registra el SW
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // Si es localhost, valida el service worker
        checkValidServiceWorker(swUrl, config);

        navigator.serviceWorker.ready.then(() => {
          console.log('Este app web está siendo servido en caché por un SW.');
        });
      } else {
        // Registra el service worker para producción
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // Nuevo contenido disponible
              console.log('Nuevo contenido está disponible; por favor recarga la página.');

              // Ejecuta el callback si existe
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // El contenido está cacheado para uso offline
              console.log('El contenido está cacheado para uso offline.');

              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch(error => {
      console.error('Error durante el registro del service worker:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Verifica si el SW existe, sino, recarga la página.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then(response => {
      // SW encontrado, lo registra
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No encontrado o no es JS, recarga
        navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // SW válido, lo registra normalmente
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No hay conexión a internet. La app está offline.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}
