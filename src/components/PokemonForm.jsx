import { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
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
    level: 50,
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
      <div className="w-full max-w-none mx-auto mb-6 p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/90 backdrop-blur-lg border border-blue-500/20 rounded-2xl text-center min-h-[300px] flex flex-col justify-center items-center">
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
      </div>
    );
  }

  return (
    <div className="w-full max-w-none mx-auto mb-6 p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/90 backdrop-blur-lg border border-blue-500/20 rounded-2xl">
      {/* Header */}
      <div className="text-center mb-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <PokemonIcon className="text-blue-500 text-3xl" />
        <h2 className="text-2xl font-bold text-blue-500">
          🎯 Agregar Pokémon v2.0
        </h2>
        <Button
          variant="outlined"
          size="small"
          startIcon={loading && dataReady ? <CircularProgress size={16} /> : <RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
          className="sm:ml-auto mt-2 sm:mt-0"
        >
          {loading && dataReady ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          className="mb-6"
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

      {/* Info Alert */}
      {!error && !dataReady && !loading && (
        <Alert severity="info" className="mb-6">
          No hay datos de Pokémon disponibles. Intenta actualizar los datos.
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pokémon Select - Full Width */}
        <div className="w-full">
          <FormControl fullWidth required disabled={!dataReady}>
            <InputLabel>Pokémon</InputLabel>
            <Select
              name="name"
              value={form.name}
              onChange={handleChange}
              label="Pokémon"
              startAdornment={
                !dataReady ? (
                  <div className="flex items-center pl-2">
                    <CircularProgress size={16} />
                  </div>
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
            <p className="text-sm text-slate-400 mt-2 text-center italic">
              ⏳ Cargando datos de Pokémon...
            </p>
          )}
          {dataReady && !form.name && (
            <p className="text-sm text-slate-400 mt-2 text-center italic">
              💡 Selecciona un Pokémon para habilitar los campos de movimientos
            </p>
          )}
        </div>

        {/* Level - Full Width */}
        <div className="w-full">
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
                <div className="flex items-center pr-2">
                  <CircularProgress size={16} />
                </div>
              ) : null
            }}
          />
        </div>

        {/* IV Attack - Full Width */}
        <div className="w-full">
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
                <div className="flex items-center pr-2">
                  <CircularProgress size={16} />
                </div>
              ) : null
            }}
          />
        </div>

        {/* Fast Move - Full Width */}
        <div className="w-full">
          <FormControl fullWidth required disabled={!selected || !dataReady}>
            <InputLabel>Ataque Rápido</InputLabel>
            <Select
              name="fastMove"
              value={form.fastMove}
              onChange={handleChange}
              label="Ataque Rápido"
              startAdornment={
                !dataReady ? (
                  <div className="flex items-center pl-2">
                    <CircularProgress size={16} />
                  </div>
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
        </div>

        {/* Charged Move - Full Width */}
        <div className="w-full">
          <FormControl fullWidth required disabled={!selected || !dataReady}>
            <InputLabel>Ataque Cargado</InputLabel>
            <Select
              name="chargedMove"
              value={form.chargedMove}
              onChange={handleChange}
              label="Ataque Cargado"
              startAdornment={
                !dataReady ? (
                  <div className="flex items-center pl-2">
                    <CircularProgress size={16} />
                  </div>
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
        </div>

        {/* Submit Button - Full Width */}
        <div className="w-full flex justify-center pt-4">
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={!dataReady ? <CircularProgress size={20} /> : <AddIcon />}
            disabled={!dataReady || !form.name || !form.fastMove || !form.chargedMove}
            className="w-full max-w-md py-3 px-6 text-lg font-semibold rounded-xl"
            sx={{
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
        </div>
      </form>
    </div>
  );
}

export default PokemonForm;
