// Servicio para gestión de datos de Pokémon - Compatible con API y fallback local
import pogoApiService from './pogoApiService';
import { calculateDPS, calculateAllMultipliers, isSTAB } from '../utils/dpsCalculator';

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
    ivDefense = 15,
    ivStamina = 15,
    level = 30,
    defenderTypes = [],
    weather = null
  }) {
    const validation = this.validatePokemonForDPS(pokemonName, fastMoveName, chargedMoveName);

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const { pokemon, fastMove, chargedMove } = validation;

    // Calcular multiplicadores para ambos movimientos usando el nuevo sistema
    const fastMultipliers = calculateAllMultipliers({
      moveType: fastMove.type,
      pokemonTypes: pokemon.types,
      defenderTypes,
      weather,
      isMega: pokemon.isMega || false
    });

    const chargedMultipliers = calculateAllMultipliers({
      moveType: chargedMove.type,
      pokemonTypes: pokemon.types,
      defenderTypes,
      weather,
      isMega: pokemon.isMega || false
    });

    // Calcular DPS usando el sistema avanzado con fórmulas precisas
    const dpsResult = calculateDPS({
      baseAttack: pokemon.baseAttack,
      baseDefense: pokemon.baseDefense || 100,
      baseStamina: pokemon.baseStamina || 100,
      ivAttack: ivAttack,
      ivDefense: ivDefense,
      ivStamina: ivStamina,
      fastMove: fastMove,
      chargedMove: chargedMove,
      pokemonTypes: pokemon.types,
      level: level,
      isShadow: pokemon.isShadow || false,
      typeEffectiveness: {
        fast: fastMultipliers.typeEffectiveness,
        charged: chargedMultipliers.typeEffectiveness
      },
      weatherBoost: weather !== null
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
        form: pokemon.form,
        // Agregar estadísticas base
        baseAttack: pokemon.baseAttack,
        baseDefense: pokemon.baseDefense,
        baseStamina: pokemon.baseStamina
      },
      moves: {
        fast: {
          ...fastMove,
          ...fastMultipliers,
          enhanced: dpsResult.moves.fast
        },
        charged: {
          ...chargedMove,
          ...chargedMultipliers,
          enhanced: dpsResult.moves.charged
        }
      },
      // Mantener compatibilidad con código existente usando DPS corto (10s)
      dps: dpsResult.dps.short,
      // Agregar información detallada de multiplicadores
      multipliers: {
        fast: fastMultipliers,
        charged: chargedMultipliers
      },
      // CP calculado más preciso
      cp: this.estimateCP(pokemon, level, ivAttack, ivDefense, ivStamina),
      // Información adicional para análisis
      analysis: {
        effectiveness: this.analyzeEffectiveness(fastMultipliers, chargedMultipliers),
        recommendations: this.getRecommendations(dpsResult, fastMultipliers, chargedMultipliers)
      }
    };
  }

  // Estimar CP de un Pokémon (fórmula oficial de Pokémon GO)
  estimateCP(pokemon, level = 30, ivAttack = 15, ivDefense = 15, ivStamina = 15) {
    const CP_MULTIPLIER = {
      1: 0.094, 1.5: 0.1351374318, 2: 0.16639787, 2.5: 0.192650919,
      3: 0.21573247, 3.5: 0.2365726613, 4: 0.25572005, 4.5: 0.2735303812,
      5: 0.29024988, 5.5: 0.3060573775, 6: 0.3210876, 6.5: 0.3354450362,
      7: 0.34921268, 7.5: 0.3624577511, 8: 0.3752356, 8.5: 0.3875924083,
      9: 0.39956728, 9.5: 0.4111935514, 10: 0.4225000, 10.5: 0.4335117883,
      11: 0.44310755, 11.5: 0.4530599591, 12: 0.4627984, 12.5: 0.472336093,
      13: 0.48168495, 13.5: 0.4908558003, 14: 0.49985844, 14.5: 0.508701765,
      15: 0.51739395, 15.5: 0.5259425113, 16: 0.5343543, 16.5: 0.5426357375,
      17: 0.5507927, 17.5: 0.5588305862, 18: 0.5667545, 18.5: 0.5745691333,
      19: 0.5822789, 19.5: 0.5898879072, 20: 0.5974, 20.5: 0.6048236651,
      21: 0.6121573, 21.5: 0.6194041216, 22: 0.6265671, 22.5: 0.6336491432,
      23: 0.64065295, 23.5: 0.6475809666, 24: 0.65443563, 24.5: 0.6612192524,
      25: 0.6679340, 25.5: 0.6745818959, 26: 0.6811649, 26.5: 0.6876849480,
      27: 0.69414365, 27.5: 0.70054287, 28: 0.7068842, 28.5: 0.7131691091,
      29: 0.7193991, 29.5: 0.7255756136, 30: 0.7317, 30.5: 0.7347410093,
      31: 0.7377695, 31.5: 0.7407855938, 32: 0.74378943, 32.5: 0.7467812109,
      33: 0.74976104, 33.5: 0.7527290867, 34: 0.7556855, 34.5: 0.7586303683,
      35: 0.76156384, 35.5: 0.7644860647, 36: 0.76739717, 36.5: 0.7702972656,
      37: 0.7731865, 37.5: 0.7760649616, 38: 0.77893275, 38.5: 0.7817900548,
      39: 0.78463697, 39.5: 0.7874736075, 40: 0.7903, 40.5: 0.792803950613,
      41: 0.79530001, 41.5: 0.797800015390, 42: 0.8003, 42.5: 0.802799995637,
      43: 0.80529999, 43.5: 0.807799985028, 44: 0.81029999, 44.5: 0.812799974632,
      45: 0.81529999, 45.5: 0.817799964169, 46: 0.82029999, 46.5: 0.822799953580,
      47: 0.82529999, 47.5: 0.827799942998, 48: 0.83029999, 48.5: 0.832799932416,
      49: 0.83529999, 49.5: 0.837799921700, 50: 0.8399
    };

    const cpMultiplier = CP_MULTIPLIER[level] || CP_MULTIPLIER[30];
    const attack = (pokemon.baseAttack + ivAttack) * cpMultiplier;
    const defense = ((pokemon.baseDefense || 100) + ivDefense) * cpMultiplier;
    const stamina = ((pokemon.baseStamina || 100) + ivStamina) * cpMultiplier;

    // Fórmula oficial de CP: floor(Attack × sqrt(Defense) × sqrt(Stamina) × CPM² / 10)
    const cp = Math.floor(attack * Math.sqrt(defense) * Math.sqrt(stamina) * Math.pow(cpMultiplier, 2) / 10);

    return Math.max(cp, 10); // CP mínimo es 10
  }

  // Analizar efectividad de los movimientos
  analyzeEffectiveness(fastMultipliers, chargedMultipliers) {
    const analysis = {
      overall: 'neutral',
      fastMove: this.getEffectivenessLevel(fastMultipliers.totalMultiplier),
      chargedMove: this.getEffectivenessLevel(chargedMultipliers.totalMultiplier),
      bestMove: fastMultipliers.totalMultiplier >= chargedMultipliers.totalMultiplier ? 'fast' : 'charged'
    };

    // Análisis general
    const avgMultiplier = (fastMultipliers.totalMultiplier + chargedMultipliers.totalMultiplier) / 2;
    analysis.overall = this.getEffectivenessLevel(avgMultiplier);

    return analysis;
  }

  // Obtener nivel de efectividad basado en multiplicador
  getEffectivenessLevel(multiplier) {
    if (multiplier >= 2.0) return 'excellent';
    if (multiplier >= 1.5) return 'very_good';
    if (multiplier >= 1.2) return 'good';
    if (multiplier >= 1.0) return 'neutral';
    if (multiplier >= 0.8) return 'poor';
    return 'very_poor';
  }

  // Generar recomendaciones basadas en el análisis
  getRecommendations(dpsResult, fastMultipliers, chargedMultipliers) {
    const recommendations = [];

    // Recomendación de ventana de tiempo
    const { short, medium, long } = dpsResult.dps;
    if (long > medium && medium > short) {
      recommendations.push({
        type: 'strategy',
        message: 'Ideal para combates largos - el DPS mejora con el tiempo',
        priority: 'high'
      });
    } else if (short > medium) {
      recommendations.push({
        type: 'strategy',
        message: 'Excelente para raids rápidos y gimnasios',
        priority: 'high'
      });
    }

    // Recomendación de STAB
    if (!fastMultipliers.stab) {
      recommendations.push({
        type: 'moveset',
        message: 'Considera un movimiento rápido del mismo tipo para +20% daño',
        priority: 'medium'
      });
    }

    if (!chargedMultipliers.stab) {
      recommendations.push({
        type: 'moveset',
        message: 'Considera un movimiento cargado del mismo tipo para +20% daño',
        priority: 'medium'
      });
    }

    // Recomendación de clima
    if (!fastMultipliers.weatherBonus && !chargedMultipliers.weatherBonus) {
      recommendations.push({
        type: 'usage',
        message: 'Úsalo con clima favorable para +20% daño adicional',
        priority: 'low'
      });
    }

    // Recomendación de Shadow
    if (!dpsResult.appliedBonuses.shadow && dpsResult.pokemon?.name) {
      recommendations.push({
        type: 'variant',
        message: 'La versión Shadow tendría +20% ataque pero -16.67% defensa',
        priority: 'medium'
      });
    }

    return recommendations;
  }
}

// Crear instancia singleton
const pokemonDataService = new PokemonDataService();

export default pokemonDataService;
