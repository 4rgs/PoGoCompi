// Datos de tipos de Pokémon conocidos como fallback
export const POKEMON_TYPES_FALLBACK = {
  // Generación 1
  1: ['Grass', 'Poison'],      // Bulbasaur
  2: ['Grass', 'Poison'],      // Ivysaur
  3: ['Grass', 'Poison'],      // Venusaur
  4: ['Fire'],                 // Charmander
  5: ['Fire'],                 // Charmeleon
  6: ['Fire', 'Flying'],       // Charizard
  7: ['Water'],                // Squirtle
  8: ['Water'],                // Wartortle
  9: ['Water'],                // Blastoise
  10: ['Bug'],                 // Caterpie
  11: ['Bug'],                 // Metapod
  12: ['Bug', 'Flying'],       // Butterfree
  13: ['Bug', 'Poison'],       // Weedle
  14: ['Bug', 'Poison'],       // Kakuna
  15: ['Bug', 'Poison'],       // Beedrill
  16: ['Normal', 'Flying'],    // Pidgey
  17: ['Normal', 'Flying'],    // Pidgeotto
  18: ['Normal', 'Flying'],    // Pidgeot
  19: ['Normal'],              // Rattata
  20: ['Normal'],              // Raticate
  21: ['Normal', 'Flying'],    // Spearow
  22: ['Normal', 'Flying'],    // Fearow
  23: ['Poison'],              // Ekans
  24: ['Poison'],              // Arbok
  25: ['Electric'],            // Pikachu
  26: ['Electric'],            // Raichu
  27: ['Ground'],              // Sandshrew
  28: ['Ground'],              // Sandslash
  29: ['Poison'],              // Nidoran♀
  30: ['Poison'],              // Nidorina
  31: ['Poison', 'Ground'],    // Nidoqueen
  32: ['Poison'],              // Nidoran♂
  33: ['Poison'],              // Nidorino
  34: ['Poison', 'Ground'],    // Nidoking
  35: ['Fairy'],               // Clefairy
  36: ['Fairy'],               // Clefable
  37: ['Fire'],                // Vulpix
  38: ['Fire'],                // Ninetales
  39: ['Normal', 'Fairy'],     // Jigglypuff
  40: ['Normal', 'Fairy'],     // Wigglytuff
  41: ['Poison', 'Flying'],    // Zubat
  42: ['Poison', 'Flying'],    // Golbat
  43: ['Grass', 'Poison'],     // Oddish
  44: ['Grass', 'Poison'],     // Gloom
  45: ['Grass', 'Poison'],     // Vileplume
  46: ['Bug', 'Grass'],        // Paras
  47: ['Bug', 'Grass'],        // Parasect
  48: ['Bug', 'Poison'],       // Venonat
  49: ['Bug', 'Poison'],       // Venomoth
  50: ['Ground'],              // Diglett
  51: ['Ground'],              // Dugtrio
  52: ['Normal'],              // Meowth
  53: ['Normal'],              // Persian
  54: ['Water'],               // Psyduck
  55: ['Water'],               // Golduck
  56: ['Fighting'],            // Mankey
  57: ['Fighting'],            // Primeape
  58: ['Fire'],                // Growlithe
  59: ['Fire'],                // Arcanine
  60: ['Water'],               // Poliwag
  61: ['Water'],               // Poliwhirl
  62: ['Water', 'Fighting'],   // Poliwrath
  63: ['Psychic'],             // Abra
  64: ['Psychic'],             // Kadabra
  65: ['Psychic'],             // Alakazam
  66: ['Fighting'],            // Machop
  67: ['Fighting'],            // Machoke
  68: ['Fighting'],            // Machamp
  69: ['Grass', 'Poison'],     // Bellsprout
  70: ['Grass', 'Poison'],     // Weepinbell
  71: ['Grass', 'Poison'],     // Victreebel
  72: ['Water', 'Poison'],     // Tentacool
  73: ['Water', 'Poison'],     // Tentacruel
  74: ['Rock', 'Ground'],      // Geodude
  75: ['Rock', 'Ground'],      // Graveler
  76: ['Rock', 'Ground'],      // Golem
  77: ['Fire'],                // Ponyta
  78: ['Fire'],                // Rapidash
  79: ['Water', 'Psychic'],    // Slowpoke
  80: ['Water', 'Psychic'],    // Slowbro
  81: ['Electric', 'Steel'],   // Magnemite
  82: ['Electric', 'Steel'],   // Magneton
  83: ['Normal', 'Flying'],    // Farfetch'd
  84: ['Normal', 'Flying'],    // Doduo
  85: ['Normal', 'Flying'],    // Dodrio
  86: ['Water'],               // Seel
  87: ['Water', 'Ice'],        // Dewgong
  88: ['Poison'],              // Grimer
  89: ['Poison'],              // Muk
  90: ['Water'],               // Shellder
  91: ['Water', 'Ice'],        // Cloyster
  92: ['Ghost', 'Poison'],     // Gastly
  93: ['Ghost', 'Poison'],     // Haunter
  94: ['Ghost', 'Poison'],     // Gengar
  95: ['Rock', 'Ground'],      // Onix
  96: ['Psychic'],             // Drowzee
  97: ['Psychic'],             // Hypno
  98: ['Water'],               // Krabby
  99: ['Water'],               // Kingler
  100: ['Electric'],           // Voltorb
  101: ['Electric'],           // Electrode
  102: ['Grass', 'Psychic'],   // Exeggcute
  103: ['Grass', 'Psychic'],   // Exeggutor
  104: ['Ground'],             // Cubone
  105: ['Ground'],             // Marowak
  106: ['Fighting'],           // Hitmonlee
  107: ['Fighting'],           // Hitmonchan
  108: ['Normal'],             // Lickitung
  109: ['Poison'],             // Koffing
  110: ['Poison'],             // Weezing
  111: ['Ground', 'Rock'],     // Rhyhorn
  112: ['Ground', 'Rock'],     // Rhydon
  113: ['Normal'],             // Chansey
  114: ['Grass'],              // Tangela
  115: ['Normal'],             // Kangaskhan
  116: ['Water'],              // Horsea
  117: ['Water'],              // Seadra
  118: ['Water'],              // Goldeen
  119: ['Water'],              // Seaking
  120: ['Water'],              // Staryu
  121: ['Water', 'Psychic'],   // Starmie
  122: ['Psychic', 'Fairy'],   // Mr. Mime
  123: ['Bug', 'Flying'],      // Scyther
  124: ['Ice', 'Psychic'],     // Jynx
  125: ['Electric'],           // Electabuzz
  126: ['Fire'],               // Magmar
  127: ['Bug'],                // Pinsir
  128: ['Normal'],             // Tauros
  129: ['Water'],              // Magikarp
  130: ['Water', 'Flying'],    // Gyarados
  131: ['Water', 'Ice'],       // Lapras
  132: ['Normal'],             // Ditto
  133: ['Normal'],             // Eevee
  134: ['Water'],              // Vaporeon
  135: ['Electric'],           // Jolteon
  136: ['Fire'],               // Flareon
  137: ['Normal'],             // Porygon
  138: ['Rock', 'Water'],      // Omanyte
  139: ['Rock', 'Water'],      // Omastar
  140: ['Rock', 'Water'],      // Kabuto
  141: ['Rock', 'Water'],      // Kabutops
  142: ['Rock', 'Flying'],     // Aerodactyl
  143: ['Normal'],             // Snorlax
  144: ['Ice', 'Flying'],      // Articuno
  145: ['Electric', 'Flying'], // Zapdos
  146: ['Fire', 'Flying'],     // Moltres
  147: ['Dragon'],             // Dratini
  148: ['Dragon'],             // Dragonair
  149: ['Dragon', 'Flying'],   // Dragonite
  150: ['Psychic'],            // Mewtwo
  151: ['Psychic'],            // Mew
  
  // Legendarios importantes de otras generaciones
  243: ['Electric'],           // Raikou
  244: ['Fire'],               // Entei
  245: ['Water'],              // Suicune
  249: ['Psychic', 'Flying'],  // Lugia
  250: ['Fire', 'Flying'],     // Ho-Oh
  251: ['Psychic', 'Grass'],   // Celebi
  377: ['Rock'],               // Regirock
  378: ['Ice'],                // Regice
  379: ['Steel'],              // Registeel
  380: ['Dragon', 'Psychic'],  // Latias
  381: ['Dragon', 'Psychic'],  // Latios
  382: ['Water'],              // Kyogre
  383: ['Ground'],             // Groudon
  384: ['Dragon', 'Flying'],   // Rayquaza
  386: ['Psychic'],            // Deoxys
  480: ['Psychic'],            // Uxie
  481: ['Psychic'],            // Mesprit
  482: ['Psychic'],            // Azelf
  483: ['Steel', 'Dragon'],    // Dialga
  484: ['Water', 'Dragon'],    // Palkia
  485: ['Fire', 'Steel'],      // Heatran
  486: ['Normal'],             // Regigigas
  487: ['Ghost', 'Dragon'],    // Giratina
  488: ['Psychic'],            // Cresselia
  489: ['Water'],              // Phione
  490: ['Water'],              // Manaphy
  491: ['Dark'],               // Darkrai
  492: ['Grass'],              // Shaymin
  493: ['Normal'],             // Arceus
};

// Función para obtener tipos con fallback
export function getPokemonTypesWithFallback(pokemonId, apiTypes) {
  // Si tenemos tipos de la API y no están vacíos, usarlos
  if (apiTypes && Array.isArray(apiTypes) && apiTypes.length > 0) {
    return apiTypes;
  }
  
  // Si no, usar fallback
  const fallbackTypes = POKEMON_TYPES_FALLBACK[pokemonId];
  if (fallbackTypes) {
    return fallbackTypes;
  }
  
  // Último recurso: Normal
  return ['Normal'];
}
