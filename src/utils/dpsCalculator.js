// src/utils/dpsCalculator.js - Calculador de DPS excepcional con múltiples ventanas de tiempo
const CP_MULTIPLIER = {
  20: 0.5974,
  25: 0.6675,
  30: 0.7317,
  35: 0.7903,
  40: 0.8414,
  45: 0.8840,
  50: 0.9194
};

// Ventanas de tiempo para análisis completo de DPS
const TIME_WINDOWS = {
  SHORT: 10,    // Combate corto - raids, gimnasios
  MEDIUM: 30,   // Combate medio - Liga GO Battle
  LONG: 60      // Combate largo - análisis completo
};

// Constantes de Pokémon GO
const MAX_ENERGY = 100;
const DAMAGE_WINDOW_OFFSET = 0.5; // Offset típico de ventana de daño

/**
 * Calcula el DPS excepcional en múltiples ventanas de tiempo con análisis detallado
 * @param {Object} params - Parámetros del cálculo
 * @param {number} params.baseAttack - Ataque base del Pokémon
 * @param {number} params.ivAttack - IV de ataque (0-15)
 * @param {Object} params.fastMove - Movimiento rápido {name, power, cooldown, energy}
 * @param {Object} params.chargedMove - Movimiento cargado {name, power, cooldown, energy}
 * @param {boolean} params.fastStab - Si el movimiento rápido tiene STAB
 * @param {boolean} params.chargedStab - Si el movimiento cargado tiene STAB
 * @param {number} params.level - Nivel del Pokémon
 * @param {boolean} params.isShadow - Si es Shadow Pokémon
 * @param {Object} params.shadowBonus - Bonos de Shadow {attack, defense}
 * @returns {Object} Resultado completo con DPS para múltiples ventanas y análisis detallado
 */
export function calculateDPS({
  baseAttack,
  ivAttack,
  fastMove,
  chargedMove,
  fastStab = false,
  chargedStab = false,
  level = 30,
  isShadow = false,
  shadowBonus = null
}) {
  // Calcular estadística de ataque final con CP multiplier más preciso
  const cpMultiplier = CP_MULTIPLIER[level] || CP_MULTIPLIER[30];
  let attack = (baseAttack + ivAttack) * cpMultiplier;
  
  // Aplicar bonus de Shadow Pokémon al ataque (20% más)
  if (isShadow && shadowBonus) {
    attack = attack * shadowBonus.attack;
  }

  // Bonos STAB (Same Type Attack Bonus)
  const fastStabBonus = fastStab ? 1.2 : 1.0;
  const chargedStabBonus = chargedStab ? 1.2 : 1.0;

  // Calcular daño por movimiento (fórmula de Pokémon GO)
  const fastMoveDamage = Math.floor(0.5 * fastMove.power * fastStabBonus * attack / 100) + 1;
  const chargedMoveDamage = Math.floor(0.5 * chargedMove.power * chargedStabBonus * attack / 100) + 1;

  // Crear objetos de movimientos con daño calculado
  const enhancedFastMove = {
    ...fastMove,
    damage: fastMoveDamage,
    dps: fastMoveDamage / fastMove.cooldown,
    eps: fastMove.energy / fastMove.cooldown // Energy Per Second
  };

  const enhancedChargedMove = {
    ...chargedMove,
    damage: chargedMoveDamage,
    dpe: chargedMoveDamage / Math.abs(chargedMove.energy), // Damage Per Energy
    castTime: chargedMove.cooldown + DAMAGE_WINDOW_OFFSET
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

  return {
    attack: Math.round(attack),
    dps: {
      short: parseFloat(dpsResults.short.toFixed(2)),    // 10s
      medium: parseFloat(dpsResults.medium.toFixed(2)),  // 30s  
      long: parseFloat(dpsResults.long.toFixed(2))       // 60s
    },
    combatDetails: combatResults,
    moves: {
      fast: enhancedFastMove,
      charged: enhancedChargedMove
    },
    metrics,
    appliedBonuses: {
      fastStab: fastStab,
      chargedStab: chargedStab,
      shadow: isShadow,
      attackBonus: isShadow && shadowBonus ? shadowBonus.attack : 1.0
    }
  };
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
    timeToCharge: parseFloat(timeToCharge.toFixed(2)),
    cyclesPerMinute: parseFloat(cyclesPerMinute.toFixed(2)),
    cycleDPS: parseFloat(cycleDPS.toFixed(2)),
    damagePerCycle: Math.round(damagePerCycle),
    movesetVersatility,
    recommendedStrategy: cycleDPS > fastMove.dps ? 'charged_focused' : 'fast_focused'
  };
}

/**
 * Función simplificada para compatibilidad con código existente
 * Ahora retorna DPS de la ventana corta (10s) para mantener compatibilidad
 * @deprecated Usar calculateDPS con movimientos completos para análisis completo
 */
export function calculateSimpleDPS({
  baseAttack,
  ivAttack,
  movePower,
  cooldown,
  stab = true,
  level = 30,
  isShadow = false,
  shadowBonus = null
}) {
  const cpMultiplier = CP_MULTIPLIER[level] || CP_MULTIPLIER[30];
  let attack = (baseAttack + ivAttack) * cpMultiplier;
  
  if (isShadow && shadowBonus) {
    attack = attack * shadowBonus.attack;
  }
  
  const stabBonus = stab ? 1.2 : 1.0;
  const damage = Math.floor(0.5 * movePower * stabBonus * attack / 100) + 1;
  const dps = damage / cooldown;

  return { 
    attack: Math.round(attack), 
    dps: parseFloat(dps.toFixed(2)),
    appliedBonuses: {
      stab: stab,
      shadow: isShadow
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
