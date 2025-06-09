// Script para verificar los datos de tipos específicos en la consola del navegador
console.log('🔍 Verificando tipos de Pokémon específicos...');

// Este script se debe ejecutar en la consola del navegador
async function checkPokemonTypes() {
  try {
    // Acceder al servicio de datos desde la ventana global (si está disponible)
    const pokemonData = window.pokemonDataService?.getAllPokemon() || [];
    
    if (pokemonData.length === 0) {
      console.log('❌ No hay datos de Pokémon disponibles');
      return;
    }
    
    console.log(`📊 Total de Pokémon: ${pokemonData.length}`);
    
    // Buscar Pokémon específicos
    const testCases = [
      { name: 'Dialga', expectedTypes: ['Steel', 'Dragon'] },
      { name: 'Mewtwo', expectedTypes: ['Psychic'] },
      { name: 'Bulbasaur', expectedTypes: ['Grass', 'Poison'] },
      { name: 'Charizard', expectedTypes: ['Fire', 'Flying'] },
      { name: 'Pikachu', expectedTypes: ['Electric'] }
    ];
    
    console.log('\n🎯 Verificando tipos específicos:');
    
    testCases.forEach(testCase => {
      const pokemon = pokemonData.find(p => 
        p.name.toLowerCase().includes(testCase.name.toLowerCase()) ||
        p.originalName?.toLowerCase().includes(testCase.name.toLowerCase())
      );
      
      if (pokemon) {
        console.log(`\n📋 ${testCase.name}:`);
        console.log(`  Nombre mostrado: ${pokemon.name}`);
        console.log(`  Nombre original: ${pokemon.originalName || 'N/A'}`);
        console.log(`  ID: ${pokemon.id}`);
        console.log(`  Tipos actuales: ${JSON.stringify(pokemon.types)}`);
        console.log(`  Tipos esperados: ${JSON.stringify(testCase.expectedTypes)}`);
        
        const typesMatch = Array.isArray(pokemon.types) && 
          pokemon.types.length === testCase.expectedTypes.length &&
          pokemon.types.every(type => testCase.expectedTypes.includes(type));
          
        console.log(`  ✅ Tipos correctos: ${typesMatch ? 'SÍ' : 'NO'}`);
      } else {
        console.log(`❌ ${testCase.name} no encontrado`);
      }
    });
    
    // Verificar estructura de datos de tipos
    console.log('\n🔍 Analizando estructura de datos de tipos:');
    const samplesWithTypes = pokemonData.filter(p => p.types && p.types.length > 0).slice(0, 5);
    samplesWithTypes.forEach(pokemon => {
      console.log(`  ${pokemon.name}: ${JSON.stringify(pokemon.types)} (tipo: ${typeof pokemon.types})`);
    });
    
    const samplesWithoutTypes = pokemonData.filter(p => !p.types || p.types.length === 0).slice(0, 5);
    if (samplesWithoutTypes.length > 0) {
      console.log('\n⚠️ Pokémon sin tipos encontrados:');
      samplesWithoutTypes.forEach(pokemon => {
        console.log(`  ${pokemon.name} (ID: ${pokemon.id}): tipos = ${JSON.stringify(pokemon.types)}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error verificando tipos:', error);
  }
}

// Ejecutar automáticamente
checkPokemonTypes();
