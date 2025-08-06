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
  Alert,
  Box
} from '@mui/material';
import { Add as AddIcon, CatchingPokemon as PokemonIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import pokemonDataService from '../services/pokemonDataService';
import SearchableSelect from './SearchableSelect';

function PokemonForm({ onAdd, onShowMessage, onPokemonSelect, onFormDataChange }) {
  const [pokemonData, setPokemonData] = useState([]);
  const [loading, setLoading] = useState(true); // Cambiar a true por defecto
  const [dataReady, setDataReady] = useState(false); // Nuevo estado para indicar cuando los datos están listos
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: '',
    level: 50,
    ivAttack: 15,
    ivDefense: 15,
    ivStamina: 15,
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
      const newForm = {
        ...form,
        [name]: value, // Asegurar que nunca sea undefined
        fastMove: '',
        chargedMove: ''
      };
      setForm(newForm);

      // Notificar al componente padre sobre el Pokemon seleccionado
      const selectedPokemon = pokemonData.find(p => p.name === value);
      if (onPokemonSelect) {
        onPokemonSelect(selectedPokemon);
      }

      // Notificar cambios del form
      if (onFormDataChange) {
        onFormDataChange(newForm);
      }
    } else {
      const newForm = {
        ...form,
        [name]: value // Asegurar que nunca sea undefined
      };
      setForm(newForm);

      // Notificar cambios del form para level e IVs
      if (onFormDataChange && (name === 'level' || name === 'ivAttack' || name === 'ivDefense' || name === 'ivStamina')) {
        console.log('PokemonForm enviando:', newForm);
        onFormDataChange(newForm);
      }
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    onAdd({
      ...form,
      level: parseFloat(form.level),
      ivAttack: parseInt(form.ivAttack),
      ivDefense: parseInt(form.ivDefense),
      ivStamina: parseInt(form.ivStamina)
    });
    // Resetear el formulario después de agregar
    setForm({
      name: '',
      level: 50,
      ivAttack: 15,
      ivDefense: 15,
      ivStamina: 15,
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
          textAlign: 'center',
          mx: 'auto',
          width: '100%',
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(59, 130, 246, 0.1)',
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
        mx: 'auto',
        width: '100%',
        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
      }}
    >
      {/* Header */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        gap: { xs: 2, sm: 4 },
        mb: { xs: 3, sm: 4 }
      }}>
        <PokemonIcon sx={{
          fontSize: { xs: 32, sm: 36 },
          color: 'primary.main',
          filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))'
        }} />
        <Typography
          variant="h5"
          color="primary.main"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.4rem', sm: '1.5rem' },
            textAlign: 'center'
          }}
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
            mt: { xs: 0, sm: 0 },
            minWidth: 'fit-content'
          }}
        >
          {loading && dataReady ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </Box>

      {/* Error Alert */}
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

      {/* Info Alert */}
      {!error && !dataReady && !loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No hay datos de Pokémon disponibles. Intenta actualizar los datos.
        </Alert>
      )}

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Pokémon Select con búsqueda - Full Width */}
        <SearchableSelect
          options={pokemonData}
          value={form.name}
          onChange={(newValue) => handleChange({ target: { name: 'name', value: newValue } })}
          label="Pokémon"
          placeholder="Escribe para buscar Pokémon..."
          disabled={!dataReady}
          loading={loading && !dataReady}
          showAvatar={true}
          avatarProperty="imageUrl"
          typesProperty="types"
          idProperty="name" // Usar name como ID único ya que es lo que usamos para la selección
          required={true}
          maxHeight={280}
          maxDisplayItems={50}
          minSearchLength={2}
        />
        {!dataReady && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: -2, mb: 1, textAlign: 'center', fontStyle: 'italic' }}>
            ⏳ Cargando datos de Pokémon...
          </Typography>
        )}
        {dataReady && !form.name && pokemonData.length > 100 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: -2, mb: 1, textAlign: 'center', fontStyle: 'italic' }}>
            💡 Escribe al menos 2 caracteres para buscar entre {pokemonData.length} Pokémon
          </Typography>
        )}
        {dataReady && !form.name && pokemonData.length <= 100 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: -2, mb: 1, textAlign: 'center', fontStyle: 'italic' }}>
            💡 Busca y selecciona un Pokémon para continuar
          </Typography>
        )}

        {/* Stats Card - Mostrar cuando hay un Pokémon seleccionado */}
        {/* Movido fuera del formulario al componente padre */}

        {/* Level y IVs en Grid - 4 columnas en desktop, 2 en tablet, 1 en móvil */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3 }}>
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
                <Box sx={{ display: 'flex', alignItems: 'center', pr: 2 }}>
                  <CircularProgress size={16} />
                </Box>
              ) : null
            }}
          />

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
                <Box sx={{ display: 'flex', alignItems: 'center', pr: 2 }}>
                  <CircularProgress size={16} />
                </Box>
              ) : null
            }}
          />

          <TextField
            name="ivDefense"
            type="number"
            label="IV Defensa"
            value={form.ivDefense}
            onChange={handleChange}
            inputProps={{ min: 0, max: 15 }}
            fullWidth
            required
            disabled={!dataReady}
            InputProps={{
              startAdornment: !dataReady ? (
                <Box sx={{ display: 'flex', alignItems: 'center', pr: 2 }}>
                  <CircularProgress size={16} />
                </Box>
              ) : null
            }}
          />

          <TextField
            name="ivStamina"
            type="number"
            label="IV Stamina"
            value={form.ivStamina}
            onChange={handleChange}
            inputProps={{ min: 0, max: 15 }}
            fullWidth
            required
            disabled={!dataReady}
            InputProps={{
              startAdornment: !dataReady ? (
                <Box sx={{ display: 'flex', alignItems: 'center', pr: 2 }}>
                  <CircularProgress size={16} />
                </Box>
              ) : null
            }}
          />
        </Box>

        {/* Movimientos en Grid - mejor aprovechamiento del ancho */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
          <FormControl fullWidth required disabled={!selected || !dataReady}>
            <InputLabel>Ataque Rápido</InputLabel>
            <Select
              name="fastMove"
              value={form.fastMove}
              onChange={handleChange}
              label="Ataque Rápido"
              startAdornment={
                !dataReady ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', pl: 2 }}>
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

          <FormControl fullWidth required disabled={!selected || !dataReady}>
            <InputLabel>Ataque Cargado</InputLabel>
            <Select
              name="chargedMove"
              value={form.chargedMove}
              onChange={handleChange}
              label="Ataque Cargado"
              startAdornment={
                !dataReady ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', pl: 2 }}>
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
        </Box>

        {/* Submit Button - Full Width */}
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={!dataReady ? <CircularProgress size={20} /> : <AddIcon />}
            disabled={!dataReady || !form.name || !form.fastMove || !form.chargedMove}
            sx={{
              width: '100%',
              py: 1.5,
              px: 3,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 3,
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
      </Box>
    </Paper>
  );
}

export default PokemonForm;
