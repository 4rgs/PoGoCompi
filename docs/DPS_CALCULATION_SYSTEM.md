# Sistema de Cálculo de DPS Avanzado - Pokémon GO

## 🎯 Descripción General

El sistema de cálculo de DPS ha sido completamente actualizado para implementar las **fórmulas oficiales de Pokémon GO**, proporcionando cálculos precisos que reflejan el daño real en el juego.

## 📊 Fórmula Oficial Implementada

### Daño por Movimiento
```
Daño = floor(0.5 × Power × (Ataque_Atacante/Defensa_Defensor) × Multiplicadores) + 1
```

### Estadísticas Reales
```
Estadística_Real = (Base_Stat + IV) × CPM
```

Donde:
- **CPM**: Combat Power Multiplier (específico del nivel 1-50)
- **IV**: Individual Values (0-15)
- **Multiplicadores**: STAB, Efectividad, Clima, Shadow, etc.

## 🔢 Multiplicadores Implementados

### STAB (Same Type Attack Bonus)
- **×1.2** cuando el tipo del movimiento coincide con el tipo del Pokémon

### Efectividad de Tipo
- **×1.6** Súper eficaz
- **×1.0** Daño normal
- **×0.625** No muy eficaz
- **×0.39** Sin efecto

### Shadow Pokémon
- **+20% Ataque** (×1.2)
- **-16.67% Defensa** (×0.833)

### Clima (Weather Boost)
- **+20% Daño** (×1.2) cuando el tipo está potenciado

### Mega Evolution
- **+30% Daño** (×1.3) para Mega Pokémon

## 🚀 Nuevas Funcionalidades

### 1. Cálculo de DPS por Ventanas de Tiempo
```javascript
const result = calculateDPS({
  baseAttack: 234,
  ivAttack: 15,
  fastMove: { name: "Counter", power: 8, cooldown: 0.9, energy: 8, type: "Fighting" },
  chargedMove: { name: "Dynamic Punch", power: 90, cooldown: 2.7, energy: -50, type: "Fighting" },
  pokemonTypes: ["Fighting"],
  level: 40
});

console.log(result.dps);
// {
//   short: 23.45,   // 10 segundos
//   medium: 25.67,  // 30 segundos
//   long: 24.89     // 60 segundos
// }
```

### 2. Análisis de Multiplicadores Automático
```javascript
const multipliers = calculateAllMultipliers({
  moveType: "Fighting",
  pokemonTypes: ["Fighting"],
  defenderTypes: ["Normal"],
  weather: "Cloudy"
});

console.log(multipliers);
// {
//   stab: true,
//   typeEffectiveness: 1.6,  // Súper eficaz
//   weatherBonus: 1.2,       // Clima favorable
//   totalMultiplier: 3.84,   // 1.2 × 1.6 × 1.2
//   description: "STAB (+20%), Súper eficaz (+60%), Clima (+20%)"
// }
```

### 3. Información Detallada de Combate
```javascript
const result = calculateDPS(params);

console.log(result.combatDetails.short);
// {
//   totalDamage: 234,
//   fastMoveCount: 8,
//   chargedMoveCount: 2,
//   energyEfficiency: 95,
//   moveSequence: [...]
// }
```

### 4. Estadísticas Precisas del Pokémon
```javascript
console.log(result.stats);
// {
//   attack: 249,    // Estadística real calculada
//   defense: 159,
//   stamina: 207,
//   cp: 3056,       // CP calculado oficialmente
//   level: 40
// }
```

## 🎮 Integración con el Servicio

### Uso Básico
```javascript
import pokemonDataService from './services/pokemonDataService';

const dpsResult = pokemonDataService.calculatePokemonDPS({
  pokemonName: "Machamp",
  fastMoveName: "Counter",
  chargedMoveName: "Dynamic Punch",
  ivAttack: 15,
  ivDefense: 15,
  ivStamina: 15,
  level: 40,
  defenderTypes: ["Normal"],  // Para calcular efectividad
  weather: "Cloudy"           // Para bonus de clima
});
```

### Análisis Completo
```javascript
console.log(dpsResult.analysis);
// {
//   effectiveness: {
//     overall: "excellent",
//     fastMove: "very_good",
//     chargedMove: "excellent",
//     bestMove: "charged"
//   },
//   recommendations: [
//     {
//       type: "strategy",
//       message: "Excelente para raids rápidos y gimnasios",
//       priority: "high"
//     }
//   ]
// }
```

## 🛠️ Funciones Utilitarias

### Verificar STAB
```javascript
import { isSTAB } from './utils/dpsCalculator';

const hasSTAB = isSTAB("Fighting", ["Fighting", "Steel"]);
// true
```

### Calcular Efectividad de Tipo
```javascript
import { calculateTypeEffectiveness } from './utils/dpsCalculator';

const effectiveness = calculateTypeEffectiveness("Fighting", ["Normal"]);
// 1.6 (Súper eficaz)
```

### Bonus de Clima
```javascript
import { calculateWeatherBonus } from './utils/dpsCalculator';

const bonus = calculateWeatherBonus("Fighting", "Cloudy");
// 1.2
```

## 📈 Comparación con Sistema Anterior

### Antes (Sistema Básico)
```javascript
// Fórmula simplificada
const damage = Math.floor(0.5 * power * stabBonus * attack / 100) + 1;
```

### Ahora (Sistema Preciso)
```javascript
// Fórmula oficial de Pokémon GO
const damage = calculatePokemonGODamage({
  movePower: power,
  attackerAttack: realAttackStat,    // (BaseAttack + IV) × CPM
  defenderDefense: defenderDefense,  // Considerando defensa real
  multipliers: [stab, effectiveness, weather, shadow, mega]
});
```

## 🎯 Beneficios del Nuevo Sistema

1. **Precisión Real**: Usa las fórmulas exactas de Pokémon GO
2. **Multiplicadores Completos**: STAB, efectividad, clima, Shadow, Mega
3. **Análisis por Ventanas**: Combates cortos, medios y largos
4. **CP Oficial**: Cálculo preciso usando fórmula oficial
5. **Recomendaciones**: IA que sugiere optimizaciones
6. **Compatibilidad**: Mantiene API existente para transición suave

## 🔮 Casos de Uso Avanzados

### 1. Comparación de Variantes
```javascript
// Shadow vs Normal
const shadowDPS = calculateDPS({...params, isShadow: true});
const normalDPS = calculateDPS({...params, isShadow: false});

const improvement = ((shadowDPS.dps.short / normalDPS.dps.short) - 1) * 100;
console.log(`Shadow mejora ${improvement.toFixed(1)}% el DPS`);
```

### 2. Optimización de IVs
```javascript
// Comparar diferentes combinaciones de IVs
for (let ivAttack = 0; ivAttack <= 15; ivAttack++) {
  const dps = calculateDPS({...params, ivAttack});
  console.log(`IV Ataque ${ivAttack}: ${dps.dps.short} DPS`);
}
```

### 3. Análisis de Clima
```javascript
const weathers = ["Sunny", "Rain", "Cloudy", "Windy"];
weathers.forEach(weather => {
  const result = pokemonDataService.calculatePokemonDPS({
    ...params,
    weather
  });
  console.log(`${weather}: ${result.dps} DPS`);
});
```

## 🚦 Estado de Implementación

- ✅ Fórmulas oficiales de daño
- ✅ CP Multiplier completo (nivel 1-50)
- ✅ Sistema de multiplicadores
- ✅ Cálculo de estadísticas reales
- ✅ Análisis por ventanas de tiempo
- ✅ Integración con servicio existente
- ✅ Compatibilidad hacia atrás
- ⏳ Tabla de efectividad completa de tipos
- ⏳ Integración con UI para mostrar detalles
- ⏳ Optimizador automático de movesets

Este sistema convierte la aplicación en una herramienta de análisis precisa que refleja fielmente las mecánicas de Pokémon GO.
