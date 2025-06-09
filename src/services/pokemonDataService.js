// Servicio para gestión de datos de Pokémon - Compatible con API y fallback local
import pogoApiService from './pogoApiService';
import { calculateDPS } from '../utils/dpsCalculator';

class PokemonDataService {
  constructor() {
    this.pokemonData = [];
    this.dataSource = 'none'; // 'api', 'local', 'none'
  }

  // Inicializar datos (primero intenta API, luego fallback local)
  async initializeData() {
    try {
      console.log('Intentando cargar datos desde PoGoAPI...');
      this.pokemonData = await pogoApiService.getPokemonDataForApp();
      this.dataSource = 'api';
      console.log(`Datos cargados desde API: ${this.pokemonData.length} Pokémon`);
      return { success: true, source: 'api', count: this.pokemonData.length };
    } catch (error) {
      console.warn('Error cargando desde API, intentando datos locales...', error);
      
    }
  }

  // Obtener todos los Pokémon
  getAllPokemon() {
    return this.pokemonData;
  }

  // Buscar Pokémon por nombre
  findPokemonByName(name) {
    return this.pokemonData.find(p => p.name === name);
  }

  // Buscar movimiento rápido por nombre en un Pokémon específico
  findFastMove(pokemon, moveName) {
    if (!pokemon || !pokemon.fastMoves) return null;
    return pokemon.fastMoves.find(m => m.name === moveName);
  }

  // Buscar movimiento cargado por nombre en un Pokémon específico
  findChargedMove(pokemon, moveName) {
    if (!pokemon || !pokemon.chargedMoves) return null;
    return pokemon.chargedMoves.find(m => m.name === moveName);
  }

  // Verificar si un tipo es STAB para un Pokémon
  isSTAB(pokemon, moveType) {
    if (!pokemon || !pokemon.types || !moveType) return false;
    return pokemon.types.includes(moveType);
  }

  // Obtener información del estado actual de los datos
  getDataInfo() {
    return {
      source: this.dataSource,
      count: this.pokemonData.length,
      isLoaded: this.pokemonData.length > 0,
      lastUpdate: new Date().toISOString()
    };
  }

  // Refrescar datos (limpiar cache de API y recargar)
  async refreshData() {
    if (this.dataSource === 'api') {
      pogoApiService.clearCache();
    }
    return await this.initializeData();
  }

  // Verificar si los datos están cargados
  isDataLoaded() {
    return this.pokemonData.length > 0;
  }

  // Validar que un Pokémon tiene los datos necesarios para el cálculo de DPS
  validatePokemonForDPS(pokemonName, fastMoveName, chargedMoveName) {
    const pokemon = this.findPokemonByName(pokemonName);
    if (!pokemon) {
      return { valid: false, error: 'Pokémon no encontrado' };
    }

    if (!pokemon.baseAttack) {
      return { valid: false, error: 'Datos de ataque base no disponibles' };
    }

    const fastMove = this.findFastMove(pokemon, fastMoveName);
    if (!fastMove) {
      return { valid: false, error: 'Movimiento rápido no encontrado' };
    }

    const chargedMove = this.findChargedMove(pokemon, chargedMoveName);
    if (!chargedMove) {
      return { valid: false, error: 'Movimiento cargado no encontrado' };
    }

    return { 
      valid: true, 
      pokemon, 
      fastMove, 
      chargedMove,
      fastStab: this.isSTAB(pokemon, fastMove.type),
      chargedStab: this.isSTAB(pokemon, chargedMove.type)
    };
  }

  // Calcular DPS excepcional para un Pokémon con movimientos específicos
  calculatePokemonDPS({
    pokemonName,
    fastMoveName,
    chargedMoveName,
    ivAttack = 15,
    level = 30
  }) {
    const validation = this.validatePokemonForDPS(pokemonName, fastMoveName, chargedMoveName);
    
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const { pokemon, fastMove, chargedMove, fastStab, chargedStab } = validation;

    // Calcular DPS usando el sistema avanzado de múltiples ventanas
    const dpsResult = calculateDPS({
      baseAttack: pokemon.baseAttack,
      ivAttack: ivAttack,
      fastMove: fastMove,
      chargedMove: chargedMove,
      fastStab: fastStab,
      chargedStab: chargedStab,
      level: level,
      isShadow: pokemon.isShadow || false,
      shadowBonus: pokemon.shadowBonus || null
    });

    return {
      ...dpsResult,
      pokemon: {
        name: pokemon.name,
        types: pokemon.types,
        isSpecialForm: pokemon.isSpecialForm,
        isShadow: pokemon.isShadow,
        isMega: pokemon.isMega,
        imageUrl: pokemon.imageUrl,
        imageFallback: pokemon.imageFallback,
        id: pokemon.id,
        form: pokemon.form
      },
      moves: {
        fast: { ...fastMove, stab: fastStab },
        charged: { ...chargedMove, stab: chargedStab }
      },
      // Mantener compatibilidad con código existente usando DPS corto (10s)
      dps: dpsResult.dps.short,
      // Agregar CP estimado para display
      cp: this.estimateCP(pokemon, level, ivAttack)
    };
  }

  // Estimar CP de un Pokémon (fórmula simplificada)
  estimateCP(pokemon, level = 30, ivAttack = 15, ivDefense = 15, ivStamina = 15) {
    const CP_MULTIPLIER = {
      20: 0.5974, 25: 0.6675, 30: 0.7317, 35: 0.7903, 40: 0.8414, 45: 0.8840, 50: 0.9194
    };
    
    const cpMultiplier = CP_MULTIPLIER[level] || CP_MULTIPLIER[30];
    const attack = (pokemon.baseAttack + ivAttack) * cpMultiplier;
    const defense = (pokemon.baseDefense + ivDefense) * cpMultiplier;
    const stamina = (pokemon.baseStamina + ivStamina) * cpMultiplier;
    
    // Fórmula simplificada de CP
    const cp = Math.floor(attack * Math.sqrt(defense) * Math.sqrt(stamina) / 10);
    
    return Math.max(cp, 10); // CP mínimo es 10
  }
}

// Crear instancia singleton
const pokemonDataService = new PokemonDataService();

export default pokemonDataService;
