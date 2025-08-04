import { Chart } from 'react-chartjs-2';
import { Paper, Typography, Box, useTheme, useMediaQuery } from '@mui/material';
import { BarChart as BarChartIcon, ShowChart as ChartIcon } from '@mui/icons-material';
import { getBlendedTypeColor, getTypeColorWithAlpha } from '../utils/typeColors';

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  Title,
  SubTitle
} from 'chart.js';

// Registrar todos los elementos necesarios para gráficos mixtos
ChartJS.register(
  BarElement, 
  CategoryScale,
  LinearScale, 
  Tooltip, 
  Legend,
  LineElement,
  PointElement,
  Title,
  SubTitle
);

function DPSChart({ pokemonList }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Función para extraer DPS según la estructura (object o number)
  const getDPS = (pokemon, window = 'short') => {
    if (!pokemon) return 0;
    
    if (typeof pokemon.dps === 'object' && pokemon.dps !== null) {
      return parseFloat(pokemon.dps[window]) || parseFloat(pokemon.dps.short) || 0;
    }
    
    return parseFloat(pokemon.dps) || 0;
  };

  // Función para obtener daño total de combate
  const getTotalDamage = (pokemon, window = 'short') => {
    if (!pokemon) return 0;
    
    if (pokemon.combatDetails && pokemon.combatDetails[window]) {
      return pokemon.combatDetails[window].totalDamage || 0;
    }
    
    // Fallback calculation
    const dps = getDPS(pokemon, window);
    const timeMultiplier = window === 'short' ? 10 : window === 'medium' ? 30 : 60;
    return Math.round(dps * timeMultiplier);
  };
  
  // Ordenar por DPS de la ventana corta (10s) para consistencia
  const sortedPokemonList = [...pokemonList].sort((a, b) => getDPS(b) - getDPS(a));

  if (pokemonList.length === 0) {
    return (
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 3, sm: 4, md: 5 }, 
          textAlign: 'center',
          mx: 'auto',
          maxWidth: { xs: '100%', sm: '600px' },
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(59, 130, 246, 0.1)',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: { xs: 2, sm: 3 }
        }}>
          <ChartIcon sx={{ 
            fontSize: { xs: 56, sm: 72, md: 80 }, 
            color: 'text.disabled',
            opacity: 0.6,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
          }} />
          <Box>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              gutterBottom 
              sx={{ 
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.4rem' },
                fontWeight: 600
              }}
            >
              📊 Gráfico de DPS no disponible
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                fontSize: { xs: '0.9rem', sm: '1rem' },
                opacity: 0.8,
                maxWidth: '400px',
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Agrega uno o más Pokémon usando el formulario de arriba para ver la comparación visual de DPS y daño total
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  }

  const data = {
    labels: sortedPokemonList.map(p => p.uniqueName || p.name || 'Unknown'),
    datasets: [
      {
        label: 'Daño Total (10s)',
        data: sortedPokemonList.map(p => getTotalDamage(p, 'short')),
        backgroundColor: sortedPokemonList.map(p => getTypeColorWithAlpha(p.types, 0.9)),
        borderColor: sortedPokemonList.map(p => getBlendedTypeColor(p.types)),
        borderWidth: 2,
        borderRadius: {
          topLeft: 8,
          topRight: 8,
          bottomLeft: 0,
          bottomRight: 0,
        },
        borderSkipped: false,
        hoverBackgroundColor: sortedPokemonList.map(p => getTypeColorWithAlpha(p.types, 1.0)),
        hoverBorderColor: sortedPokemonList.map(p => getBlendedTypeColor(p.types)),
        hoverBorderWidth: 3,
        order: 3
      },
      {
        label: 'Daño Total (30s)',
        data: sortedPokemonList.map(p => getTotalDamage(p, 'medium')),
        backgroundColor: sortedPokemonList.map(p => getTypeColorWithAlpha(p.types, 0.7)),
        borderColor: sortedPokemonList.map(p => getBlendedTypeColor(p.types)),
        borderWidth: 2,
        borderRadius: {
          topLeft: 4,
          topRight: 4,
          bottomLeft: 0,
          bottomRight: 0,
        },
        borderSkipped: false,
        hoverBackgroundColor: sortedPokemonList.map(p => getTypeColorWithAlpha(p.types, 0.8)),
        hoverBorderColor: sortedPokemonList.map(p => getBlendedTypeColor(p.types)),
        hoverBorderWidth: 3,
        order: 2
      },
      {
        label: 'Daño Total (60s)',
        data: sortedPokemonList.map(p => getTotalDamage(p, 'long')),
        backgroundColor: sortedPokemonList.map(p => getTypeColorWithAlpha(p.types, 0.5)),
        borderColor: sortedPokemonList.map(p => getBlendedTypeColor(p.types)),
        borderWidth: 2,
        borderRadius: {
          topLeft: 4,
          topRight: 4,
          bottomLeft: 0,
          bottomRight: 0,
        },
        borderSkipped: false,
        hoverBackgroundColor: sortedPokemonList.map(p => getTypeColorWithAlpha(p.types, 0.6)),
        hoverBorderColor: sortedPokemonList.map(p => getBlendedTypeColor(p.types)),
        hoverBorderWidth: 3,
        order: 1
      },
      {
        label: 'DPS Promedio',
        data: sortedPokemonList.map(p => {
          const dps = getDPS(p, 'short');
          return parseFloat(dps?.toFixed(1));
        }),
        backgroundColor: 'rgba(34, 197, 94, 0.3)',
        borderColor: 'rgba(34, 197, 94, 0.8)',
        borderWidth: 3,
        type: 'line',
        yAxisID: 'y1',
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: 'rgba(255, 255, 255, 0.8)',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.3,
        fill: false,
        order: 0
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: isMobile ? 'bottom' : 'top',
        align: 'center',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: isMobile ? 11 : isTablet ? 12 : 14,
            family: theme.typography.fontFamily,
            weight: '500',
          },
          padding: isMobile ? 15 : 20,
          usePointStyle: true,
          pointStyle: 'rect',
          boxWidth: isMobile ? 12 : 15,
          boxHeight: isMobile ? 8 : 10,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
        cornerRadius: 8,
        padding: { top: 6, bottom: 6, left: 8, right: 8 },
        titleFont: {
          size: isMobile ? 10 : 11,
          weight: 'bold',
        },
        bodyFont: {
          size: isMobile ? 9 : 10,
        },
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          title: function(context) {
            return `🎯 ${context[0].label}`;
          },
          label: function(context) {
            const label = context.dataset.label;
            const value = context.raw;
            
            if (label.includes('Daño Total (10s)')) {
              return `💥 ${value} (10s)`;
            } else if (label.includes('Daño Total (30s)')) {
              return `💥 ${value} (30s)`;
            } else if (label.includes('Daño Total (60s)')) {
              return `💥 ${value} (60s)`;
            } else if (label.includes('DPS Promedio')) {
              return `⚡ DPS: ${value?.toFixed(1)}`;
            }
            return `${value}`;
          },
          afterLabel: function(context) {
            const pokemon = sortedPokemonList[context.dataIndex];
            const datasetLabel = context.dataset.label;
            const labels = [];
            
            if (!pokemon) return labels;
            
            // Información ultra-compacta en máximo 2 líneas
            if (datasetLabel.includes('Daño Total')) {
              const window = datasetLabel.includes('10s') ? 'short' : 
                           datasetLabel.includes('30s') ? 'medium' : 'long';
              
              // Línea 1: Stats de combate principales (horizontal)
              const dps = getDPS(pokemon, window)?.toFixed(1);
              const fastAttacks = pokemon.combatDetails?.[window]?.fastAttacks || 'N/A';
              const chargedAttacks = pokemon.combatDetails?.[window]?.chargedAttacks || 'N/A';
              labels.push(`⚔️ DPS: ${dps} | ⚡ ${fastAttacks} Fast | 💫 ${chargedAttacks} Charged`);
              
              // Línea 2: Tipo y stats básicos (horizontal)
              const typeStr = Array.isArray(pokemon.types) ? pokemon.types.join('/') : pokemon.types || 'N/A';
              const attack = pokemon.attack || 'N/A';
              const level = pokemon.level || 30;
              labels.push(`🏷️ ${typeStr} | 📊 ATK:${attack} LV:${level}`);
              
            } else if (datasetLabel.includes('DPS Promedio')) {
              // Solo información esencial para la línea DPS
              const attack = pokemon.attack || 'N/A';
              const level = pokemon.level || 30;
              labels.push(`📊 ATK: ${attack} | Nivel: ${level} | DPS constante`);
            }
            
            return labels;
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    layout: {
      padding: {
        top: 20,
        bottom: 10,
        left: isMobile ? 10 : 20,
        right: isMobile ? 10 : 20,
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: isMobile ? 10 : isTablet ? 11 : 12,
            family: theme.typography.fontFamily,
          },
          padding: isMobile ? 5 : 10,
        },
        title: {
          display: !isMobile,
          text: 'Daño Total Acumulado',
          color: 'rgba(255, 255, 255, 0.9)',
          font: {
            size: isMobile ? 11 : 13,
            weight: 'bold',
            family: theme.typography.fontFamily,
          },
          padding: {
            bottom: 10
          }
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'rgba(59, 130, 246, 0.8)',
          font: {
            size: isMobile ? 10 : isTablet ? 11 : 12,
            family: theme.typography.fontFamily,
          },
          padding: isMobile ? 5 : 10,
        },
        title: {
          display: !isMobile,
          text: 'DPS Promedio',
          color: 'rgba(34, 197, 94, 0.9)',
          font: {
            size: isMobile ? 11 : 13,
            weight: 'bold',
            family: theme.typography.fontFamily,
          },
          padding: {
            bottom: 10
          }
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          maxRotation: isMobile ? 45 : isTablet ? 30 : 0,
          minRotation: 0,
          font: {
            size: isMobile ? 9 : isTablet ? 10 : 11,
            family: theme.typography.fontFamily,
          },
          padding: isMobile ? 5 : 10,
          callback: function(value) {
            const label = this.getLabelForValue(value);
            // En móvil, truncar nombres largos
            if (isMobile && label.length > 10) {
              return label.substring(0, 8) + '...';
            }
            return label;
          }
        },
        title: {
          display: !isMobile,
          text: 'Pokémon',
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 12,
            weight: 'bold',
          }
        }
      }
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: { xs: 2, sm: 3, md: 4 }, 
        mx: 'auto', 
        width: '100%',
        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
      }}
    >
      <Box 
        display="flex" 
        alignItems="center" 
        mb={{ xs: 2, sm: 3 }} 
        justifyContent="center"
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 1, sm: 0 }}
      >
        <BarChartIcon sx={{ 
          mr: { xs: 0, sm: 1 }, 
          color: 'primary.main', 
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } 
        }} />
        <Typography 
          variant="h5" 
          component="h2" 
          color="primary" 
          fontWeight="bold"
          sx={{ 
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
            textAlign: 'center'
          }}
        >
          📈 Comparación de Daño Total Multi-Ventana
        </Typography>
      </Box>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        textAlign="center" 
        mb={{ xs: 2, sm: 3 }}
        sx={{ 
          fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
          lineHeight: { xs: 1.4, sm: 1.5 },
          maxWidth: '900px',
          mx: 'auto'
        }}
      >
        💥 <strong>Daño Total</strong> = Daño acumulado en diferentes ventanas de tiempo | ⚡ <strong>DPS Promedio</strong> = Daño por segundo constante
        <br />
        🕐 <strong>10s/30s/60s</strong>: Ventanas de combate para análisis comparativo | 🎯 <strong>Hover sobre cada barra</strong> para ver detalles específicos
        <br />
        ⭐ <strong>STAB</strong>: +20% daño cuando tipo del ataque = tipo del Pokémon | 🔥 <strong>Shadow</strong>: +20% daño adicional
      </Typography>
      <Box sx={{ 
        height: { xs: 350, sm: 400, md: 450, lg: 500 },
        width: '100%',
        position: 'relative'
      }}>
        <Chart data={data} options={options} type="bar" />
      </Box>
    </Paper>
  );
}

export default DPSChart;
