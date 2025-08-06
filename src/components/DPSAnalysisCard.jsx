import {
  Paper,
  Typography,
  Box,
  Chip,
  Grid,
  Divider,
  Tooltip,
  IconButton,
  Collapse
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Bolt as BoltIcon,
  QueryStats as StatsIcon
} from '@mui/icons-material';
import { useState } from 'react';

function DPSAnalysisCard({ pokemonData, isExpanded = false }) {
  const [expanded, setExpanded] = useState(isExpanded);

  if (!pokemonData || !pokemonData.stats) {
    return null;
  }

  const {
    stats,
    dps,
    moves,
    metrics,
    multipliers,
    analysis,
    combatDetails,
    calculationDetails
  } = pokemonData;

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const getEffectivenessColor = (level) => {
    const colors = {
      excellent: '#4caf50',
      very_good: '#8bc34a',
      good: '#cddc39',
      neutral: '#ff9800',
      poor: '#ff5722',
      very_poor: '#f44336'
    };
    return colors[level] || colors.neutral;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'error',
      medium: 'warning',
      low: 'info'
    };
    return colors[priority] || 'default';
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mb: 2,
        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: 2
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <StatsIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" color="primary">
            📊 Análisis Avanzado de DPS
          </Typography>
        </Box>
        <IconButton
          onClick={handleExpandClick}
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
            color: 'primary.main'
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>

      {/* Estadísticas Principales */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Ataque Real
            </Typography>
            <Typography variant="h6" color="primary.main">
              {stats.attack}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              CP Calculado
            </Typography>
            <Typography variant="h6" color="primary.main">
              {stats.cp}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Nivel
            </Typography>
            <Typography variant="h6" color="primary.main">
              {stats.level}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              DPS Promedio
            </Typography>
            <Typography variant="h6" color="primary.main">
              {((dps.short + dps.medium + dps.long) / 3).toFixed(1)}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* DPS por Ventanas */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          DPS por Ventana de Tiempo
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Tooltip title="Ideal para raids rápidos y gimnasios">
              <Chip
                icon={<BoltIcon />}
                label={`10s: ${dps.short}`}
                color="error"
                variant="outlined"
                size="small"
                sx={{ width: '100%' }}
              />
            </Tooltip>
          </Grid>
          <Grid item xs={4}>
            <Tooltip title="Liga GO Battle típica">
              <Chip
                icon={<SpeedIcon />}
                label={`30s: ${dps.medium}`}
                color="warning"
                variant="outlined"
                size="small"
                sx={{ width: '100%' }}
              />
            </Tooltip>
          </Grid>
          <Grid item xs={4}>
            <Tooltip title="Análisis de resistencia completa">
              <Chip
                icon={<TrendingUpIcon />}
                label={`60s: ${dps.long}`}
                color="info"
                variant="outlined"
                size="small"
                sx={{ width: '100%' }}
              />
            </Tooltip>
          </Grid>
        </Grid>
      </Box>

      {/* Análisis de Efectividad */}
      {analysis && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Análisis de Efectividad
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`General: ${analysis.effectiveness.overall}`}
              sx={{
                backgroundColor: getEffectivenessColor(analysis.effectiveness.overall),
                color: 'white',
                fontSize: '0.75rem'
              }}
              size="small"
            />
            <Chip
              label={`Rápido: ${analysis.effectiveness.fastMove}`}
              sx={{
                backgroundColor: getEffectivenessColor(analysis.effectiveness.fastMove),
                color: 'white',
                fontSize: '0.75rem'
              }}
              size="small"
            />
            <Chip
              label={`Cargado: ${analysis.effectiveness.chargedMove}`}
              sx={{
                backgroundColor: getEffectivenessColor(analysis.effectiveness.chargedMove),
                color: 'white',
                fontSize: '0.75rem'
              }}
              size="small"
            />
          </Box>
        </Box>
      )}

      {/* Contenido Expandible */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider sx={{ my: 2, borderColor: 'rgba(59, 130, 246, 0.2)' }} />

        {/* Multiplicadores */}
        {multipliers && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="primary.main" sx={{ mb: 2 }}>
              🎯 Multiplicadores de Daño
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Movimiento Rápido
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {multipliers.fast.description}
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    ×{multipliers.fast.totalMultiplier.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Movimiento Cargado
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {multipliers.charged.description}
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    ×{multipliers.charged.totalMultiplier.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Métricas Avanzadas */}
        {metrics && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="primary.main" sx={{ mb: 2 }}>
              ⚡ Métricas de Combate
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Tiempo para Cargar
                </Typography>
                <Typography variant="body1">
                  {metrics.timeToCharge}s
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Ciclos/Minuto
                </Typography>
                <Typography variant="body1">
                  {metrics.cyclesPerMinute}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  DPS del Ciclo
                </Typography>
                <Typography variant="body1">
                  {metrics.cycleDPS}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Estrategia
                </Typography>
                <Typography variant="body1">
                  {metrics.recommendedStrategy === 'charged_focused' ? '🔋 Cargado' : '⚡ Rápido'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Detalles de Combate */}
        {combatDetails?.short && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="primary.main" sx={{ mb: 2 }}>
              🥊 Simulación de Combate (10s)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Daño Total
                </Typography>
                <Typography variant="body1" color="primary.main">
                  {combatDetails.short.totalDamage}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Mov. Rápidos
                </Typography>
                <Typography variant="body1">
                  {combatDetails.short.fastMoveCount}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Mov. Cargados
                </Typography>
                <Typography variant="body1">
                  {combatDetails.short.chargedMoveCount}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Eficiencia
                </Typography>
                <Typography variant="body1">
                  {combatDetails.short.energyEfficiency}%
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Recomendaciones */}
        {analysis?.recommendations && analysis.recommendations.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="primary.main" sx={{ mb: 2 }}>
              💡 Recomendaciones
            </Typography>
            {analysis.recommendations.map((rec, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Chip
                  icon={<InfoIcon />}
                  label={rec.message}
                  color={getPriorityColor(rec.priority)}
                  variant="outlined"
                  size="small"
                  sx={{
                    mb: 1,
                    mr: 1,
                    '& .MuiChip-label': {
                      fontSize: '0.75rem'
                    }
                  }}
                />
              </Box>
            ))}
          </Box>
        )}

        {/* Fórmula Utilizada */}
        {calculationDetails && (
          <Box>
            <Typography variant="subtitle2" color="primary.main" sx={{ mb: 1 }}>
              📐 Fórmula Utilizada
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontFamily: 'monospace',
                backgroundColor: 'rgba(0,0,0,0.3)',
                p: 1,
                borderRadius: 1,
                mb: 1
              }}
            >
              {calculationDetails.formula}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ataque: {calculationDetails.attackUsed} |
              Defensa: {calculationDetails.defenseUsed} |
              IVs: {calculationDetails.ivs.attack}/{calculationDetails.ivs.defense}/{calculationDetails.ivs.stamina}
            </Typography>
          </Box>
        )}
      </Collapse>
    </Paper>
  );
}

export default DPSAnalysisCard;
