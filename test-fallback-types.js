// Script simple para probar el sistema de fallback de tipos
import { getPokemonTypesWithFallback } from './src/utils/pokemonTypesFallback.js';

console.log('🧪 Probando sistema de fallback de tipos...');

// Casos de prueba
const testCases = [
  { id: 483, name: 'Dialga', apiTypes: [], expectedFallback: ['Steel', 'Dragon'] },
  { id: 150, name: 'Mewtwo', apiTypes: null, expectedFallback: ['Psychic'] },
  { id: 1, name: 'Bulbasaur', apiTypes: undefined, expectedFallback: ['Grass', 'Poison'] },
  { id: 6, name: 'Charizard', apiTypes: [], expectedFallback: ['Fire', 'Flying'] },
  { id: 25, name: 'Pikachu', apiTypes: ['Electric'], expectedFallback: ['Electric'] }, // Caso con tipos de API válidos
  { id: 9999, name: 'Desconocido', apiTypes: [], expectedFallback: ['Normal'] }, // Caso sin datos
];

console.log('\n🎯 Resultados de las pruebas:');

testCases.forEach(test => {
  const result = getPokemonTypesWithFallback(test.id, test.apiTypes);
  const isCorrect = JSON.stringify(result) === JSON.stringify(test.expectedFallback);
  
  console.log(`\n${test.name} (ID: ${test.id}):`);
  console.log(`  Tipos API: ${JSON.stringify(test.apiTypes)}`);
  console.log(`  Resultado: ${JSON.stringify(result)}`);
  console.log(`  Esperado: ${JSON.stringify(test.expectedFallback)}`);
  console.log(`  ✅ Correcto: ${isCorrect ? 'SÍ' : 'NO'}`);
});

console.log('\n✅ Pruebas completadas');
