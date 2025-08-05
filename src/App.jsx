import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Snackbar, Alert, Container, Box } from '@mui/material';
import PokemonForm from './components/PokemonForm';
import ComparisonTable from './components/ComparisonTable';
import DPSChart from './components/DPSChart';
import PWAStatus from './components/PWAStatus';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import AppFooter from './components/AppFooter';
import ApiVersionStatus from './components/ApiVersionStatus';
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
      <div className="min-h-screen flex flex-col items-center justify-start py-4 md:py-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-emerald-500/10 pointer-events-none"></div>

        <Container 
          maxWidth={false}
          sx={{ 
            position: 'relative', 
            zIndex: 10, 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            width: '100%',
            maxWidth: '1600px', // Límite máximo para pantallas muy grandes
            mx: 'auto', // Centrar horizontalmente
            px: { xs: 2, sm: 3, md: 4, lg: 6 } // Márgenes responsivos
          }}
        >
          {/* Header */}
          <div className="text-center mb-6 md:mb-8 w-full">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 via-blue-500 to-emerald-400 bg-clip-text text-transparent filter drop-shadow-lg">
              ⚡ Comparador de Pokémon GO ⚡
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-300 max-w-4xl mx-auto leading-relaxed opacity-90 font-normal">
              🎯 Analiza y compara el DPS de tus Pokémon favoritos con precisión profesional
            </p>
          </div>

          {/* API Version Status */}
          <Box sx={{ mb: 2 }}>
            <ApiVersionStatus />
          </Box>

          {/* Main Content - Flex Layout */}
          <Box sx={{ 
            flex: 1, 
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: { xs: 2, sm: 3, md: 4 } 
          }}>
            {/* Top Row: Form + Table - Flex Row */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', lg: 'row' },
              gap: { xs: 2, sm: 3, md: 4 },
              width: '100%'
            }}>
              {/* Form Card - Left side */}
              <Box sx={{ 
                flex: { xs: '1 1 100%', lg: '0 0 400px' },
                maxWidth: { xs: '100%', lg: '400px' },
                minWidth: { lg: '350px' }
              }}>
                <PokemonForm onAdd={handleAddPokemon} onShowMessage={showNotification} />
              </Box>

              {/* Table Card - Right side, takes remaining space */}
              <Box sx={{ 
                flex: { xs: '1 1 100%', lg: '1 1 auto' },
                minWidth: 0 // Permite que el contenido se contraiga
              }}>
                <ComparisonTable pokemonList={pokemonList} onClear={handleClearList} />
              </Box>
            </Box>

            {/* Bottom Row: Chart - Full width */}
            <Box sx={{ width: '100%' }}>
              <DPSChart pokemonList={pokemonList} />
            </Box>
          </Box>
        </Container>

        {/* Footer con información de versión */}
        <Box sx={{ width: '100%', mt: 'auto', pt: 4 }}>
          <AppFooter />
        </Box>
      </div>

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
