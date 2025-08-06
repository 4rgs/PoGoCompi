import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Tooltip,
  IconButton,
  Alert
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Star as StarIcon,
  Security as DefenseIcon,
  LocalFireDepartment as AttackIcon,
  Favorite as StaminaIcon,
  Speed as SpeedIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import PokemonImage from './PokemonImage';
import TypeChips from './TypeChips';
import { getTypeBackground, getTypeColor } from '../utils/typeColors';
import { calculateTypeEffectiveness } from '../utils/dpsCalculator';

// Tabla completa de tipos para análisis de efectividad
const ALL_TYPES = [
  'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice',
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
  'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
];

function PokemonStatsCard({ pokemon, level, ivAttack, ivDefense, ivStamina }) {
  // Convertir a números manejando strings, números y valores undefined/null
  const actualLevel = isNaN(Number(level)) ? 50 : Number(level);
  const actualIvAttack = isNaN(Number(ivAttack)) ? 15 : Number(ivAttack);
  const actualIvDefense = isNaN(Number(ivDefense)) ? 15 : Number(ivDefense);
  const actualIvStamina = isNaN(Number(ivStamina)) ? 15 : Number(ivStamina);

  const [typeAnalysis, setTypeAnalysis] = useState({ weaknesses: [], resistances: [], immunities: [] });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (pokemon && pokemon.types) {
      analyzeTypeEffectiveness(pokemon.types);
    }
  }, [pokemon]);

  const analyzeTypeEffectiveness = (pokemonTypes) => {
    const weaknesses = [];
    const resistances = [];
    const immunities = [];

    ALL_TYPES.forEach(attackType => {
      const effectiveness = calculateTypeEffectiveness(attackType, pokemonTypes);

      if (effectiveness > 1.0) {
        weaknesses.push({
          type: attackType,
          multiplier: effectiveness,
          severity: effectiveness >= 2.0 ? 'critical' : 'high'
        });
      } else if (effectiveness < 1.0 && effectiveness > 0) {
        resistances.push({
          type: attackType,
          multiplier: effectiveness,
          strength: effectiveness <= 0.5 ? 'strong' : 'moderate'
        });
      } else if (effectiveness === 0 || effectiveness <= 0.39) {
        immunities.push({
          type: attackType,
          multiplier: effectiveness
        });
      }
    });

    setTypeAnalysis({ weaknesses, resistances, immunities });
  };

  const calculateRealStats = () => {
    if (!pokemon) return { attack: 0, defense: 0, stamina: 0, cp: 0 };

    const CP_MULTIPLIER = {
      20: 0.5974, 25: 0.6675, 30: 0.7317, 35: 0.7903, 40: 0.8414, 45: 0.8840, 50: 0.9194
    };

    const cpMultiplier = CP_MULTIPLIER[actualLevel] || CP_MULTIPLIER[30];

    const attack = (pokemon.baseAttack + actualIvAttack) * cpMultiplier;
    const defense = ((pokemon.baseDefense || 100) + actualIvDefense) * cpMultiplier;
    const stamina = ((pokemon.baseStamina || 100) + actualIvStamina) * cpMultiplier;

    // Calcular CP oficial
    const cp = Math.floor(attack * Math.sqrt(defense) * Math.sqrt(stamina) * Math.pow(cpMultiplier, 2) / 10);

    return {
      attack: Math.round(attack),
      defense: Math.round(defense),
      stamina: Math.round(stamina),
      cp: Math.max(cp, 10)
    };
  };

  const getStatBarColor = (value, max = 300) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return '#4caf50'; // Verde
    if (percentage >= 60) return '#ff9800'; // Naranja
    if (percentage >= 40) return '#ffc107'; // Amarillo
    return '#f44336'; // Rojo
  };

  const getTypeChipVariant = (multiplier, type) => {
    if (multiplier >= 2.0) return 'critical';
    if (multiplier >= 1.6) return 'high';
    if (multiplier <= 0.39) return 'immune';
    if (multiplier <= 0.5) return 'strong';
    return 'moderate';
  };

  if (!pokemon) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 3,
          textAlign: 'center',
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(59, 130, 246, 0.1)',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          🎯 Selecciona un Pokémon para ver sus estadísticas
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          El análisis de tipos y estadísticas aparecerá aquí
        </Typography>
      </Paper>
    );
  }

  const realStats = calculateRealStats();

  return (
    <Paper
      elevation={3}
      sx={{
        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        overflow: 'hidden'
      }}
    >
      {/* Header con imagen y nombre */}
      <Box sx={{
        background: `linear-gradient(135deg, ${getTypeBackground(pokemon.types?.[0] || 'Normal')}, ${getTypeBackground(pokemon.types?.[1] || pokemon.types?.[0] || 'Normal')})`,
        p: 3,
        color: 'white',
        textAlign: 'center'
      }}>
        <PokemonImage
          pokemon={pokemon}
          size={120}
          sx={{
            mb: 2,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
          }}
        />

        <Typography variant="h4" fontWeight="bold" sx={{
          textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
          mb: 1
        }}>
          {pokemon.name}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
          <TypeChips types={pokemon.types} size="medium" />
        </Box>

        <Typography variant="h5" fontWeight="bold" sx={{
          textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
        }}>
          CP: {realStats.cp}
        </Typography>

        <Typography variant="body2" sx={{
          opacity: 0.9,
          textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
        }}>
          Nivel {actualLevel} • IVs: {actualIvAttack}/{actualIvDefense}/{actualIvStamina}
        </Typography>
      </Box>

      {/* Estadísticas base */}
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <StarIcon color="primary" />
          Estadísticas Base
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box sx={{
              p: 2,
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(244, 67, 54, 0.05))',
              border: '1px solid rgba(244, 67, 54, 0.2)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AttackIcon sx={{ color: '#f44336' }} />
                <Typography variant="subtitle2" fontWeight="bold">Ataque</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="#f44336">
                {pokemon.baseAttack}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Real: {realStats.attack}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(pokemon.baseAttack / 300) * 100}
                sx={{
                  mt: 1,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getStatBarColor(pokemon.baseAttack),
                    borderRadius: 3
                  }
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box sx={{
              p: 2,
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.05))',
              border: '1px solid rgba(33, 150, 243, 0.2)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <DefenseIcon sx={{ color: '#2196f3' }} />
                <Typography variant="subtitle2" fontWeight="bold">Defensa</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="#2196f3">
                {pokemon.baseDefense || 100}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Real: {realStats.defense}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={((pokemon.baseDefense || 100) / 300) * 100}
                sx={{
                  mt: 1,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getStatBarColor(pokemon.baseDefense || 100),
                    borderRadius: 3
                  }
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box sx={{
              p: 2,
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05))',
              border: '1px solid rgba(76, 175, 80, 0.2)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <StaminaIcon sx={{ color: '#4caf50' }} />
                <Typography variant="subtitle2" fontWeight="bold">Stamina</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="#4caf50">
                {pokemon.baseStamina || 100}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Real: {realStats.stamina}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={((pokemon.baseStamina || 100) / 300) * 100}
                sx={{
                  mt: 1,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getStatBarColor(pokemon.baseStamina || 100),
                    borderRadius: 3
                  }
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ borderColor: 'rgba(59, 130, 246, 0.1)' }} />

      {/* Análisis de tipos */}
      <Accordion
        expanded={expanded}
        onChange={() => setExpanded(!expanded)}
        sx={{
          background: 'transparent',
          boxShadow: 'none',
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
          sx={{ px: 3, py: 2 }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SpeedIcon color="primary" />
            Análisis de Efectividad de Tipos
            <Tooltip title="Efectividad de ataques enemigos contra este Pokémon">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
        </AccordionSummary>

        <AccordionDetails sx={{ px: 3, pb: 3 }}>
          {/* Debilidades */}
          {typeAnalysis.weaknesses.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, color: '#f44336' }}>
                ⚠️ Debilidades ({typeAnalysis.weaknesses.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {typeAnalysis.weaknesses.map(({ type, multiplier, severity }) => (
                  <Tooltip key={type} title={`Recibe ×${multiplier} daño de ${type}`}>
                    <Chip
                      label={`${type} ×${multiplier}`}
                      size="small"
                      sx={{
                        backgroundColor: severity === 'critical' ? '#d32f2f' : '#f57c00',
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': {
                          backgroundColor: severity === 'critical' ? '#b71c1c' : '#ef6c00',
                        }
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Box>
          )}

          {/* Resistencias */}
          {typeAnalysis.resistances.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, color: '#4caf50' }}>
                🛡️ Resistencias ({typeAnalysis.resistances.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {typeAnalysis.resistances.map(({ type, multiplier, strength }) => (
                  <Tooltip key={type} title={`Recibe ×${multiplier} daño de ${type}`}>
                    <Chip
                      label={`${type} ×${multiplier}`}
                      size="small"
                      sx={{
                        backgroundColor: strength === 'strong' ? '#2e7d32' : '#689f38',
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': {
                          backgroundColor: strength === 'strong' ? '#1b5e20' : '#558b2f',
                        }
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Box>
          )}

          {/* Inmunidades */}
          {typeAnalysis.immunities.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, color: '#9c27b0' }}>
                🚫 Inmunidades ({typeAnalysis.immunities.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {typeAnalysis.immunities.map(({ type, multiplier }) => (
                  <Tooltip key={type} title={`Inmune a ataques de tipo ${type}`}>
                    <Chip
                      label={`${type} ×${multiplier}`}
                      size="small"
                      sx={{
                        backgroundColor: '#7b1fa2',
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': {
                          backgroundColor: '#6a1b9a',
                        }
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Box>
          )}

          {/* Resumen estratégico */}
          <Alert
            severity="info"
            sx={{
              mt: 2,
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              border: '1px solid rgba(33, 150, 243, 0.2)'
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold">💡 Estrategia recomendada:</Typography>
            <Typography variant="body2">
              {typeAnalysis.weaknesses.length > 3
                ? "Pokémon con muchas debilidades - úsalo con cuidado en combates defensivos"
                : typeAnalysis.weaknesses.length === 0
                ? "Excelente resistencia - ideal para tanquear daño"
                : "Balance defensivo bueno - versátil en combate"
              }
              {typeAnalysis.immunities.length > 0 && " Aprovecha sus inmunidades para contrarrestar tipos específicos."}
            </Typography>
          </Alert>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}

export default PokemonStatsCard;
