import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tooltip,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CloudSync as CloudSyncIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Storage as StorageIcon,
  Update as UpdateIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useApiVersioning } from '../hooks/useApiVersioning';

const ApiVersionStatus = ({ compact = false }) => {
  const {
    versionInfo,
    updateStatus,
    isChecking,
    isUpdating,
    error,
    stats,
    checkForUpdates,
    forceUpdate,
    getCacheStatus,
    clearError
  } = useApiVersioning();

  const [expanded, setExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Formatear tiempo relativo
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Nunca';

    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Hace unos segundos';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return time.toLocaleDateString();
  };

  // Componente compacto para mostrar solo el estado principal
  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={`Última verificación: ${formatTimeAgo(stats.lastCheck)}`}>
          <IconButton
            size="small"
            onClick={checkForUpdates}
            disabled={isChecking}
            sx={{ color: stats.hasUpdates ? 'warning.main' : 'success.main' }}
          >
            {isChecking ? (
              <CircularProgress size={16} />
            ) : stats.hasUpdates ? (
              <WarningIcon fontSize="small" />
            ) : (
              <CheckCircleIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        {stats.hasUpdates > 0 && (
          <Chip
            label={`${stats.updatesAvailable} updates`}
            size="small"
            color="warning"
            variant="outlined"
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
        )}
      </Box>
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 2,
        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(59, 130, 246, 0.1)',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudSyncIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" color="primary.main" fontWeight="bold">
            Estado de la API
          </Typography>
          {error && (
            <Tooltip title={error}>
              <WarningIcon sx={{ color: 'error.main', fontSize: 20 }} />
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Verificar actualizaciones">
            <IconButton
              onClick={checkForUpdates}
              disabled={isChecking}
              size="small"
              sx={{ color: 'primary.main' }}
            >
              {isChecking ? <CircularProgress size={20} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Mostrar detalles">
            <IconButton
              onClick={() => setExpanded(!expanded)}
              size="small"
              sx={{ color: 'primary.main' }}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          Error de conectividad: {error}
        </Alert>
      )}

      {/* Stats Summary */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Chip
          icon={<StorageIcon />}
          label={`${stats.cacheSize}/${stats.totalFiles} archivos en caché`}
          variant="outlined"
          size="small"
        />

        <Chip
          icon={stats.hasUpdates ? <UpdateIcon /> : <CheckCircleIcon />}
          label={
            stats.hasUpdates
              ? `${stats.updatesAvailable} actualizaciones disponibles`
              : 'Todo actualizado'
          }
          color={stats.hasUpdates ? 'warning' : 'success'}
          variant="outlined"
          size="small"
        />

        <Chip
          icon={<ScheduleIcon />}
          label={`Última verificación: ${formatTimeAgo(stats.lastCheck)}`}
          variant="outlined"
          size="small"
        />
      </Stack>

      {/* Update Actions */}
      {stats.hasUpdates && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            color="warning"
            startIcon={isUpdating ? <CircularProgress size={16} /> : <UpdateIcon />}
            onClick={() => forceUpdate()}
            disabled={isUpdating}
            size="small"
          >
            {isUpdating ? 'Actualizando...' : `Actualizar ${stats.updatesAvailable} archivos`}
          </Button>
        </Box>
      )}

      {/* Detailed Information */}
      <Collapse in={expanded}>
        <Divider sx={{ my: 2 }} />

        {/* Updates List */}
        {updateStatus?.updates?.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="warning.main" gutterBottom>
              Actualizaciones Disponibles:
            </Typography>
            <List dense>
              {updateStatus.updates.map((update, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon>
                    <UpdateIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={update.fileName}
                    secondary={`${update.currentHash} → ${update.newHash}`}
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                    secondaryTypographyProps={{ fontSize: '0.8rem' }}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => forceUpdate(update.endpoint)}
                    disabled={isUpdating}
                    sx={{ ml: 1 }}
                  >
                    Actualizar
                  </Button>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Cache Details */}
        {versionInfo?.fileVersions && (
          <Box>
            <Typography variant="subtitle2" color="primary.main" gutterBottom>
              Estado de Archivos Monitoreados:
            </Typography>
            <List dense>
              {Object.entries(versionInfo.fileVersions).map(([fileName, info]) => (
                <ListItem key={fileName} sx={{ py: 0.5 }}>
                  <ListItemIcon>
                    {info.upToDate ? (
                      <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                    ) : (
                      <WarningIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={fileName}
                    secondary={
                      info.upToDate
                        ? `Actualizado (${info.apiHash})`
                        : `Desactualizado: ${info.localHash} → ${info.apiHash}`
                    }
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                    secondaryTypographyProps={{
                      fontSize: '0.8rem',
                      color: info.upToDate ? 'success.main' : 'warning.main'
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Debug Actions */}
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<InfoIcon />}
              onClick={() => {
                const cacheStatus = getCacheStatus();
                console.log('Cache Status:', cacheStatus);
                setShowDetails(!showDetails);
              }}
            >
              Mostrar Cache
            </Button>

            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => forceUpdate()}
              disabled={isUpdating}
            >
              Limpiar Todo
            </Button>
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ApiVersionStatus;
