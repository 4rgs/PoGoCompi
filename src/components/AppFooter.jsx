import React from 'react';
import {
  Box,
  Typography,
  Container,
  Chip,
  Stack,
  Link,
  Tooltip
} from '@mui/material';
import {
  Code as CodeIcon,
  Build as BuildIcon
} from '@mui/icons-material';

// Obtener información de la build
const getAppInfo = () => {
  const version = __APP_VERSION__ || '1.0.0';
  const commit = __GIT_COMMIT__ || 'unknown';
  const buildDate = __BUILD_DATE__ || new Date().toISOString();
  
  return {
    version,
    commit: commit.substring(0, 7), // Solo los primeros 7 caracteres del commit
    buildDate: new Date(buildDate).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };
};

const AppFooter = () => {
  const appInfo = getAppInfo();

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: { xs: 3, sm: 4 },
        px: { xs: 2, sm: 3 },
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(59, 130, 246, 0.1)',
        position: 'relative',
        zIndex: 1,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
        }
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          {/* Información de la aplicación */}
          <Box textAlign={{ xs: 'center', md: 'left' }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ 
                fontWeight: 500,
                mb: 0.5,
                fontSize: { xs: '0.85rem', sm: '0.9rem' }
              }}
            >
              Comparador de Pokémon GO - DPS Analyzer
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ 
                opacity: 0.7,
                fontSize: { xs: '0.75rem', sm: '0.8rem' }
              }}
            >
              Desarrollado con ❤️ para la comunidad Pokémon GO
            </Typography>
          </Box>

          {/* Información de versión y build */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems="center"
          >
            <Tooltip title={`Versión de la aplicación: ${appInfo.version}`}>
              <Chip
                size="small"
                label={`v${appInfo.version}`}
                color="primary"
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  '& .MuiChip-label': {
                    px: 1.5
                  }
                }}
              />
            </Tooltip>

            <Tooltip title={`Commit: ${appInfo.commit} | Build: ${appInfo.buildDate}`}>
              <Chip
                size="small"
                icon={<CodeIcon sx={{ fontSize: '0.8rem !important' }} />}
                label={appInfo.commit}
                variant="outlined"
                sx={{
                  fontWeight: 500,
                  fontSize: '0.7rem',
                  opacity: 0.8,
                  '& .MuiChip-label': {
                    px: 1
                  },
                  '& .MuiChip-icon': {
                    fontSize: '0.8rem'
                  }
                }}
              />
            </Tooltip>

            <Tooltip title={`Fecha de build: ${appInfo.buildDate}`}>
              <Chip
                size="small"
                icon={<BuildIcon sx={{ fontSize: '0.8rem !important' }} />}
                label={appInfo.buildDate.split(',')[0]} // Solo la fecha, sin la hora
                variant="outlined"
                sx={{
                  fontWeight: 500,
                  fontSize: '0.7rem',
                  opacity: 0.8,
                  '& .MuiChip-label': {
                    px: 1
                  },
                  '& .MuiChip-icon': {
                    fontSize: '0.8rem'
                  }
                }}
              />
            </Tooltip>
          </Stack>

          {/* Enlaces adicionales */}
          <Stack
            direction="row"
            spacing={2}
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            <Link
              href="https://github.com/4rgs/PoGoCompi"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'text.secondary',
                opacity: 0.7,
                transition: 'all 0.3s ease',
                '&:hover': {
                  opacity: 1,
                  color: 'primary.main'
                }
              }}
            >
              <CodeIcon sx={{ fontSize: '1.2rem' }} />
            </Link>
          </Stack>
        </Stack>

        {/* Información adicional en móvil */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            justifyContent: 'center',
            mt: 2,
            pt: 2,
            borderTop: '1px solid rgba(59, 130, 246, 0.1)'
          }}
        >
          <Link
            href="https://github.com/4rgs/PoGoCompi"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: 'text.secondary',
              opacity: 0.7,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.8rem',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                opacity: 1,
                color: 'primary.main'
              }
            }}
          >
            <CodeIcon sx={{ fontSize: '1rem' }} />
            Ver en GitHub
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default AppFooter;
