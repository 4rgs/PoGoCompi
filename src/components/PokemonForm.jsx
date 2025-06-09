import { useState, useEffect } from 'react';
import {
  Paper,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon, CatchingPokemon as PokemonIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import pokemonDataService from '../services/pokemonDataService';

function PokemonForm({ onAdd, onShowMessage }) {
  const [pokemonData, setPokemonData] = useState([]);
  const [loading, setLoading] = useState(true); // Cambiar a true por defecto
  const [dataReady, setDataReady] = useState(false); // Nuevo estado para indicar cuando los datos están listos
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: '',
    level: 30,
    ivAttack: 15,
    fastMove: '',
    chargedMove: ''
  });

  // Cargar datos ya inicializados del servicio
  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      setLoading(true);
      setDataReady(false);
      
      // Primero verificar si ya hay datos en el servicio
      let data = pokemonDataService.getAllPokemon();
      
      // Si no hay datos, intentar inicializar
      if (data.length === 0) {
        console.log('📋 No hay datos en el servicio, inicializando...');
        const result = await pokemonDataService.initializeData();
        
        if (result.success) {
          data = pokemonDataService.getAllPokemon();
          console.log(`✅ Datos cargados: ${data.length} Pokémon disponibles`);
          
          // Log de ejemplos de nombres procesados
          const examples = data.slice(0, 10);
          console.log('📋 Primeros 10 Pokémon cargados:');
          examples.forEach((pokemon, index) => {
            console.log(`  ${index + 1}. ${pokemon.name} (ID: ${pokemon.id})`);
          });
          
          // Buscar ejemplos de Pokémon con descriptores
          const withDescriptors = data.filter(p => p.name.includes(' - ')).slice(0, 5);
          if (withDescriptors.length > 0) {
            console.log('🎭 Pokémon con descriptores encontrados:');
            withDescriptors.forEach(pokemon => {
              console.log(`  • ${pokemon.name} (ID: ${pokemon.id})`);
            });
          }
          
          const sourceText = result.source === 'api' ? 'PoGoAPI' : 'datos locales';
          onShowMessage(`Datos cargados desde ${sourceText} (${result.count} Pokémon)`, 'success');
        } else {
          setError('No se pudieron cargar los datos de Pokémon');
          setLoading(false);
          return;
        }
      }
      
      console.log('📋 Datos disponibles:', data.length);
      setPokemonData(data);
      
      if (data.length === 0) {
        setError('No hay datos de Pokémon disponibles');
        setDataReady(false);
      } else {
        setError(null);
        setDataReady(true);
        console.log('✅ Datos cargados en formulario:', data.length, 'Pokémon');
        console.log('📝 Primer Pokémon:', data[0]?.name);
      }
    } catch (err) {
      console.error('❌ Error accediendo a datos del servicio:', err);
      setError('Error accediendo a los datos');
      setDataReady(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setDataReady(false);
      const result = await pokemonDataService.refreshData();
      
      if (result.success) {
        const data = pokemonDataService.getAllPokemon();
        setPokemonData(data);
        setDataReady(data.length > 0);
        
        const sourceText = result.source === 'api' ? 'PoGoAPI' : 'datos locales';
        onShowMessage(`Datos actualizados desde ${sourceText} (${data.length} Pokémon)`, 'success');
      } else {
        setError('Error actualizando datos');
        setDataReady(false);
      }
    } catch (err) {
      onShowMessage('Error actualizando datos', 'error');
      setDataReady(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    
    // Si cambia el Pokémon, resetear los movimientos
    if (name === 'name') {
      setForm(prev => ({ 
        ...prev, 
        [name]: value, // Asegurar que nunca sea undefined
        fastMove: '',
        chargedMove: ''
      }));
    } else {
      setForm(prev => ({ 
        ...prev, 
        [name]: value // Asegurar que nunca sea undefined
      }));
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    onAdd({ ...form, level: parseFloat(form.level), ivAttack: parseInt(form.ivAttack) });
    // Resetear el formulario después de agregar
    setForm({
      name: '',
      level: 30,
      ivAttack: 15,
      fastMove: '',
      chargedMove: ''
    });
  };

  const selected = pokemonData.find(p => p.name === form.name);

  // Mostrar loading state completo durante la inicialización
  if (loading && !dataReady) {
    return (
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 3, sm: 4, md: 5 }, 
          mb: { xs: 3, sm: 4 }, 
          maxWidth: { xs: '100%', sm: '600px', md: '800px' }, 
          mx: 'auto',
          width: '100%',
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          textAlign: 'center',
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress size={60} sx={{ mb: 3, color: 'primary.main' }} />
        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
          🎯 Inicializando Comparador de Pokémon
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          Cargando datos desde PoGoAPI...
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Esto puede tomar unos segundos la primera vez
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: { xs: 3, sm: 4, md: 5 }, 
        mb: { xs: 3, sm: 4 }, 
        maxWidth: { xs: '100%', sm: '600px', md: '800px' }, 
        mx: 'auto',
        width: '100%',
        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
      }}
    >
      <Box 
        sx={{ 
          textAlign: 'center', 
          mb: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 1, sm: 2 }
        }}
      >
        <PokemonIcon sx={{ 
          color: 'primary.main', 
          fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } 
        }} />
        <Typography 
          variant="h5" 
          component="h2" 
          color="primary" 
          fontWeight="bold"
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } }}
        >
          🎯 Agregar Pokémon
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={loading && dataReady ? <CircularProgress size={16} /> : <RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
          sx={{ 
            ml: { sm: 'auto' },
            mt: { xs: 1, sm: 0 },
            minWidth: 'auto'
          }}
        >
          {loading && dataReady ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleRefresh}
              disabled={loading}
            >
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {!error && !dataReady && !loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No hay datos de Pokémon disponibles. Intenta actualizar los datos.
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12}>
            <FormControl fullWidth required disabled={!dataReady}>
              <InputLabel>Pokémon</InputLabel>
              <Select
                name="name"
                value={form.name}
                onChange={handleChange}
                label="Pokémon"
                startAdornment={
                  !dataReady ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                      <CircularProgress size={16} />
                    </Box>
                  ) : null
                }
              >
                {dataReady ? (
                  pokemonData.map((p, index) => (
                    <MenuItem key={(p.id || p.name)+index+ ''} value={p.name}>{p.name}</MenuItem>
                  ))
                ) : (
                  <MenuItem value="">Cargando Pokémon...</MenuItem>
                )}
              </Select>
            </FormControl>
            {!dataReady && (
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  display: 'block', 
                  mt: 1, 
                  fontStyle: 'italic',
                  textAlign: 'center' 
                }}
              >
                ⏳ Cargando datos de Pokémon...
              </Typography>
            )}
            {dataReady && !form.name && (
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  display: 'block', 
                  mt: 1, 
                  fontStyle: 'italic',
                  textAlign: 'center' 
                }}
              >
                💡 Selecciona un Pokémon para habilitar los campos de movimientos
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              name="level"
              type="number"
              label="Nivel"
              value={form.level}
              onChange={handleChange}
              inputProps={{ min: 1, max: 50 }}
              fullWidth
              required
              disabled={!dataReady}
              InputProps={{
                startAdornment: !dataReady ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
                    <CircularProgress size={16} />
                  </Box>
                ) : null
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              name="ivAttack"
              type="number"
              label="IV Ataque"
              value={form.ivAttack}
              onChange={handleChange}
              inputProps={{ min: 0, max: 15 }}
              fullWidth
              required
              disabled={!dataReady}
              InputProps={{
                startAdornment: !dataReady ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
                    <CircularProgress size={16} />
                  </Box>
                ) : null
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required disabled={!selected || !dataReady}>
              <InputLabel>Ataque Rápido</InputLabel>
              <Select
                name="fastMove"
                value={form.fastMove}
                onChange={handleChange}
                label="Ataque Rápido"
                startAdornment={
                  !dataReady ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                      <CircularProgress size={16} />
                    </Box>
                  ) : null
                }
              >
                {!dataReady ? (
                  <MenuItem value="">Cargando movimientos...</MenuItem>
                ) : selected ? (
                  selected.fastMoves.map(m => (
                    <MenuItem key={m.name} value={m.name}>{m.name}</MenuItem>
                  ))
                ) : (
                  <MenuItem value="">Selecciona un Pokémon primero</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required disabled={!selected || !dataReady}>
              <InputLabel>Ataque Cargado</InputLabel>
              <Select
                name="chargedMove"
                value={form.chargedMove}
                onChange={handleChange}
                label="Ataque Cargado"
                startAdornment={
                  !dataReady ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                      <CircularProgress size={16} />
                    </Box>
                  ) : null
                }
              >
                {!dataReady ? (
                  <MenuItem value="">Cargando movimientos...</MenuItem>
                ) : selected ? (
                  selected.chargedMoves.map(m => (
                    <MenuItem key={m.name} value={m.name}>{m.name}</MenuItem>
                  ))
                ) : (
                  <MenuItem value="">Selecciona un Pokémon primero</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 2, sm: 3 } }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={!dataReady ? <CircularProgress size={20} /> : <AddIcon />}
                disabled={!dataReady || !form.name || !form.fastMove || !form.chargedMove}
                sx={{ 
                  py: { xs: 1.5, sm: 2 }, 
                  px: { xs: 3, sm: 4 },
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  minWidth: { xs: '200px', sm: '250px' },
                  borderRadius: 3,
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
                  '&:hover:not(:disabled)': {
                    background: 'linear-gradient(45deg, #2563eb, #1e40af)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                  },
                  '&:disabled': {
                    background: 'linear-gradient(45deg, #64748b, #475569)',
                    color: 'rgba(255, 255, 255, 0.5)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {!dataReady ? '⏳ Cargando...' : '⚡ Agregar Pokémon'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}

export default PokemonForm;
