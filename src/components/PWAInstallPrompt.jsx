import React, { useState, useEffect } from 'react';
import { Button, Snackbar, Alert, Box, Typography } from '@mui/material';
import { InstallMobile, Close, Download } from '@mui/icons-material';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalado
    const checkIfInstalled = () => {
      // PWA está instalada si se ejecuta en modo standalone
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }

      // Para Safari en iOS
      if (window.navigator && window.navigator.standalone) {
        setIsInstalled(true);
        return;
      }
    };

    checkIfInstalled();

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Escuchar cuando la app se instala
    const handleAppInstalled = () => {
      console.log('PWA: App was installed');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Mostrar instrucciones manuales para navegadores que no soportan el prompt automático
      alert(
        'Para instalar la app:\n\n' +
        '• Chrome/Edge: Busca el ícono de instalación en la barra de direcciones\n' +
        '• Firefox: Ve a Menú > Instalar esta aplicación\n' +
        '• Safari (iOS): Toca "Compartir" y luego "Añadir a pantalla de inicio"'
      );
      return;
    }

    try {
      // Mostrar el prompt de instalación
      deferredPrompt.prompt();

      // Esperar la respuesta del usuario
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`PWA: User ${outcome} the install prompt`);

      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('PWA: Error during installation:', error);
    }
  };

  const handleClosePrompt = () => {
    setShowInstallPrompt(false);
  };

  // No mostrar nada si ya está instalado
  if (isInstalled) {
    return null;
  }

  return (
    <Snackbar
      open={showInstallPrompt}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ mb: 2 }}
    >
      <Alert
        severity="info"
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              color="inherit"
              size="small"
              onClick={handleInstallClick}
              startIcon={<Download />}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Instalar
            </Button>
            <Button
              color="inherit"
              size="small"
              onClick={handleClosePrompt}
              sx={{
                minWidth: 'auto',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <Close />
            </Button>
          </Box>
        }
        sx={{
          backgroundColor: '#1976d2',
          color: 'white',
          '& .MuiAlert-icon': {
            color: 'white'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InstallMobile />
          <Typography variant="body2">
            ¡Instala la app para una mejor experiencia!
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default PWAInstallPrompt;
