import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Typography, Box, Snackbar, Alert } from '@mui/material';
import PokemonForm from './components/PokemonForm';
import ComparisonTable from './components/ComparisonTable';
import DPSChart from './components/DPSChart';
import PWAStatus from './components/PWAStatus';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import AppFooter from './components/AppFooter';
import pokemonDataService from './services/pokemonDataService';

// Hacer el servicio disponible globalmente para debugging
if (typeof window !== 'undefined') {
  window.pokemonDataService = pokemonDataService;
}

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: '#0f172a',
      paper: 'rgba(30, 41, 59, 0.8)',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(59, 130, 246, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 16px rgba(59, 130, 246, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            border: '1px solid rgba(59, 130, 246, 0.2)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 20px rgba(59, 130, 246, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.3s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(59, 130, 246, 0.5)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3b82f6',
              boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
        },
        head: {
          fontWeight: 700,
          fontSize: '0.9rem',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
  },
});


function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [appLoading, setAppLoading] = useState(true);

  const showNotification = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Inicializar datos al cargar la aplicación
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Inicializando aplicación...');
        const result = await pokemonDataService.initializeData();

        if (result.success) {
          const sourceText = result.source === 'api' ? 'PoGoAPI.net' : 'datos locales';
          console.log(`✅ Datos cargados desde ${sourceText}: ${result.count} Pokémon`);
          showNotification(`🎯 Aplicación lista! Datos desde ${sourceText} (${result.count} Pokémon)`, 'success');
        } else {
          console.error('❌ Error inicializando datos:', result.error);
          showNotification('⚠️ Error cargando datos. Funcionalidad limitada.', 'warning');
        }
      } catch (error) {
        console.error('❌ Error crítico al inicializar:', error);
        showNotification('❌ Error crítico al inicializar la aplicación', 'error');
      } finally {
        setAppLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleAddPokemon = (pokemon) => {
    try {
      // Usar el nuevo método del servicio para calcular DPS con ventana de tiempo
      const dpsResult = pokemonDataService.calculatePokemonDPS({
        pokemonName: pokemon.name,
        fastMoveName: pokemon.fastMove,
        chargedMoveName: pokemon.chargedMove,
        ivAttack: pokemon.ivAttack,
        level: pokemon.level
      });

      // Crear nomenclatura única para diferenciar Pokémon duplicados
      const existingCount = pokemonList.filter(p => p.name === pokemon.name).length;
      const uniqueName = existingCount > 0 ? `${pokemon.name} #${existingCount + 1}` : pokemon.name;

      setPokemonList(prev => [...prev, {
        ...pokemon,
        uniqueName,
        baseAttack: dpsResult.pokemon.isShadow ? Math.round(dpsResult.attack / (dpsResult.pokemon.shadowBonus?.attack || 1.2)) : dpsResult.attack,
        attack: dpsResult.attack,
        // DPS para múltiples ventanas de tiempo
        dps: dpsResult.dps, // Mantiene compatibilidad con la estructura existente
        dpsMultiple: {
          short: dpsResult.dps.short,   // 10 segundos
          medium: dpsResult.dps.medium, // 30 segundos
          long: dpsResult.dps.long      // 60 segundos
        },
        // Información de combate detallada para todas las ventanas
        combatDetails: dpsResult.combatDetails,
        totalDamage10s: Math.round(dpsResult.combatDetails.short.totalDamage),
        totalDamage30s: Math.round(dpsResult.combatDetails.medium.totalDamage),
        totalDamage60s: Math.round(dpsResult.combatDetails.long.totalDamage),
        // Datos completos de movimientos para tooltips
        fastMoveData: dpsResult.moves.fast,
        chargedMoveData: dpsResult.moves.charged,
        // Tipos del Pokémon base
        types: dpsResult.pokemon.types || ['Normal'],
        // Datos de imagen y formas especiales
        imageUrl: dpsResult.pokemon.imageUrl,
        imageFallback: dpsResult.pokemon.imageFallback,
        isSpecialForm: dpsResult.pokemon.isSpecialForm,
        isShadow: dpsResult.pokemon.isShadow || false,
        isMega: dpsResult.pokemon.isMega || false,
        form: dpsResult.pokemon.form,
        costume: dpsResult.pokemon.costume,
        // CP estimado
        cp: dpsResult.cp || 0
      }]);

      // Mostrar notificación de éxito con detalles del combate
      const combatInfo = dpsResult.combatDetails.short; // Usar ventana corta (10s) para la notificación
      showNotification(
        `✅ ${uniqueName} agregado! DPS: ${dpsResult.dps.short?.toFixed(1)} | ${combatInfo.fastMoveCount}F + ${combatInfo.chargedMoveCount}C en 10s`,
        'success'
      );
    } catch (error) {
      console.error('Error calculando DPS:', error);
      showNotification(`❌ ${error.message}`, 'error');
    }
  };

  const handleClearList = () => {
    setPokemonList([]);
    showNotification("🗑️ Lista limpiada exitosamente", 'info');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 2, sm: 3, md: 4 },
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
          zIndex: 0,
        }
      }}>
        <Container
          maxWidth="xl"
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', sm: '600px', md: '900px', lg: '1200px', xl: '1400px' },
            mx: 'auto',
            position: 'relative',
            zIndex: 1,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box textAlign="center" mb={{ xs: 4, sm: 5, md: 6 }}>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              color="primary"
              fontWeight="bold"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
                mb: { xs: 2, sm: 3 },
                background: 'linear-gradient(45deg, #60a5fa, #3b82f6, #10b981)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 10px rgba(59, 130, 246, 0.3)',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}
            >
              ⚡ Comparador de Pokémon GO ⚡
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem', lg: '1.35rem' },
                maxWidth: '700px',
                mx: 'auto',
                lineHeight: { xs: 1.4, sm: 1.5 },
                opacity: 0.9,
                fontWeight: 400,
              }}
            >
              🎯 Analiza y compara el DPS de tus Pokémon favoritos con precisión profesional
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }}>
            <PokemonForm onAdd={handleAddPokemon} onShowMessage={showNotification} />
            <ComparisonTable pokemonList={pokemonList} onClear={handleClearList} />
            <DPSChart pokemonList={pokemonList} />
          </Box>
        </Container>

        {/* Footer con información de versión */}
        <AppFooter />
      </Box>

      {/* PWA Status - Botones de instalación y gestión de cache */}
      <PWAStatus onCacheApiData={showNotification} />

      {/* PWA Install Prompt - Prompt inteligente de instalación */}
      <PWAInstallPrompt />

      {/* Notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: 2,
            fontWeight: 600,
            color: 'white',
            '& .MuiAlert-message': {
              color: 'white',
            },
            '& .MuiAlert-icon': {
              color: 'white',
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
