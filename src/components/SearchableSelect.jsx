import { useState, useEffect, useRef, useMemo } from 'react';
import {
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  InputAdornment,
  CircularProgress,
  Chip
} from '@mui/material';
import { Search as SearchIcon, CatchingPokemon as PokemonIcon, Clear as ClearIcon } from '@mui/icons-material';
import { getTypeColor } from '../utils/typeColors';

function SearchableSelect({
  options = [],
  value = '',
  onChange,
  label = 'Seleccionar...',
  placeholder = 'Buscar...',
  disabled = false,
  loading = false,
  displayProperty = 'name',
  idProperty = 'id',
  maxHeight = 300,
  showAvatar = false,
  avatarProperty = 'imageUrl',
  typesProperty = 'types',
  required = false,
  maxDisplayItems = 50, // Nuevo: límite de elementos mostrados
  minSearchLength = 2   // Nuevo: mínimo de caracteres para mostrar opciones
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const containerRef = useRef(null);

  // Filtrado optimizado con useMemo
  const filteredOptions = useMemo(() => {
    // Si no hay término de búsqueda y la lista es muy grande, no mostrar nada
    if (!searchTerm.trim()) {
      return options.length > 100 ? [] : options.slice(0, maxDisplayItems);
    }

    // Si el término es muy corto, no filtrar (evita mostrar demasiados resultados)
    if (searchTerm.length < minSearchLength) {
      return [];
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = options.filter(option => {
      const displayValue = option[displayProperty] || '';
      return displayValue.toLowerCase().includes(searchLower);
    });

    // Limitar resultados para performance
    return filtered.slice(0, maxDisplayItems);
  }, [searchTerm, options, displayProperty, maxDisplayItems, minSearchLength]);

  // Resetear índice destacado cuando cambien las opciones filtradas
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredOptions]);

  // Obtener el objeto seleccionado actual
  const selectedOption = options.find(option => option[displayProperty] === value);

  // Manejar click fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar navegación con teclado
  const handleKeyDown = (event) => {
    if (!isOpen) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        inputRef.current?.blur();
        break;
    }
  };

  // Scroll automático al elemento destacado (optimizado)
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'auto' // Cambiar a 'auto' para mejor performance
        });
      }
    }
  }, [highlightedIndex]);

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setSearchTerm(newValue);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleSelect = (option) => {
    const newValue = option[displayProperty];
    onChange(newValue);
    setIsOpen(false);
    setSearchTerm('');
    inputRef.current?.blur();
  };

  const handleClear = (event) => {
    event.stopPropagation();
    onChange('');
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const displayValue = isOpen ? searchTerm : (selectedOption ? selectedOption[displayProperty] : '');

  // Función para renderizar mensaje de ayuda
  const renderHelpMessage = () => {
    if (loading) return 'Cargando...';
    if (!searchTerm) {
      return options.length > 100
        ? `Escribe al menos ${minSearchLength} caracteres para buscar entre ${options.length} opciones`
        : 'No hay opciones disponibles';
    }
    if (searchTerm.length < minSearchLength) {
      return `Escribe al menos ${minSearchLength} caracteres para ver resultados`;
    }
    return 'No se encontraron resultados';
  };

  return (
    <Box ref={containerRef} sx={{ position: 'relative', width: '100%' }}>
      <TextField
        ref={inputRef}
        fullWidth
        label={label}
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={isOpen ? placeholder : ''}
        disabled={disabled}
        required={required}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {loading ? (
                <CircularProgress size={20} />
              ) : (
                <SearchIcon color={disabled ? 'disabled' : 'action'} />
              )}
            </InputAdornment>
          ),
          endAdornment: selectedOption && !disabled && (
            <InputAdornment position="end">
              <Box
                component="span"
                onClick={handleClear}
                sx={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'action.active',
                  '&:hover': {
                    color: 'error.main'
                  }
                }}
              >
                <ClearIcon size="small" />
              </Box>
            </InputAdornment>
          ),
          sx: {
            cursor: disabled ? 'not-allowed' : 'text'
          }
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: isOpen ? 'primary.main' : undefined,
            }
          }
        }}
      />

      {/* Dropdown List */}
      {isOpen && !disabled && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1300,
            maxHeight: maxHeight,
            overflow: 'hidden',
            mt: 1,
            border: '1px solid',
            borderColor: 'divider',
            background: 'background.paper'
          }}
        >
          {filteredOptions.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="text.secondary" variant="body2">
                {renderHelpMessage()}
              </Typography>
              {options.length > 100 && !searchTerm && (
                <Typography color="text.secondary" variant="caption" sx={{ mt: 1, display: 'block' }}>
                  💡 Tip: Usa la búsqueda para encontrar Pokémon específicos
                </Typography>
              )}
            </Box>
          ) : (
            <>
              {filteredOptions.length === maxDisplayItems && (
                <Box sx={{ p: 1, bgcolor: 'action.hover', textAlign: 'center' }}>
                  <Typography color="text.secondary" variant="caption">
                    Mostrando los primeros {maxDisplayItems} resultados. Refina tu búsqueda para ver más específicos.
                  </Typography>
                </Box>
              )}
              <List
                ref={listRef}
                dense
                sx={{
                  maxHeight: maxHeight - (filteredOptions.length === maxDisplayItems ? 48 : 16),
                  overflow: 'auto',
                  py: 0
                }}
              >
                {filteredOptions.map((option, index) => {
                  const isHighlighted = index === highlightedIndex;
                  const isSelected = option[displayProperty] === value;
                  const displayText = option[displayProperty] || '';
                  const types = option[typesProperty] || [];

                  return (
                    <ListItem
                      key={option[idProperty] || `${option[displayProperty]}-${index}`}
                      onClick={() => handleSelect(option)}
                      sx={{
                        cursor: 'pointer',
                        backgroundColor: isHighlighted
                          ? 'action.hover'
                          : isSelected
                            ? 'action.selected'
                            : 'transparent',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        },
                        borderLeft: isSelected ? 3 : 0,
                        borderLeftColor: 'primary.main',
                        transition: 'background-color 0.1s ease', // Reducir tiempo de transición
                        minHeight: 48 // Altura fija para mejor performance
                      }}
                    >
                      {showAvatar && (
                        <ListItemAvatar>
                          <Avatar
                            src={option[avatarProperty]}
                            sx={{
                              width: 32, // Reducir tamaño para mejor performance
                              height: 32,
                              bgcolor: 'primary.main'
                            }}
                          >
                            <PokemonIcon sx={{ fontSize: 20 }} />
                          </Avatar>
                        </ListItemAvatar>
                      )}
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" component="span" noWrap>
                              {displayText}
                            </Typography>
                            {types.length > 0 && (
                              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                                {types.slice(0, 2).map((type, typeIndex) => (
                                  <Chip
                                    key={`${option[idProperty] || option[displayProperty]}-${type}-${typeIndex}`}
                                    label={type}
                                    size="small"
                                    sx={{
                                      fontSize: '0.65rem',
                                      height: 18,
                                      backgroundColor: getTypeColor(type),
                                      color: 'white',
                                      fontWeight: 500,
                                      minWidth: 'auto'
                                    }}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        }
                        primaryTypographyProps={{
                          variant: 'body2',
                          component: 'div', // Cambiar de 'p' a 'div' para evitar nesting issues
                          sx: {
                            fontWeight: isSelected ? 600 : 400,
                            color: isSelected ? 'primary.main' : 'text.primary'
                          }
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </>
          )}
        </Paper>
      )}
    </Box>
  );
}

export default SearchableSelect;
