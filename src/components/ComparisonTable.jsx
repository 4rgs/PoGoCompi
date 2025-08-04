import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box,
  Button
} from '@mui/material';
import { Speed as SpeedIcon, Star as StarIcon, Clear as ClearIcon, CatchingPokemon as PokemonIcon } from '@mui/icons-material';
import { getTypeBackground, getTypeColor } from '../utils/typeColors';
import TypeChips from './TypeChips';
import MoveBadge from './MoveBadge';
import PokemonImage from './PokemonImage';

function ComparisonTable({ pokemonList, onClear }) {
  // Ordenar por DPS de mayor a menor
  const sortedPokemonList = [...pokemonList].sort((a, b) => b.dps - a.dps);

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
          <PokemonIcon sx={{ 
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
              🎯 No hay Pokémon para comparar
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
              Agrega algunos Pokémon usando el formulario de arriba para comenzar la comparación y análisis de DPS
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        overflow: 'hidden', 
        mx: 'auto', 
        width: '100%',
        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
      }}
    >
      <Box sx={{ 
        p: { xs: 2, sm: 3, md: 4 }, 
        pb: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SpeedIcon sx={{ color: 'primary.main', fontSize: { xs: '1.5rem', sm: '1.75rem' } }} />
          <Typography 
            variant="h5" 
            component="h2" 
            color="primary" 
            fontWeight="bold"
            sx={{ 
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            📊 Comparación de Pokémon
          </Typography>
        </Box>
        {pokemonList.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<ClearIcon />}
            onClick={onClear}
            size="small"
            sx={{ 
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              px: { xs: 2, sm: 3 },
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'error.main',
              }
            }}
          >
            Limpiar Lista
          </Button>
        )}
      </Box>
      
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table stickyHeader sx={{ minWidth: { xs: 800, sm: 'auto' } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ 
                fontWeight: 'bold', 
                backgroundColor: 'primary.dark',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 },
                width: { xs: 80, sm: 100 }
              }}>
                Imagen
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 'bold', 
                backgroundColor: 'primary.dark',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 }
              }}>
                Pokémon
              </TableCell>
              <TableCell align="center" sx={{ 
                fontWeight: 'bold', 
                backgroundColor: 'primary.dark',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 }
              }}>
                Tipos
              </TableCell>
              <TableCell align="center" sx={{ 
                fontWeight: 'bold', 
                backgroundColor: 'primary.dark',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 }
              }}>
                Nivel
              </TableCell>
              <TableCell align="center" sx={{ 
                fontWeight: 'bold', 
                backgroundColor: 'primary.dark',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 }
              }}>
                IV ATK
              </TableCell>
              <TableCell align="center" sx={{ 
                fontWeight: 'bold', 
                backgroundColor: 'primary.dark',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 },
                display: { xs: 'none', md: 'table-cell' }
              }}>
                Ataque Base
              </TableCell>
              <TableCell align="center" sx={{ 
                fontWeight: 'bold', 
                backgroundColor: 'primary.dark',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 },
                display: { xs: 'none', md: 'table-cell' }
              }}>
                Mov. Rápido
              </TableCell>
              <TableCell align="center" sx={{ 
                fontWeight: 'bold', 
                backgroundColor: 'primary.dark',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 }
              }}>
                Mov. Cargado
              </TableCell>
              <TableCell align="center" sx={{ 
                fontWeight: 'bold', 
                backgroundColor: 'primary.dark',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 },
                display: { xs: 'none', lg: 'table-cell' }
              }}>
                Detalles Ataque
              </TableCell>
              <TableCell align="center" sx={{ 
                fontWeight: 'bold', 
                backgroundColor: 'primary.dark',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 }
              }}>
                <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
                  <Box display="flex" alignItems="center">
                    <SpeedIcon sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                    DPS Multi-Ventana
                  </Box>
                  <Box display="flex" gap={0.5} sx={{ fontSize: '0.7rem', opacity: 0.8 }}>
                    <span>10s</span>
                    <span>•</span>
                    <span>30s</span>
                    <span>•</span>
                    <span>60s</span>
                  </Box>
                </Box>
              </TableCell>
              <TableCell align="center" sx={{ 
                fontWeight: 'bold', 
                backgroundColor: 'primary.dark',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 },
                display: { xs: 'none', xl: 'table-cell' }
              }}>
                Análisis Avanzado
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedPokemonList.map((p, i) => (
              <TableRow 
                key={i} 
                hover
                sx={{ 
                  '&:nth-of-type(odd)': { backgroundColor: 'rgba(0,0,0,0.1)' },
                  transition: 'all 0.2s ease-in-out',
                  ...getTypeBackground(p.types),
                  backgroundBlendMode: 'overlay',
                  '&:hover': {
                    filter: 'brightness(1.2)',
                    transform: 'scale(1.01)',
                    transition: 'all 0.2s ease-in-out',
                  }
                }}
              >
                <TableCell align="center" sx={{ 
                  px: { xs: 1, sm: 2 },
                  py: 1
                }}>
                  <PokemonImage pokemon={p} />
                </TableCell>
                <TableCell component="th" scope="row" sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  px: { xs: 1, sm: 2 },
                  color: 'white',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                }}>
                  {p.uniqueName}
                </TableCell>
                <TableCell align="center" sx={{ px: { xs: 1, sm: 2 } }}>
                  <TypeChips types={p.types} size="small" />
                </TableCell>
                <TableCell align="center" sx={{ 
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  px: { xs: 1, sm: 2 },
                  color: 'white',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                }}>
                  {p.level}
                </TableCell>
                <TableCell align="center" sx={{ px: { xs: 1, sm: 2 } }}>
                  <Chip 
                    label={p.ivAttack} 
                    size="small" 
                    color={p.ivAttack === 15 ? 'success' : p.ivAttack >= 10 ? 'warning' : 'default'}
                    icon={<StarIcon />}
                    sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      backgroundColor: p.ivAttack === 15 ? '#4caf50' : p.ivAttack >= 10 ? '#ff9800' : '#757575',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </TableCell>
                <TableCell align="center" sx={{ 
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  px: { xs: 1, sm: 2 },
                  display: { xs: 'none', md: 'table-cell' },
                  color: 'white',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                  fontWeight: 'bold'
                }}>
                  {p.baseAttack}
                </TableCell>
                <TableCell align="center" sx={{ 
                  px: { xs: 1, sm: 2 },
                  display: { xs: 'none', md: 'table-cell' }
                }}>
                  {p.fastMoveData ? (
                    <MoveBadge 
                      move={p.fastMoveData} 
                      isChargedMove={false}
                      size="small"
                      showDetails={true}
                    />
                  ) : (
                    <Typography variant="caption" sx={{ 
                      fontSize: '0.75rem',
                      color: 'white',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                      fontWeight: 'bold'
                    }}>
                      {p.fastMove}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center" sx={{ 
                  px: { xs: 1, sm: 2 }
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    {p.chargedMoveData ? (
                      <MoveBadge 
                        move={p.chargedMoveData} 
                        isChargedMove={true}
                        size="small"
                        showDetails={true}
                      />
                    ) : (
                      <Typography variant="caption" sx={{ 
                        fontSize: '0.75rem',
                        color: 'white',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                        fontWeight: 'bold'
                      }}>
                        {p.chargedMove}
                      </Typography>
                    )}
                    {p.stab && (
                      <Chip 
                        label="STAB" 
                        size="small"
                        sx={{ 
                          fontSize: '0.6rem', 
                          height: '16px',
                          backgroundColor: '#4caf50',
                          color: 'white',
                          fontWeight: 'bold',
                          mt: 0.5
                        }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  px: { xs: 1, sm: 2 },
                  display: { xs: 'none', lg: 'table-cell' },
                  color: 'white',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                      🗡️ DPS: {p.dps}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                      💥 10s: {p.totalDamage10s}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                      ⚔️ ATK: {p.attack}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ px: { xs: 1, sm: 2 } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    {/* DPS para múltiples ventanas de tiempo */}
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                      <Chip 
                        label={`${typeof p.dps === 'object' ? p.dps.short : p.dps}`}
                        variant="filled"
                        size="small"
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: '0.65rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          minWidth: '45px'
                        }}
                      />
                      {typeof p.dps === 'object' && (
                        <>
                          <Chip 
                            label={p.dps.medium}
                            variant="filled"
                            size="small"
                            sx={{ 
                              fontWeight: 'bold',
                              fontSize: '0.65rem',
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              minWidth: '45px'
                            }}
                          />
                          <Chip 
                            label={p.dps.long}
                            variant="filled"
                            size="small"
                            sx={{ 
                              fontWeight: 'bold',
                              fontSize: '0.65rem',
                              backgroundColor: '#10b981',
                              color: 'white',
                              minWidth: '45px'
                            }}
                          />
                        </>
                      )}
                    </Box>
                    {/* Labels para las ventanas */}
                    <Box sx={{ display: 'flex', gap: 0.5, fontSize: '0.6rem', opacity: 0.8, color: 'white' }}>
                      <span>10s</span>
                      {typeof p.dps === 'object' && (
                        <>
                          <span>30s</span>
                          <span>60s</span>
                        </>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                {/* Nueva columna de análisis avanzado */}
                <TableCell align="center" sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  px: { xs: 1, sm: 2 },
                  display: { xs: 'none', xl: 'table-cell' },
                  color: 'white',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                }}>
                  {typeof p.combatDetails === 'object' && p.combatDetails.short ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}>
                      <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                        ⚡ F:{p.combatDetails.short.fastMoveCount} C:{p.combatDetails.short.chargedMoveCount}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                        💥 TDO: {p.combatDetails.short.totalDamage}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                        🔋 Eff: {p.combatDetails.short.energyEfficiency || 0}%
                      </Typography>
                      {p.combatDetails.short.metrics?.chargedDamageRatio && (
                        <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                          🎯 C-Ratio: {Math.round(p.combatDetails.short.metrics.chargedDamageRatio * 100)}%
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                        🗡️ DPS: {typeof p.dps === 'object' ? p.dps.short : p.dps}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                        ⚔️ ATK: {p.attack}
                      </Typography>
                      {p.cp && (
                        <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                          💪 CP: {p.cp}
                        </Typography>
                      )}
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default ComparisonTable;
