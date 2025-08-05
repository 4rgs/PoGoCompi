// Hook personalizado para gestionar el versionado de la API de PoGoAPI
import { useState, useEffect, useCallback } from 'react';
import pogoApiService from '../services/pogoApiService';

export const useApiVersioning = () => {
  const [versionInfo, setVersionInfo] = useState(null);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Verificar actualizaciones disponibles
  const checkForUpdates = useCallback(async () => {
    if (isChecking) return;

    setIsChecking(true);
    setError(null);

    try {
      console.log('🔍 Verificando actualizaciones de la API...');
      const result = await pogoApiService.checkForUpdates();
      setUpdateStatus(result);

      if (result.hasUpdates) {
        console.log(`📦 ${result.updates.length} actualizaciones encontradas`);
      } else {
        console.log('✅ Todos los datos están actualizados');
      }

      return result;
    } catch (err) {
      console.error('❌ Error verificando actualizaciones:', err);
      setError(err.message);
      return null;
    } finally {
      setIsChecking(false);
    }
  }, [isChecking]);

  // Obtener información detallada de versionado
  const getVersionInfo = useCallback(async () => {
    try {
      const info = await pogoApiService.getVersionInfo();
      setVersionInfo(info);
      return info;
    } catch (err) {
      console.error('❌ Error obteniendo información de versión:', err);
      setError(err.message);
      return null;
    }
  }, []);

  // Forzar actualización de un endpoint específico o todos
  const forceUpdate = useCallback(async (endpoint = null) => {
    if (isUpdating) return;

    setIsUpdating(true);
    setError(null);

    try {
      console.log(`🔄 Forzando actualización${endpoint ? ` de ${endpoint}` : ' completa'}...`);
      const result = await pogoApiService.forceRefresh(endpoint);

      // Verificar nuevamente después de la actualización
      setTimeout(() => {
        checkForUpdates();
        getVersionInfo();
      }, 1000);

      return result;
    } catch (err) {
      console.error('❌ Error forzando actualización:', err);
      setError(err.message);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, checkForUpdates, getVersionInfo]);

  // Obtener estado del cache
  const getCacheStatus = useCallback(() => {
    return pogoApiService.getCacheStatus();
  }, []);

  // Obtener información de debug
  const getDebugInfo = useCallback(() => {
    return pogoApiService.exportDebugInfo();
  }, []);

  // Hook para verificación automática al montar el componente
  useEffect(() => {
    let timeoutId;

    const performInitialCheck = async () => {
      try {
        await Promise.all([
          checkForUpdates(),
          getVersionInfo()
        ]);
      } catch (err) {
        console.error('❌ Error en verificación inicial:', err);
      }
    };

    // Verificación inicial después de un pequeño delay
    timeoutId = setTimeout(performInitialCheck, 2000);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []); // Solo al montar

  // Calcular estadísticas del estado actual
  const stats = {
    totalFiles: updateStatus?.totalFiles || 0,
    updatesAvailable: updateStatus?.updates?.length || 0,
    hasUpdates: updateStatus?.hasUpdates || false,
    lastCheck: updateStatus?.lastCheck || null,
    isOnline: !error,
    cacheSize: versionInfo?.cacheStatus?.cachedEndpoints || 0
  };

  return {
    // Estado
    versionInfo,
    updateStatus,
    isChecking,
    isUpdating,
    error,
    stats,

    // Métodos
    checkForUpdates,
    getVersionInfo,
    forceUpdate,
    getCacheStatus,
    getDebugInfo,

    // Utilidades
    clearError: () => setError(null)
  };
};

export default useApiVersioning;
