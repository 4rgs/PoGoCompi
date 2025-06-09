// Hook para PWA - Gestiona instalación y service worker
import { useState, useEffect } from 'react';

// Hook principal para PWA
export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swRegistration, setSWRegistration] = useState(null);
  const [cacheStatus, setCacheStatus] = useState({});

  useEffect(() => {
    // Registrar Service Worker
    registerServiceWorker();

    // Detectar si ya está instalado
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    // Listener para evento de instalación
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listener para cuando se instala
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Listeners para estado de conexión
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Agregar listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Función para instalar la PWA
  const installPWA = async () => {
    if (!deferredPrompt) return false;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error instalando PWA:', error);
      return false;
    }
  };

  // Función para cachear datos de API
  const cacheApiData = async (apiData) => {
    if (swRegistration && swRegistration.active) {
      swRegistration.active.postMessage({
        action: 'CACHE_API_DATA',
        data: apiData
      });
    }
  };

  // Función para limpiar cache
  const clearCache = async () => {
    if (swRegistration && swRegistration.active) {
      swRegistration.active.postMessage({
        action: 'CLEAR_CACHE'
      });
    }
  };

  // Función para obtener estado del cache
  const getCacheStatus = async () => {
    return new Promise((resolve) => {
      if (swRegistration && swRegistration.active) {
        const channel = new MessageChannel();
        channel.port1.onmessage = (event) => {
          setCacheStatus(event.data);
          resolve(event.data);
        };
        
        swRegistration.active.postMessage({
          action: 'GET_CACHE_STATUS'
        }, [channel.port2]);
      } else {
        resolve({});
      }
    });
  };

  return {
    isInstallable,
    isInstalled,
    isOnline,
    cacheStatus,
    installPWA,
    cacheApiData,
    clearCache,
    getCacheStatus
  };
}

// Función para registrar el Service Worker
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      console.log('🔧 Registrando Service Worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('✅ Service Worker registrado:', registration.scope);

      // Manejar actualizaciones
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Hay una nueva versión disponible
            console.log('🔄 Nueva versión de la app disponible');
            
            if (confirm('Nueva versión disponible. ¿Recargar la aplicación?')) {
              window.location.reload();
            }
          }
        });
      });

      return registration;
    } catch (error) {
      console.error('❌ Error registrando Service Worker:', error);
      return null;
    }
  } else {
    console.warn('⚠️ Service Workers no soportados en este navegador');
    return null;
  }
}

// Hook para estado de conexión
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Hook para notificaciones de instalación
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    setDeferredPrompt(null);
    setIsInstallable(false);
    
    return outcome === 'accepted';
  };

  return {
    isInstallable,
    promptInstall
  };
}
