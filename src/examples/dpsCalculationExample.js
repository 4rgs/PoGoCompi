// Ejemplo de uso del nuevo sistema de cálculo de DPS
// Este archivo demuestra las capacidades del sistema mejorado

import {
  calculateDPS,
  calculateAllMultipliers,
  calculateTypeEffectiveness,
  calculateWeatherBonus,
  isSTAB
} from '../utils/dpsCalculator.js';

// Ejemplo 1: Cálculo básico de DPS con Machamp
console.log("=== Ejemplo 1: Machamp vs Normal ===");

const machampData = {
  baseAttack: 234,
  baseDefense: 159,
  baseStamina: 207,
  ivAttack: 15,
  ivDefense: 15,
  ivStamina: 15,
  fastMove: {
    name: "Counter",
    power: 8,
    cooldown: 0.9,
    energy: 8,
    type: "Fighting"
  },
  chargedMove: {
    name: "Dynamic Punch",
    power: 90,
    cooldown: 2.7,
    energy: -50,
    type: "Fighting"
  },
  pokemonTypes: ["Fighting"],
  level: 40
};

const machampResult = calculateDPS(machampData);

console.log("DPS por ventanas de tiempo:");
console.log(`- Corto (10s): ${machampResult.dps.short}`);
console.log(`- Medio (30s): ${machampResult.dps.medium}`);
console.log(`- Largo (60s): ${machampResult.dps.long}`);

console.log("\nEstadísticas calculadas:");
console.log(`- Ataque: ${machampResult.stats.attack}`);
console.log(`- CP: ${machampResult.stats.cp}`);

console.log("\nDetalles del combate (10s):");
const shortCombat = machampResult.combatDetails.short;
console.log(`- Daño total: ${shortCombat.totalDamage}`);
console.log(`- Movimientos rápidos: ${shortCombat.fastMoveCount}`);
console.log(`- Movimientos cargados: ${shortCombat.chargedMoveCount}`);
console.log(`- Eficiencia energética: ${shortCombat.energyEfficiency}%`);

// Ejemplo 2: Comparación Shadow vs Normal
console.log("\n=== Ejemplo 2: Shadow Machamp vs Normal ===");

const shadowMachampResult = calculateDPS({
  ...machampData,
  isShadow: true
});

const normalDPS = machampResult.dps.short;
const shadowDPS = shadowMachampResult.dps.short;
const improvement = ((shadowDPS / normalDPS) - 1) * 100;

console.log(`Normal Machamp: ${normalDPS} DPS`);
console.log(`Shadow Machamp: ${shadowDPS} DPS`);
console.log(`Mejora: +${improvement.toFixed(1)}%`);

// Ejemplo 3: Análisis de efectividad de tipos
console.log("\n=== Ejemplo 3: Análisis de Efectividad ===");

const defenderTypes = ["Normal"]; // Blissey, por ejemplo
const effectiveness = calculateTypeEffectiveness("Fighting", defenderTypes);

console.log(`Fighting vs Normal: ${effectiveness}x daño`);
if (effectiveness > 1.0) {
  console.log("¡Súper eficaz!");
} else if (effectiveness < 1.0) {
  console.log("No muy eficaz...");
}

// Ejemplo 4: Análisis completo de multiplicadores
console.log("\n=== Ejemplo 4: Análisis de Multiplicadores ===");

const multipliers = calculateAllMultipliers({
  moveType: "Fighting",
  pokemonTypes: ["Fighting"],
  defenderTypes: ["Normal"],
  weather: "Cloudy"
});

console.log("Multiplicadores aplicados:");
console.log(`- STAB: ${multipliers.stab ? "Sí (×1.2)" : "No"}`);
console.log(`- Efectividad: ×${multipliers.typeEffectiveness}`);
console.log(`- Clima: ×${multipliers.weatherBonus}`);
console.log(`- Total: ×${multipliers.totalMultiplier.toFixed(2)}`);
console.log(`- Descripción: ${multipliers.description}`);

// Ejemplo 5: Comparación de clima
console.log("\n=== Ejemplo 5: Impacto del Clima ===");

const weathers = [
  { name: "Sin clima", weather: null },
  { name: "Nublado", weather: "Cloudy" },
  { name: "Soleado", weather: "Sunny" },
  { name: "Lluvia", weather: "Rain" }
];

weathers.forEach(({ name, weather }) => {
  const weatherBonus = weather ? calculateWeatherBonus("Fighting", weather) : 1.0;
  const effectiveDPS = normalDPS * weatherBonus;

  console.log(`${name}: ${effectiveDPS.toFixed(2)} DPS (×${weatherBonus})`);
});

// Ejemplo 6: Análisis de movimientos individuales
console.log("\n=== Ejemplo 6: Análisis de Movimientos ===");

const fastMove = machampResult.moves.fast;
const chargedMove = machampResult.moves.charged;

console.log("Movimiento Rápido (Counter):");
console.log(`- Daño por uso: ${fastMove.damage}`);
console.log(`- DPS: ${fastMove.dps.toFixed(2)}`);
console.log(`- EPS: ${fastMove.eps.toFixed(2)}`);
console.log(`- STAB: ${fastMove.stab ? "Sí" : "No"}`);

console.log("\nMovimiento Cargado (Dynamic Punch):");
console.log(`- Daño por uso: ${chargedMove.damage}`);
console.log(`- DPE: ${chargedMove.dpe.toFixed(2)}`);
console.log(`- Tiempo de cast: ${chargedMove.castTime}s`);
console.log(`- STAB: ${chargedMove.stab ? "Sí" : "No"}`);

// Ejemplo 7: Comparación de IVs
console.log("\n=== Ejemplo 7: Impacto de IVs de Ataque ===");

for (let ivAttack = 0; ivAttack <= 15; ivAttack += 5) {
  const result = calculateDPS({
    ...machampData,
    ivAttack: ivAttack
  });

  const difference = ivAttack === 0 ? 0 :
    ((result.dps.short / machampResult.dps.short) - 1) * 100;

  console.log(`IV Ataque ${ivAttack}: ${result.dps.short} DPS ${
    ivAttack > 0 ? `(+${difference.toFixed(1)}%)` : ""
  }`);
}

// Ejemplo 8: Métricas avanzadas
console.log("\n=== Ejemplo 8: Métricas Avanzadas ===");

const metrics = machampResult.metrics;

console.log("Métricas del moveset:");
console.log(`- Tiempo para cargar: ${metrics.timeToCharge}s`);
console.log(`- Ciclos por minuto: ${metrics.cyclesPerMinute}`);
console.log(`- DPS del ciclo: ${metrics.cycleDPS}`);
console.log(`- Daño por ciclo: ${metrics.damagePerCycle}`);
console.log(`- Estrategia recomendada: ${metrics.recommendedStrategy}`);

// Ejemplo 9: Secuencia de movimientos
console.log("\n=== Ejemplo 9: Secuencia de Movimientos (10s) ===");

const moveSequence = shortCombat.moveSequence.slice(0, 10); // Primeros 10 movimientos

moveSequence.forEach((move, index) => {
  const moveType = move.type === 'fast' ? 'Rápido' : 'Cargado';
  console.log(`${index + 1}. ${moveType} - ${move.time.toFixed(1)}s - ${move.damage} daño`);
});

console.log("\n=== Resumen del Sistema ===");
console.log("✅ Fórmulas oficiales de Pokémon GO implementadas");
console.log("✅ Multiplicadores precisos (STAB, efectividad, clima, Shadow)");
console.log("✅ Análisis por ventanas de tiempo");
console.log("✅ Estadísticas reales calculadas con CPM oficiales");
console.log("✅ Métricas avanzadas de combate");
console.log("✅ Simulación detallada de secuencias de movimientos");

export {
  machampResult,
  shadowMachampResult,
  multipliers,
  // Para uso en tests o otros módulos
  machampData
};
