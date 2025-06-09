// Script para ejecutar en la consola del navegador para forzar actualización y verificar tipos
console.log('🔄 Forzando actualización de datos y verificando tipos...');

// Este script debe ejecutarse en la consola del navegador cuando la aplicación esté cargada
async function forceRefreshAndCheckTypes() {
  try {
    // Limpiar cache del servicio PoGoAPI
    if (window.pokemonDataService) {
      console.log('🧹 Limpiando cache...');
      
      // Forzar refresh de datos
      console.log('📡 Forzando actualización desde API...');
      const result = await window.pokemonDataService.refreshData();
      
      if (result.success) {
        console.log(`✅ Datos actualizados: ${result.count} Pokémon desde ${result.source}`);
        
        // Verificar tipos específicos
        const pokemonData = window.pokemonDataService.getAllPokemon();
        
        console.log('\n🔍 Verificando tipos específicos:');
        
        // Buscar Dialga
        const dialga = pokemonData.find(p => p.originalName?.toLowerCase().includes('dialga') || p.name.toLowerCase().includes('dialga'));
        if (dialga) {
          console.log(`🐉 Dialga encontrado:`);
          console.log(`  Nombre: ${dialga.name}`);
          console.log(`  ID: ${dialga.id}`);
          console.log(`  Tipos: ${JSON.stringify(dialga.types)}`);
          console.log(`  Debería ser: ["Steel", "Dragon"]`);
        } else {
          console.log('❌ Dialga no encontrado');
        }
        
        // Buscar Mewtwo
        const mewtwo = pokemonData.find(p => p.originalName?.toLowerCase().includes('mewtwo') || p.name.toLowerCase().includes('mewtwo'));
        if (mewtwo) {
          console.log(`🧠 Mewtwo encontrado:`);
          console.log(`  Nombre: ${mewtwo.name}`);
          console.log(`  ID: ${mewtwo.id}`);
          console.log(`  Tipos: ${JSON.stringify(mewtwo.types)}`);
          console.log(`  Debería ser: ["Psychic"]`);
        } else {
          console.log('❌ Mewtwo no encontrado');
        }
        
        // Verificar algunos Pokémon con tipos conocidos
        const knownTypes = [
          { name: 'bulbasaur', expected: ['Grass', 'Poison'] },
          { name: 'charizard', expected: ['Fire', 'Flying'] },
          { name: 'pikachu', expected: ['Electric'] }
        ];
        
        console.log('\n🎯 Verificando otros Pokémon conocidos:');
        knownTypes.forEach(test => {
          const pokemon = pokemonData.find(p => 
            (p.originalName?.toLowerCase().includes(test.name)) || 
            (p.name.toLowerCase().includes(test.name))
          );
          
          if (pokemon) {
            const typesMatch = Array.isArray(pokemon.types) && 
              pokemon.types.length === test.expected.length &&
              pokemon.types.every(type => test.expected.includes(type));
              
            console.log(`  ${pokemon.name}: ${JSON.stringify(pokemon.types)} ${typesMatch ? '✅' : '❌'}`);
          }
        });
        
      } else {
        console.log('❌ Error actualizando datos');
      }
    } else {
      console.log('❌ Servicio pokemonDataService no disponible en window');
    }
  } catch (error) {
    console.error('❌ Error en verificación:', error);
  }
}

// Hacer el servicio disponible globalmente para debugging
if (typeof window !== 'undefined' && !window.pokemonDataService) {
  console.log('💡 Para usar este script, asegúrate de que pokemonDataService esté disponible globalmente');
  console.log('💡 Puedes ejecutar: window.pokemonDataService = pokemonDataService; en la consola primero');
}

// Mostrar instrucciones
console.log('\n📋 Para ejecutar la verificación, usa:');
console.log('forceRefreshAndCheckTypes()');

// Exportar función para uso global
if (typeof window !== 'undefined') {
  window.forceRefreshAndCheckTypes = forceRefreshAndCheckTypes;
}
