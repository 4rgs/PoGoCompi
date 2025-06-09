// PokemonImage.jsx - Componente para mostrar imágenes de Pokémon con badges especiales
import React, { useState, useEffect } from 'react';
import { Box, Avatar, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components
const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 64,
  height: 64,
}));

const PokemonAvatar = styled(Avatar)(({ theme }) => ({
  width: 56,
  height: 56,
  background: 'linear-gradient(145deg, #f0f0f0, #e0e0e0)',
  border: '2px solid #ddd',
  '& img': {
    objectFit: 'contain',
    padding: '4px',
  },
}));

const SpecialBadge = styled(Chip)(({ theme, variant }) => ({
  position: 'absolute',
  top: -4,
  right: -4,
  height: 20,
  fontSize: '0.7rem',
  fontWeight: 'bold',
  zIndex: 1,
  ...(variant === 'shadow' && {
    backgroundColor: '#6a1b9a',
    color: 'white',
    '& .MuiChip-label': {
      padding: '0 6px',
    },
  }),
  ...(variant === 'mega' && {
    backgroundColor: '#ff5722',
    color: 'white',
    '& .MuiChip-label': {
      padding: '0 6px',
    },
  }),
  ...(variant === 'regional' && {
    backgroundColor: '#4caf50',
    color: 'white',
    '& .MuiChip-label': {
      padding: '0 6px',
    },
  }),
}));

const PokemonImage = ({ pokemon }) => {
  const [imageSrc, setImageSrc] = useState(pokemon.imageUrl);
  const [imageError, setImageError] = useState(false);
  const [currentFallbackIndex, setCurrentFallbackIndex] = useState(0);

  // Lista de URLs de fallback en orden de preferencia
  const fallbackUrls = [
    pokemon.imageUrl,
    pokemon.imageFallback,
    pokemon.secondary || `https://assets.pokemon.com/assets/cms2/img/pokedex/detail/${String(pokemon.id || 1).padStart(3, '0')}.png`,
    `https://via.placeholder.com/128x128/4A90E2/FFFFFF?text=${pokemon.id || '?'}`
  ].filter(Boolean); // Filtrar URLs undefined/null

  const handleImageError = () => {
    const nextIndex = currentFallbackIndex + 1;
    
    if (nextIndex < fallbackUrls.length) {
      setCurrentFallbackIndex(nextIndex);
      setImageSrc(fallbackUrls[nextIndex]);
      setImageError(false);
    } else {
      setImageError(true);
    }
  };

  // Resetear cuando cambie el pokemon
  useEffect(() => {
    setCurrentFallbackIndex(0);
    setImageSrc(fallbackUrls[0]);
    setImageError(false);
  }, [pokemon.id, pokemon.name]);

  const getBadgeVariant = () => {
    if (pokemon.isShadow) return 'shadow';
    if (pokemon.isMega) return 'mega';
    if (pokemon.isSpecialForm) return 'regional';
    return null;
  };

  const getBadgeLabel = () => {
    if (pokemon.isShadow) return 'S';
    if (pokemon.isMega) return 'M';
    if (pokemon.isSpecialForm) {
      // Extraer la forma del nombre
      const form = pokemon.form?.toLowerCase();
      if (form?.includes('alola')) return 'A';
      if (form?.includes('galar')) return 'G';
      if (form?.includes('hisui')) return 'H';
      return 'F'; // Form
    }
    return null;
  };

  const badgeVariant = getBadgeVariant();
  const badgeLabel = getBadgeLabel();

  return (
    <ImageContainer>
      <PokemonAvatar
        src={imageError ? undefined : imageSrc}
        alt={pokemon.name}
        onError={handleImageError}
      >
        {imageError && pokemon.name.charAt(0).toUpperCase()}
      </PokemonAvatar>
      
      {badgeVariant && badgeLabel && (
        <SpecialBadge
          label={badgeLabel}
          variant={badgeVariant}
          size="small"
        />
      )}
    </ImageContainer>
  );
};

export default PokemonImage;
