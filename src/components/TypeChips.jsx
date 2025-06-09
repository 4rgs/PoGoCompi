import { Box, Chip } from '@mui/material';
import { getTypeColor } from '../utils/typeColors';

function TypeChips({ types, size = 'small', variant = 'filled' }) {
  if (!types || types.length === 0) {
    return (
      <Chip
        label="Normal"
        size={size}
        variant={variant}
        sx={{
          backgroundColor: getTypeColor('Normal'),
          color: 'white',
          fontWeight: 'bold',
          fontSize: size === 'small' ? '0.7rem' : '0.8rem',
          textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
          minWidth: size === 'small' ? '40px' : '50px'
        }}
      />
    );
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        gap: 0.5, 
        justifyContent: 'center', 
        flexWrap: 'wrap',
        alignItems: 'center'
      }}
    >
      {types.map((type, index) => (
        <Chip
          key={index}
          label={type}
          size={size}
          variant={variant}
          sx={{
            backgroundColor: getTypeColor(type),
            color: 'white',
            fontWeight: 'bold',
            fontSize: size === 'small' ? '0.7rem' : '0.8rem',
            textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
            minWidth: size === 'small' ? '40px' : '50px',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }
          }}
        />
      ))}
      {types.length === 2 && (
        <Box
          sx={{
            fontSize: '0.6rem',
            color: 'text.secondary',
            fontStyle: 'italic',
            ml: 0.5
          }}
        >
          🌈
        </Box>
      )}
    </Box>
  );
}

export default TypeChips;
