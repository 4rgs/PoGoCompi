import React from 'react';
import { 
  LocalFireDepartment as FireIcon,
  Water as WaterIcon,
  Grass as GrassIcon,
  Bolt as ElectricIcon,
  Psychology as PsychicIcon,
  Pets as NormalIcon,
  BugReport as BugIcon,
  AcUnit as IceIcon,
  FitnessCenter as FightingIcon,
  Coronavirus as PoisonIcon,
  Terrain as GroundIcon,
  FlightTakeoff as FlyingIcon,
  AutoFixHigh as FairyIcon,
  Visibility as GhostIcon,
  Landscape as RockIcon,
  Build as SteelIcon,
  WbSunny as DragonIcon,
  Nightlight as DarkIcon
} from '@mui/icons-material';

const TYPE_ICON_MAP = {
  Fire: FireIcon,
  Water: WaterIcon,
  Grass: GrassIcon,
  Electric: ElectricIcon,
  Psychic: PsychicIcon,
  Normal: NormalIcon,
  Bug: BugIcon,
  Ice: IceIcon,
  Fighting: FightingIcon,
  Poison: PoisonIcon,
  Ground: GroundIcon,
  Flying: FlyingIcon,
  Fairy: FairyIcon,
  Ghost: GhostIcon,
  Rock: RockIcon,
  Steel: SteelIcon,
  Dragon: DragonIcon,
  Dark: DarkIcon
};

// Colores de fondo para badges de movimientos
export const TYPE_COLORS = {
  Fire: '#FF6D6D',
  Water: '#6DB7FF',
  Grass: '#78C850',
  Electric: '#F8D030',
  Psychic: '#F85888',
  Normal: '#A8A878',
  Bug: '#A8B820',
  Ice: '#98D8D8',
  Fighting: '#C03028',
  Poison: '#A040A0',
  Ground: '#E0C068',
  Flying: '#A890F0',
  Fairy: '#EE99AC',
  Ghost: '#705898',
  Rock: '#B8A038',
  Steel: '#B8B8D0',
  Dragon: '#7038F8',
  Dark: '#705848'
};

// Función para obtener el color de un tipo
export function getTypeColor(type) {
  return TYPE_COLORS[type] || TYPE_COLORS.Normal;
}

// Función para obtener el estilo completo del badge de tipo
export function getTypeBadgeStyle(type, size = 'medium') {
  const color = getTypeColor(type);
  const sizes = {
    small: { fontSize: '0.7rem', padding: '2px 6px', iconSize: '0.8rem' },
    medium: { fontSize: '0.75rem', padding: '4px 8px', iconSize: '1rem' },
    large: { fontSize: '0.85rem', padding: '6px 12px', iconSize: '1.2rem' }
  };
  
  const sizeStyle = sizes[size] || sizes.medium;
  
  return {
    backgroundColor: color,
    color: 'white',
    borderRadius: '12px',
    fontWeight: 'bold',
    textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    ...sizeStyle
  };
}

function TypeIcon({ type, sx = {}, ...props }) {
  const IconComponent = TYPE_ICON_MAP[type] || NormalIcon;
  
  return (
    <IconComponent 
      sx={{
        fontSize: '1rem',
        ...sx
      }}
      {...props}
    />
  );
}

export default TypeIcon;
