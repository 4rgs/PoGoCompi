// Copia y pega esto en la consola del navegador para debuggear tipos

// 1. Primero verificar si el servicio está disponible
console.log('🔍 Servicio disponible:', !!window.pokemonDataService);

// 2. Obtener todos los Pokémon
const allPokemon = window.pokemonDataService?.getAllPokemon() || [];
console.log(`📊 Total Pokémon: ${allPokemon.length}`);

// 3. Buscar Dialga y Mewtwo específicamente
const dialga = allPokemon.find(p => p.name.toLowerCase().includes('dialga'));
const mewtwo = allPokemon.find(p => p.name.toLowerCase().includes('mewtwo'));

console.log('\n🐉 DIALGA:');
if (dialga) {
  console.log('  Encontrado:', dialga.name);
  console.log('  ID:', dialga.id);
  console.log('  Tipos actuales:', dialga.types);
  console.log('  Tipos esperados: ["Steel", "Dragon"]');
} else {
  console.log('  ❌ No encontrado');
}

console.log('\n🧠 MEWTWO:');
if (mewtwo) {
  console.log('  Encontrado:', mewtwo.name);
  console.log('  ID:', mewtwo.id);
  console.log('  Tipos actuales:', mewtwo.types);
  console.log('  Tipos esperados: ["Psychic"]');
} else {
  console.log('  ❌ No encontrado');
}

// 4. Verificar algunos ejemplos de estructura de tipos
console.log('\n📋 Ejemplos de tipos en otros Pokémon:');
allPokemon.slice(0, 10).forEach(p => {
  console.log(`  ${p.name}: ${JSON.stringify(p.types)}`);
});

// 5. Para forzar actualización, ejecuta:
console.log('\n🔄 Para forzar actualización, ejecuta:');
console.log('window.pokemonDataService.refreshData().then(() => location.reload())');
