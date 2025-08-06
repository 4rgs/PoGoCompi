// src/utils/dpsCalculator.js - Calculador de DPS con fórmulas precisas de Pokémon GO

// Multiplicadores de CP (Combat Power Multiplier) por nivel - Datos oficiales de Pokémon GO
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

// Ventanas de tiempo para análisis completo de DPS
const TIME_WINDOWS = {
  SHORT: 10,    // Combate corto - raids, gimnasios
  MEDIUM: 30,   // Combate medio - Liga GO Battle
  LONG: 60      // Combate largo - análisis completo
};

// Constantes oficiales de Pokémon GO
const MAX_ENERGY = 100;
const DAMAGE_WINDOW_OFFSET = 0.5; // Offset típico de ventana de daño
const STAB_MULTIPLIER = 1.2; // Same Type Attack Bonus
const SHADOW_ATTACK_BONUS = 1.2; // Shadow Pokémon +20% ataque
const SHADOW_DEFENSE_PENALTY = 0.833; // Shadow Pokémon -16.67% defensa

// Multiplicadores de efectividad de tipo
const TYPE_EFFECTIVENESS = {
  SUPER_EFFECTIVE: 1.6,
  NOT_VERY_EFFECTIVE: 0.625,
  NO_EFFECT: 0.39,
  NORMAL: 1.0
};

// Multiplicadores de clima (Weather Boost)
const WEATHER_BOOST = 1.2;

/**
 * Calcula el daño según la fórmula oficial de Pokémon GO
 * Fórmula: floor(0.5 × Power × (Attack/Defense) × Multiplicadores) + 1
 * @param {Object} params - Parámetros del cálculo de daño
 * @param {number} params.movePower - Poder del movimiento
 * @param {number} params.attackerAttack - Estadística de ataque del atacante
 * @param {number} params.defenderDefense - Estadística de defensa del defensor (default: 100)
 * @param {Array} params.multipliers - Array de multiplicadores a aplicar
 * @returns {number} Daño calculado
 */
function calculatePokemonGODamage({
  movePower,
  attackerAttack,
  defenderDefense = 100, // Defensa estándar para comparaciones
  multipliers = []
}) {
  // Aplicar todos los multiplicadores
  const totalMultiplier = multipliers.reduce((acc, mult) => acc * mult, 1.0);

  // Fórmula oficial de Pokémon GO
  const baseDamage = 0.5 * movePower * (attackerAttack / defenderDefense) * totalMultiplier;

  // Redondear hacia abajo (floor) y agregar +1
  return Math.floor(baseDamage) + 1;
}

/**
 * Calcula las estadísticas reales de un Pokémon según nivel e IVs
 * Fórmula: (BaseStat + IV) × CPM
 * @param {Object} params - Parámetros del cálculo
 * @param {number} params.baseStat - Estadística base del Pokémon
 * @param {number} params.iv - Individual Value (0-15)
 * @param {number} params.level - Nivel del Pokémon (1-50)
 * @returns {number} Estadística real calculada
 */
function calculateRealStat({ baseStat, iv, level }) {
  const cpMultiplier = CP_MULTIPLIER[level] || CP_MULTIPLIER[40];
  return (baseStat + iv) * cpMultiplier;
}

/**
 * Calcula el DPS avanzado usando las fórmulas precisas de Pokémon GO
 * @param {Object} params - Parámetros del cálculo
 * @param {number} params.baseAttack - Ataque base del Pokémon
 * @param {number} params.baseDefense - Defensa base del Pokémon (opcional, default: 100)
 * @param {number} params.baseStamina - Stamina base del Pokémon (opcional)
 * @param {number} params.ivAttack - IV de ataque (0-15)
 * @param {number} params.ivDefense - IV de defensa (0-15) (opcional, default: 15)
 * @param {number} params.ivStamina - IV de stamina (0-15) (opcional, default: 15)
 * @param {Object} params.fastMove - Movimiento rápido {name, power, cooldown, energy, type}
 * @param {Object} params.chargedMove - Movimiento cargado {name, power, cooldown, energy, type}
 * @param {Array} params.pokemonTypes - Tipos del Pokémon para calcular STAB
 * @param {number} params.level - Nivel del Pokémon
 * @param {boolean} params.isShadow - Si es Shadow Pokémon
 * @param {Object} params.typeEffectiveness - Efectividad contra tipos específicos (opcional)
 * @param {boolean} params.weatherBoost - Si tiene boost de clima (opcional)
 * @param {number} params.defenderDefense - Defensa del defensor para cálculos específicos (opcional)
 * @returns {Object} Resultado completo con DPS para múltiples ventanas y análisis detallado
 */
export function calculateDPS({
  baseAttack,
  baseDefense = 100,
  baseStamina = 100,
  ivAttack = 15,
  ivDefense = 15,
  ivStamina = 15,
  fastMove,
  chargedMove,
  pokemonTypes = [],
  level = 30,
  isShadow = false,
  typeEffectiveness = {},
  weatherBoost = false,
  defenderDefense = 100,
  // Parámetros legacy para compatibilidad
  fastStab = null,
  chargedStab = null,
  shadowBonus = null
}) {
  // Validar datos esenciales
  if (!fastMove || !chargedMove || !baseAttack) {
    throw new Error('Faltan datos esenciales para el cálculo de DPS');
  }

  // Calcular estadísticas reales del Pokémon
  let attackerAttack = calculateRealStat({
    baseStat: baseAttack,
    iv: ivAttack,
    level
  });

  const attackerDefense = calculateRealStat({
    baseStat: baseDefense,
    iv: ivDefense,
    level
  });

  const attackerStamina = calculateRealStat({
    baseStat: baseStamina,
    iv: ivStamina,
    level
  });

  // Aplicar bonus de Shadow Pokémon
  if (isShadow) {
    attackerAttack *= SHADOW_ATTACK_BONUS; // +20% ataque
    // Nota: La defensa también se reduce pero no afecta el daño que hace
  }

  // Compatibilidad: usar parámetros legacy si se proporcionan
  const fastMoveSameType = fastStab !== null ? fastStab :
    (pokemonTypes.includes(fastMove.type));
  const chargedMoveSameType = chargedStab !== null ? chargedStab :
    (pokemonTypes.includes(chargedMove.type));

  // Calcular multiplicadores para movimiento rápido
  const fastMultipliers = [];
  if (fastMoveSameType) fastMultipliers.push(STAB_MULTIPLIER);
  if (weatherBoost) fastMultipliers.push(WEATHER_BOOST);
  if (typeEffectiveness.fast) fastMultipliers.push(typeEffectiveness.fast);

  // Calcular multiplicadores para movimiento cargado
  const chargedMultipliers = [];
  if (chargedMoveSameType) chargedMultipliers.push(STAB_MULTIPLIER);
  if (weatherBoost) chargedMultipliers.push(WEATHER_BOOST);
  if (typeEffectiveness.charged) chargedMultipliers.push(typeEffectiveness.charged);

  // Calcular daño por movimiento usando la fórmula oficial
  const fastMoveDamage = calculatePokemonGODamage({
    movePower: fastMove.power || 0,
    attackerAttack,
    defenderDefense,
    multipliers: fastMultipliers
  });

  const chargedMoveDamage = calculatePokemonGODamage({
    movePower: chargedMove.power || 0,
    attackerAttack,
    defenderDefense,
    multipliers: chargedMultipliers
  });

  // Crear objetos de movimientos con métricas mejoradas
  const enhancedFastMove = {
    ...fastMove,
    damage: fastMoveDamage,
    dps: fastMoveDamage / (fastMove.cooldown || 1),
    eps: (fastMove.energy || 0) / (fastMove.cooldown || 1), // Energy Per Second
    stab: fastMoveSameType,
    multipliers: fastMultipliers,
    totalMultiplier: fastMultipliers.reduce((acc, mult) => acc * mult, 1.0)
  };

  const enhancedChargedMove = {
    ...chargedMove,
    damage: chargedMoveDamage,
    dpe: chargedMoveDamage / Math.abs(chargedMove.energy || 1), // Damage Per Energy
    castTime: (chargedMove.cooldown || 0) + DAMAGE_WINDOW_OFFSET,
    stab: chargedMoveSameType,
    multipliers: chargedMultipliers,
    totalMultiplier: chargedMultipliers.reduce((acc, mult) => acc * mult, 1.0)
  };

  // Simular combate en las 3 ventanas de tiempo
  const combatResults = {};
  const dpsResults = {};

  Object.entries(TIME_WINDOWS).forEach(([key, timeWindow]) => {
    const result = simulateAdvancedCombat({
      timeWindow,
      fastMove: enhancedFastMove,
      chargedMove: enhancedChargedMove
    });

    combatResults[key.toLowerCase()] = result;
    dpsResults[key.toLowerCase()] = result.totalDamage / timeWindow;
  });

  // Calcular métricas adicionales
  const metrics = calculateAdvancedMetrics(enhancedFastMove, enhancedChargedMove);

  // Calcular CP estimado para referencia
  const estimatedCP = calculateCP({
    baseAttack,
    baseDefense,
    baseStamina,
    ivAttack,
    ivDefense,
    ivStamina,
    level
  });

  return {
    // Estadísticas calculadas
    stats: {
      attack: Math.round(attackerAttack),
      defense: Math.round(attackerDefense),
      stamina: Math.round(attackerStamina),
      cp: estimatedCP,
      level
    },

    // DPS por ventana de tiempo
    dps: {
      short: parseFloat(dpsResults.short?.toFixed(2)),    // 10s
      medium: parseFloat(dpsResults.medium?.toFixed(2)),  // 30s
      long: parseFloat(dpsResults.long?.toFixed(2))       // 60s
    },

    // Detalles de combate
    combatDetails: combatResults,

    // Movimientos mejorados
    moves: {
      fast: enhancedFastMove,
      charged: enhancedChargedMove
    },

    // Métricas avanzadas
    metrics,

    // Bonos aplicados
    appliedBonuses: {
      fastStab: fastMoveSameType,
      chargedStab: chargedMoveSameType,
      shadow: isShadow,
      weatherBoost,
      shadowAttackBonus: isShadow ? SHADOW_ATTACK_BONUS : 1.0,
      typeEffectiveness
    },

    // Información detallada del cálculo para debugging
    calculationDetails: {
      formula: "floor(0.5 × Power × (Attack/Defense) × Multiplicadores) + 1",
      attackUsed: Math.round(attackerAttack),
      defenseUsed: defenderDefense,
      fastMultipliers,
      chargedMultipliers,
      ivs: { attack: ivAttack, defense: ivDefense, stamina: ivStamina }
    }
  };
}

/**
 * Calcula el CP (Combat Power) según la fórmula oficial de Pokémon GO
 * CP = floor(Attack × sqrt(Defense) × sqrt(Stamina) × CPM² / 10)
 * @param {Object} params - Parámetros para calcular CP
 * @returns {number} CP calculado
 */
function calculateCP({
  baseAttack,
  baseDefense,
  baseStamina,
  ivAttack = 15,
  ivDefense = 15,
  ivStamina = 15,
  level = 30
}) {
  const cpMultiplier = CP_MULTIPLIER[level] || CP_MULTIPLIER[40];

  const attack = (baseAttack + ivAttack) * cpMultiplier;
  const defense = (baseDefense + ivDefense) * cpMultiplier;
  const stamina = (baseStamina + ivStamina) * cpMultiplier;

  const cp = Math.floor(attack * Math.sqrt(defense) * Math.sqrt(stamina) * Math.pow(cpMultiplier, 2) / 10);

  return Math.max(cp, 10); // CP mínimo es 10
}

/**
 * Simulación avanzada de combate con estrategia óptima de movimientos
 * @param {Object} params - Parámetros de la simulación
 * @param {number} params.timeWindow - Ventana de tiempo en segundos
 * @param {Object} params.fastMove - Movimiento rápido con métricas
 * @param {Object} params.chargedMove - Movimiento cargado con métricas
 * @returns {Object} Resultado detallado de la simulación
 */
function simulateAdvancedCombat({ timeWindow, fastMove, chargedMove }) {
  let totalTime = 0;
  let totalDamage = 0;
  let energy = 0;
  let fastMoveCount = 0;
  let chargedMoveCount = 0;
  let wastedEnergy = 0;

  // Array para tracking de secuencia de movimientos
  const moveSequence = [];

  // Estrategia: Calcular cuántos fast moves necesitamos para un charged move
  const energyPerCharged = Math.abs(chargedMove.energy);
  const fastMovesNeededForCharged = Math.ceil(energyPerCharged / fastMove.energy);

  // Pre-calcular si vale la pena usar charged moves basado en DPE
  const shouldUseChargedMoves = chargedMove.dpe > fastMove.dps / fastMove.eps;

  while (totalTime < timeWindow) {
    const remainingTime = timeWindow - totalTime;

    // Decidir estrategia óptima de movimiento
    const canUseCharged = energy >= energyPerCharged &&
                         remainingTime >= chargedMove.castTime &&
                         shouldUseChargedMoves;

    // Verificar si es óptimo usar charged move ahora
    const shouldWaitForCharged = shouldUseChargedMoves &&
                                energy >= energyPerCharged * 0.8 && // 80% de energía necesaria
                                remainingTime > chargedMove.castTime + fastMove.cooldown;

    if (canUseCharged && !shouldWaitForCharged) {
      // Usar movimiento cargado
      totalTime += chargedMove.castTime;
      totalDamage += chargedMove.damage;
      energy -= energyPerCharged;
      chargedMoveCount++;

      moveSequence.push({
        type: 'charged',
        time: totalTime,
        damage: chargedMove.damage,
        energyAfter: energy
      });

    } else if (remainingTime >= fastMove.cooldown) {
      // Usar movimiento rápido
      totalTime += fastMove.cooldown;
      totalDamage += fastMove.damage;

      const energyGained = fastMove.energy || 0;
      const newEnergy = energy + energyGained;

      // Controlar desperdicio de energía
      if (newEnergy > MAX_ENERGY) {
        wastedEnergy += newEnergy - MAX_ENERGY;
        energy = MAX_ENERGY;
      } else {
        energy = newEnergy;
      }

      fastMoveCount++;

      moveSequence.push({
        type: 'fast',
        time: totalTime,
        damage: fastMove.damage,
        energyAfter: energy,
        energyWasted: newEnergy > MAX_ENERGY ? newEnergy - MAX_ENERGY : 0
      });

    } else {
      // No hay tiempo suficiente para más movimientos
      break;
    }
  }

  // Calcular métricas de eficiencia
  const actualTimeUsed = Math.min(totalTime, timeWindow);
  const dps = totalDamage / actualTimeUsed;
  const energyEfficiency = wastedEnergy === 0 ? 100 : (1 - wastedEnergy / (fastMoveCount * fastMove.energy)) * 100;

  // Calcular TDO (Total Damage Output) proyectado
  const projectedTDO = totalDamage * (timeWindow / actualTimeUsed);

  return {
    totalDamage,
    totalTime: actualTimeUsed,
    fastMoveCount,
    chargedMoveCount,
    finalEnergy: energy,
    wastedEnergy,
    energyEfficiency: Math.round(energyEfficiency),
    dps: parseFloat(dps.toFixed(2)),
    projectedTDO: Math.round(projectedTDO),
    moveSequence,
    metrics: {
      chargedMoveRatio: chargedMoveCount > 0 ? chargedMoveCount / (fastMoveCount + chargedMoveCount) : 0,
      averageEnergyPerSecond: energy / actualTimeUsed,
      damageFromCharged: chargedMoveCount * chargedMove.damage,
      damageFromFast: fastMoveCount * fastMove.damage,
      chargedDamageRatio: chargedMoveCount > 0 ? (chargedMoveCount * chargedMove.damage) / totalDamage : 0
    }
  };
}

/**
 * Calcula métricas avanzadas de los movimientos
 * @param {Object} fastMove - Movimiento rápido mejorado
 * @param {Object} chargedMove - Movimiento cargado mejorado
 * @returns {Object} Métricas adicionales
 */
function calculateAdvancedMetrics(fastMove, chargedMove) {
  // Tiempo para cargar un movimiento cargado
  const energyNeeded = Math.abs(chargedMove.energy);
  const timeToCharge = Math.ceil(energyNeeded / fastMove.energy) * fastMove.cooldown;

  // Cycles per minute (cuántos charged moves por minuto)
  const cyclesPerMinute = 60 / (timeToCharge + chargedMove.castTime);

  // Damage per energy cycle
  const fastMovesPerCycle = Math.ceil(energyNeeded / fastMove.energy);
  const damagePerCycle = (fastMovesPerCycle * fastMove.damage) + chargedMove.damage;
  const timePerCycle = (fastMovesPerCycle * fastMove.cooldown) + chargedMove.castTime;
  const cycleDPS = damagePerCycle / timePerCycle;

  // Versatilidad del moveset
  const movesetVersatility = {
    fastMoveQuality: fastMove.dps, // DPS puro del fast move
    chargedMoveQuality: chargedMove.dpe, // Damage per energy
    energyGeneration: fastMove.eps, // Energy per second
    burstPotential: chargedMove.damage, // Daño de burst
    consistency: fastMove.dps / (fastMove.dps + (chargedMove.damage / timeToCharge)) // Qué tan dependiente es de charged moves
  };

  return {
    timeToCharge: parseFloat(timeToCharge?.toFixed(2)),
    cyclesPerMinute: parseFloat(cyclesPerMinute?.toFixed(2)),
    cycleDPS: parseFloat(cycleDPS?.toFixed(2)),
    damagePerCycle: Math.round(damagePerCycle),
    movesetVersatility,
    recommendedStrategy: cycleDPS > fastMove.dps ? 'charged_focused' : 'fast_focused'
  };
}

/**
 * Función simplificada para compatibilidad con código existente
 * Ahora usa la fórmula precisa de Pokémon GO y retorna DPS básico
 * @deprecated Usar calculateDPS con movimientos completos para análisis completo
 */
export function calculateSimpleDPS({
  baseAttack,
  ivAttack = 15,
  movePower,
  cooldown,
  stab = true,
  level = 30,
  isShadow = false,
  shadowBonus = null,
  defenderDefense = 100
}) {
  // Calcular estadística de ataque real
  let attack = calculateRealStat({
    baseStat: baseAttack,
    iv: ivAttack,
    level
  });

  // Aplicar bonus de Shadow Pokémon (nuevo cálculo preciso)
  if (isShadow) {
    attack *= SHADOW_ATTACK_BONUS;
  } else if (shadowBonus) {
    // Compatibilidad con parámetro legacy
    attack *= shadowBonus.attack;
  }

  // Calcular multiplicadores
  const multipliers = [];
  if (stab) multipliers.push(STAB_MULTIPLIER);

  // Usar la fórmula oficial de Pokémon GO
  const damage = calculatePokemonGODamage({
    movePower: movePower || 0,
    attackerAttack: attack,
    defenderDefense,
    multipliers
  });

  const dps = damage / (cooldown || 1);

  return {
    attack: Math.round(attack),
    damage: damage,
    dps: parseFloat(dps?.toFixed(2)),
    appliedBonuses: {
      stab: stab,
      shadow: isShadow,
      shadowAttackBonus: isShadow ? SHADOW_ATTACK_BONUS : (shadowBonus?.attack || 1.0),
      multipliers: multipliers,
      totalMultiplier: multipliers.reduce((acc, mult) => acc * mult, 1.0)
    },
    calculationDetails: {
      formula: "floor(0.5 × Power × (Attack/Defense) × Multiplicadores) + 1",
      attackUsed: Math.round(attack),
      defenseUsed: defenderDefense,
      movePower: movePower || 0,
      cooldown: cooldown || 1
    }
  };
}

/**
 * Función utilitaria para obtener información de ventanas de tiempo
 * @returns {Object} Información sobre las ventanas de tiempo disponibles
 */
export function getTimeWindowsInfo() {
  return {
    windows: TIME_WINDOWS,
    descriptions: {
      SHORT: "Combate rápido - Ideal para raids y gimnasios",
      MEDIUM: "Combate medio - Liga GO Battle típica",
      LONG: "Combate largo - Análisis de resistencia completa"
    }
  };
}

/**
 * Calcula la efectividad de tipo según las reglas de Pokémon GO
 * @param {string} attackType - Tipo del movimiento atacante
 * @param {Array} defenderTypes - Tipos del Pokémon defensor
 * @returns {number} Multiplicador de efectividad
 */
export function calculateTypeEffectiveness(attackType, defenderTypes = []) {
  if (!attackType || !defenderTypes.length) return TYPE_EFFECTIVENESS.NORMAL;

  // Tabla de efectividad de tipos de Pokémon GO (simplificada para ejemplo)
  const typeChart = {
    'Fire': {
      superEffective: ['Grass', 'Ice', 'Bug', 'Steel'],
      notVeryEffective: ['Fire', 'Water', 'Rock', 'Dragon'],
      noEffect: []
    },
    'Water': {
      superEffective: ['Fire', 'Ground', 'Rock'],
      notVeryEffective: ['Water', 'Grass', 'Dragon'],
      noEffect: []
    },
    'Electric': {
      superEffective: ['Water', 'Flying'],
      notVeryEffective: ['Electric', 'Grass', 'Dragon'],
      noEffect: ['Ground']
    },
    'Grass': {
      superEffective: ['Water', 'Ground', 'Rock'],
      notVeryEffective: ['Fire', 'Grass', 'Poison', 'Flying', 'Bug', 'Dragon', 'Steel'],
      noEffect: []
    },
    'Fighting': {
      superEffective: ['Normal', 'Ice', 'Rock', 'Dark', 'Steel'],
      notVeryEffective: ['Poison', 'Flying', 'Psychic', 'Bug', 'Fairy'],
      noEffect: ['Ghost']
    },
    'Psychic': {
      superEffective: ['Fighting', 'Poison'],
      notVeryEffective: ['Psychic', 'Steel'],
      noEffect: ['Dark']
    },
    'Dark': {
      superEffective: ['Psychic', 'Ghost'],
      notVeryEffective: ['Fighting', 'Dark', 'Fairy'],
      noEffect: []
    },
    // Agregar más tipos según sea necesario...
  };

  const attackTypeData = typeChart[attackType];
  if (!attackTypeData) return TYPE_EFFECTIVENESS.NORMAL;

  let effectiveness = TYPE_EFFECTIVENESS.NORMAL;

  for (const defenderType of defenderTypes) {
    let typeMultiplier = TYPE_EFFECTIVENESS.NORMAL;

    if (attackTypeData.superEffective.includes(defenderType)) {
      typeMultiplier = TYPE_EFFECTIVENESS.SUPER_EFFECTIVE;
    } else if (attackTypeData.notVeryEffective.includes(defenderType)) {
      typeMultiplier = TYPE_EFFECTIVENESS.NOT_VERY_EFFECTIVE;
    } else if (attackTypeData.noEffect.includes(defenderType)) {
      typeMultiplier = TYPE_EFFECTIVENESS.NO_EFFECT;
    }

    // En Pokémon con dos tipos, los multiplicadores se aplican secuencialmente
    effectiveness *= typeMultiplier;
  }

  return effectiveness;
}

/**
 * Verifica si un movimiento es STAB (Same Type Attack Bonus) para un Pokémon
 * @param {string} moveType - Tipo del movimiento
 * @param {Array} pokemonTypes - Tipos del Pokémon
 * @returns {boolean} True si es STAB
 */
export function isSTAB(moveType, pokemonTypes = []) {
  return pokemonTypes.includes(moveType);
}

/**
 * Calcula bonos de clima para un tipo específico
 * @param {string} moveType - Tipo del movimiento
 * @param {string} weather - Condición climática
 * @returns {number} Multiplicador de clima (1.0 o 1.2)
 */
export function calculateWeatherBonus(moveType, weather) {
  const weatherBoosts = {
    'Sunny': ['Fire', 'Grass', 'Ground'],
    'Rain': ['Water', 'Electric', 'Bug'],
    'PartlyCloudy': ['Normal', 'Rock'],
    'Cloudy': ['Fairy', 'Fighting', 'Poison'],
    'Windy': ['Dragon', 'Flying', 'Psychic'],
    'Snow': ['Ice', 'Steel'],
    'Fog': ['Dark', 'Ghost']
  };

  const boostedTypes = weatherBoosts[weather];
  return boostedTypes && boostedTypes.includes(moveType) ? WEATHER_BOOST : 1.0;
}

/**
 * Función auxiliar para crear un perfil de multiplicadores completo
 * @param {Object} params - Parámetros para calcular multiplicadores
 * @returns {Object} Objeto con todos los multiplicadores calculados
 */
export function calculateAllMultipliers({
  moveType,
  pokemonTypes = [],
  defenderTypes = [],
  weather = null,
  isShiny = false,
  isPurified = false,
  isMega = false
}) {
  const stab = isSTAB(moveType, pokemonTypes);
  const typeEffectiveness = calculateTypeEffectiveness(moveType, defenderTypes);
  const weatherBonus = weather ? calculateWeatherBonus(moveType, weather) : 1.0;

  // Bonos adicionales
  let megaBonus = 1.0;
  if (isMega) {
    megaBonus = 1.3; // Mega Evolution típicamente da +30% daño
  }

  let purifiedBonus = 1.0;
  if (isPurified) {
    purifiedBonus = 1.1; // Purified Pokémon puede tener bonus menor
  }

  const multipliers = [];
  if (stab) multipliers.push(STAB_MULTIPLIER);
  if (typeEffectiveness !== 1.0) multipliers.push(typeEffectiveness);
  if (weatherBonus !== 1.0) multipliers.push(weatherBonus);
  if (megaBonus !== 1.0) multipliers.push(megaBonus);
  if (purifiedBonus !== 1.0) multipliers.push(purifiedBonus);

  const totalMultiplier = multipliers.reduce((acc, mult) => acc * mult, 1.0);

  return {
    stab,
    typeEffectiveness,
    weatherBonus,
    megaBonus,
    purifiedBonus,
    multipliers,
    totalMultiplier,
    description: getMultiplierDescription(stab, typeEffectiveness, weatherBonus, megaBonus, purifiedBonus)
  };
}

/**
 * Genera una descripción textual de los multiplicadores aplicados
 * @param {boolean} stab - Si tiene STAB
 * @param {number} typeEffectiveness - Efectividad de tipo
 * @param {number} weatherBonus - Bonus de clima
 * @param {number} megaBonus - Bonus de Mega Evolution
 * @param {number} purifiedBonus - Bonus de Purified
 * @returns {string} Descripción de los bonos
 */
function getMultiplierDescription(stab, typeEffectiveness, weatherBonus, megaBonus, purifiedBonus) {
  const bonuses = [];

  if (stab) bonuses.push('STAB (+20%)');

  if (typeEffectiveness > 1.0) {
    bonuses.push('Súper eficaz (+60%)');
  } else if (typeEffectiveness < 1.0 && typeEffectiveness > 0.5) {
    bonuses.push('No muy eficaz (-37.5%)');
  } else if (typeEffectiveness <= 0.5) {
    bonuses.push('Sin efecto (-61%)');
  }

  if (weatherBonus > 1.0) bonuses.push('Clima (+20%)');
  if (megaBonus > 1.0) bonuses.push('Mega (+30%)');
  if (purifiedBonus > 1.0) bonuses.push('Purificado (+10%)');

  return bonuses.length > 0 ? bonuses.join(', ') : 'Sin bonos';
}

/**
 * Función para comparar múltiples Pokémon en todas las ventanas
 * @param {Array} pokemonList - Lista de resultados de calculateDPS
 * @returns {Object} Comparación organizada por ventana de tiempo
 */
export function comparePokemonDPS(pokemonList) {
  const comparison = {
    short: [...pokemonList].sort((a, b) => b.dps.short - a.dps.short),
    medium: [...pokemonList].sort((a, b) => b.dps.medium - a.dps.medium),
    long: [...pokemonList].sort((a, b) => b.dps.long - a.dps.long)
  };

  return {
    ...comparison,
    analytics: {
      bestOverall: getBestOverallPokemon(pokemonList),
      mostConsistent: getMostConsistentPokemon(pokemonList),
      bestBurst: getBestBurstPokemon(pokemonList)
    }
  };
}

// Funciones auxiliares para análisis
function getBestOverallPokemon(pokemonList) {
  return pokemonList.reduce((best, current) => {
    const currentAvg = (current.dps.short + current.dps.medium + current.dps.long) / 3;
    const bestAvg = best ? (best.dps.short + best.dps.medium + best.dps.long) / 3 : 0;
    return currentAvg > bestAvg ? current : best;
  }, null);
}

function getMostConsistentPokemon(pokemonList) {
  return pokemonList.reduce((mostConsistent, current) => {
    const currentVariance = calculateVariance([current.dps.short, current.dps.medium, current.dps.long]);
    const consistentVariance = mostConsistent ?
      calculateVariance([mostConsistent.dps.short, mostConsistent.dps.medium, mostConsistent.dps.long]) :
      Infinity;
    return currentVariance < consistentVariance ? current : mostConsistent;
  }, null);
}

function getBestBurstPokemon(pokemonList) {
  return pokemonList.reduce((bestBurst, current) => {
    const currentBurst = Math.max(...Object.values(current.combatDetails.short.metrics || {}));
    const bestBurstValue = bestBurst ? Math.max(...Object.values(bestBurst.combatDetails.short.metrics || {})) : 0;
    return currentBurst > bestBurstValue ? current : bestBurst;
  }, null);
}

function calculateVariance(numbers) {
  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
}
