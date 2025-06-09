// Colores para tipos de Pokémon basados en la paleta oficial
export const TYPE_COLORS = {
  Normal: '#A8A878',
  Fire: '#F08030',
  Water: '#6890F0',
  Electric: '#F8D030',
  Grass: '#78C850',
  Ice: '#98D8D8',
  Fighting: '#C03028',
  Poison: '#A040A0',
  Ground: '#E0C068',
  Flying: '#A890F0',
  Psychic: '#F85888',
  Bug: '#A8B820',
  Rock: '#B8A038',
  Ghost: '#705898',
  Dragon: '#7038F8',
  Dark: '#705848',
  Steel: '#B8B8D0',
  Fairy: '#EE99AC'
};

// Función para obtener el color de un tipo
export function getTypeColor(typeName) {
  return TYPE_COLORS[typeName] || '#68A090'; // Color por defecto si no se encuentra
}

// Función para crear un gradiente entre dos tipos
export function createTypeGradient(types) {
  if (!types || types.length === 0) {
    return '#68A090'; // Color por defecto
  }
  
  if (types.length === 1) {
    return getTypeColor(types[0]);
  }
  
  // Para dos tipos, crear un gradiente
  const color1 = getTypeColor(types[0]);
  const color2 = getTypeColor(types[1]);
  
  return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
}

// Función para crear un gradiente CSS para fondos
export function getTypeBackground(types) {
  if (!types || types.length === 0) {
    return { backgroundColor: '#68A090' };
  }
  
  if (types.length === 1) {
    return { backgroundColor: getTypeColor(types[0]) };
  }
  
  // Para dos tipos, usar gradiente
  const color1 = getTypeColor(types[0]);
  const color2 = getTypeColor(types[1]);
  
  return {
    background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`
  };
}

// Función para obtener un color sólido mezclado de los tipos (para Chart.js)
export function getBlendedTypeColor(types) {
  if (!types || types.length === 0) {
    return '#68A090';
  }
  
  if (types.length === 1) {
    return getTypeColor(types[0]);
  }
  
  // Para dos tipos, mezclar los colores
  const color1 = hexToRgb(getTypeColor(types[0]));
  const color2 = hexToRgb(getTypeColor(types[1]));
  
  if (!color1 || !color2) {
    return getTypeColor(types[0]);
  }
  
  // Mezclar colores (promedio)
  const blended = {
    r: Math.round((color1.r + color2.r) / 2),
    g: Math.round((color1.g + color2.g) / 2),
    b: Math.round((color1.b + color2.b) / 2)
  };
  
  return `rgb(${blended.r}, ${blended.g}, ${blended.b})`;
}

// Función auxiliar para convertir hex a RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Función para obtener colores con transparencia
export function getTypeColorWithAlpha(types, alpha = 0.8) {
  const color = getBlendedTypeColor(types);
  
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', `rgba(`).replace(')', `, ${alpha})`);
  }
  
  // Si es hex, convertir a rgba
  const rgb = hexToRgb(color);
  if (rgb) {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }
  
  return color;
}
