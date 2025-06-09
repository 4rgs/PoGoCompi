import { Box, Typography, Chip } from '@mui/material';
import TypeIcon, { getTypeBadgeStyle } from './TypeIcon';

function MoveBadge({ move, isChargedMove = false, showDetails = true, size = 'medium' }) {
  if (!move) return null;

  const badgeStyle = getTypeBadgeStyle(move.type, size);
  const isMobile = size === 'small';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
      {/* Nombre del movimiento con icono de tipo */}
      <Box sx={{
        ...badgeStyle,
        minWidth: 'fit-content',
        textAlign: 'center'
      }}>
        <TypeIcon 
          type={move.type}
          sx={{ fontSize: badgeStyle.iconSize, mr: 0.5 }}
        />
        <Typography variant="caption" sx={{ 
          fontSize: badgeStyle.fontSize, 
          fontWeight: 'bold',
          color: 'inherit'
        }}>
          {move.name}
        </Typography>
      </Box>

      {/* Detalles del movimiento */}
      {showDetails && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          gap: isMobile ? 0.2 : 0.5,
          fontSize: '0.65rem'
        }}>
          <Typography variant="caption" sx={{ 
            fontSize: isMobile ? '0.6rem' : '0.65rem',
            color: 'rgba(255,255,255,0.9)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
          }}>
            💥{move.power}
          </Typography>
          <Typography variant="caption" sx={{ 
            fontSize: isMobile ? '0.6rem' : '0.65rem',
            color: 'rgba(255,255,255,0.9)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
          }}>
            ⏱️{move.cooldown}s
          </Typography>
          <Typography variant="caption" sx={{ 
            fontSize: isMobile ? '0.6rem' : '0.65rem',
            color: 'rgba(255,255,255,0.9)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
          }}>
            {isChargedMove ? `🔋${move.energy}` : `🔋+${move.energy}`}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default MoveBadge;
