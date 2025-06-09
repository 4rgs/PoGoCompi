// Componente PWA Status - Muestra estado de instalación y conexión
import React, { useState, useEffect } from 'react';
import {
  Box,
  Fab,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  GetApp as InstallIcon,
  CloudOff as OfflineIcon,
  Cloud as OnlineIcon,
  Storage as CacheIcon,
  DeleteSweep as ClearIcon,
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { usePWA } from '../hooks/usePWA';

const PWAStatus = ({ onCacheApiData }) => {
  const {
    isInstallable,
    isInstalled,
    isOnline,
    cacheStatus,
    installPWA,
    cacheApiData,
    clearCache,
    getCacheStatus
  } = usePWA();

  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showCacheDialog, setShowCacheDialog] = useState(false);
  const [installResult, setInstallResult] = useState(null);
  const [isClearing, setIsClearing] = useState(false);

  // Mostrar prompt de instalación automáticamente después de 10 segundos
  useEffect(() => {
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  // Actualizar estado del cache periódicamente
  useEffect(() => {
    const updateCacheStatus = () => {
      getCacheStatus();
    };

    updateCacheStatus();
    const interval = setInterval(updateCacheStatus, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, [getCacheStatus]);

  const handleInstall = async () => {
    const success = await installPWA();
    setInstallResult(success ? 'success' : 'error');
    setShowInstallPrompt(false);
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await clearCache();
      await getCacheStatus();
    } catch (error) {
      console.error('Error limpiando cache:', error);
    } finally {
      setIsClearing(false);
      setShowCacheDialog(false);
    }
  };

  const handleCacheApiData = async (apiData) => {
    if (apiData && onCacheApiData) {
      await cacheApiData(apiData);
      await getCacheStatus();
      onCacheApiData('Datos de API cacheados para uso offline');
    }
  };

  const getTotalCachedItems = () => {
    return Object.values(cacheStatus).reduce((total, count) => total + count, 0);
  };

  return (
    <>
      {/* FAB para instalación */}
      {isInstallable && !isInstalled && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
            animation: 'pulse 2s infinite'
          }}
          onClick={() => setShowInstallPrompt(true)}
        >
          <InstallIcon />
        </Fab>
      )}

      {/* Indicador de estado de conexión */}
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 1000,
          display: 'flex',
          gap: 1,
          alignItems: 'center'
        }}
      >
        <Tooltip title={isOnline ? 'Conectado' : 'Sin conexión'}>
          <Chip
            icon={isOnline ? <OnlineIcon /> : <OfflineIcon />}
            label={isOnline ? 'Online' : 'Offline'}
            color={isOnline ? 'success' : 'warning'}
            size="small"
            variant="filled"
          />
        </Tooltip>

        {getTotalCachedItems() > 0 && (
          <Tooltip title="Ver estado del cache">
            <IconButton
              size="small"
              onClick={() => setShowCacheDialog(true)}
              sx={{ color: 'primary.main' }}
            >
              <CacheIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Dialog de instalación */}
      <Dialog
        open={showInstallPrompt}
        onClose={() => setShowInstallPrompt(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InstallIcon color="primary" />
          Instalar Comparador Pokémon GO
          <IconButton
            sx={{ ml: 'auto' }}
            onClick={() => setShowInstallPrompt(false)}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            🚀 ¡Instala la aplicación para una mejor experiencia!
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>📱</ListItemIcon>
              <ListItemText primary="Acceso rápido desde tu pantalla de inicio" />
            </ListItem>
            <ListItem>
              <ListItemIcon>⚡</ListItemIcon>
              <ListItemText primary="Funcionamiento offline con datos cacheados" />
            </ListItem>
            <ListItem>
              <ListItemIcon>🔔</ListItemIcon>
              <ListItemText primary="Experiencia nativa sin navegador" />
            </ListItem>
            <ListItem>
              <ListItemIcon>💾</ListItemIcon>
              <ListItemText primary="Datos guardados localmente" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInstallPrompt(false)}>
            Más tarde
          </Button>
          <Button
            variant="contained"
            onClick={handleInstall}
            startIcon={<InstallIcon />}
          >
            Instalar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de estado del cache */}
      <Dialog
        open={showCacheDialog}
        onClose={() => setShowCacheDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CacheIcon color="primary" />
          Estado del Cache
          <IconButton
            sx={{ ml: 'auto' }}
            onClick={() => setShowCacheDialog(false)}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Datos almacenados para uso offline:
          </Typography>
          
          {Object.keys(cacheStatus).length > 0 ? (
            <List dense>
              {Object.entries(cacheStatus).map(([cacheName, count]) => (
                <ListItem key={cacheName}>
                  <ListItemIcon>
                    <StorageIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={cacheName.replace('pokemon-dps-', '')}
                    secondary={`${count} elementos`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No hay datos en cache
            </Typography>
          )}

          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              💡 El cache permite que la aplicación funcione sin conexión y mejora la velocidad de carga.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClearCache}
            disabled={isClearing}
            startIcon={<ClearIcon />}
            color="warning"
          >
            {isClearing ? 'Limpiando...' : 'Limpiar Cache'}
          </Button>
          <Button onClick={() => setShowCacheDialog(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para resultado de instalación */}
      <Snackbar
        open={installResult !== null}
        autoHideDuration={4000}
        onClose={() => setInstallResult(null)}
      >
        <Alert
          severity={installResult === 'success' ? 'success' : 'error'}
          onClose={() => setInstallResult(null)}
        >
          {installResult === 'success'
            ? '✅ ¡Aplicación instalada exitosamente!'
            : '❌ Error instalando la aplicación'
          }
        </Alert>
      </Snackbar>

      {/* Estilos para animación de pulso */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  );
};

// Icono de storage para el cache
const StorageIcon = () => (
  <Box
    sx={{
      width: 24,
      height: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'primary.main',
      borderRadius: '4px',
      color: 'white',
      fontSize: '0.7rem',
      fontWeight: 'bold'
    }}
  >
    📦
  </Box>
);

export default PWAStatus;
