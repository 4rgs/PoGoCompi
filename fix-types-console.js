// SCRIPT PARA CONSOLA DEL NAVEGADOR
// Copia y pega todo este código en la consola del navegador

console.log('🔄 Forzando actualización con tipos corregidos...');

async function fixTypesAndRefresh() {
  try {
    // 1. Verificar que el servicio esté disponible
    if (!window.pokemonDataService) {
      console.log('❌ Servicio no disponible. Recarga la página primero.');
      return;
    }

    // 2. Limpiar cache
    console.log('🧹 Limpiando cache...');
    if (window.pokemonDataService.clearCache) {
      window.pokemonDataService.clearCache();
    }

    // 3. Forzar refresh
    console.log('📡 Actualizando datos...');
    const result = await window.pokemonDataService.refreshData();
    
    if (result.success) {
      console.log(`✅ Datos actualizados: ${result.count} Pokémon`);
      
      // 4. Verificar tipos específicos
      const allPokemon = window.pokemonDataService.getAllPokemon();
      
      // Buscar Pokémon problemáticos
      const problemCases = [
        { name: 'dialga', expectedTypes: ['Steel', 'Dragon'] },
        { name: 'mewtwo', expectedTypes: ['Psychic'] },
        { name: 'bulbasaur', expectedTypes: ['Grass', 'Poison'] },
        { name: 'charizard', expectedTypes: ['Fire', 'Flying'] }
      ];
      
      console.log('\n🎯 Verificando tipos corregidos:');
      
      problemCases.forEach(testCase => {
        const pokemon = allPokemon.find(p => 
          p.name.toLowerCase().includes(testCase.name) ||
          (p.originalName && p.originalName.toLowerCase().includes(testCase.name))
        );
        
        if (pokemon) {
          const typesMatch = Array.isArray(pokemon.types) && 
            pokemon.types.length === testCase.expectedTypes.length &&
            pokemon.types.every(type => testCase.expectedTypes.includes(type));
          
          console.log(`${typesMatch ? '✅' : '❌'} ${pokemon.name}:`);
          console.log(`   Tipos actuales: ${JSON.stringify(pokemon.types)}`);
          console.log(`   Tipos esperados: ${JSON.stringify(testCase.expectedTypes)}`);
        } else {
          console.log(`❌ ${testCase.name} no encontrado`);
        }
      });
      
      // 5. Recargar la página para aplicar los cambios
      console.log('\n🔄 Recargando página para aplicar cambios...');
      setTimeout(() => {
        location.reload();
      }, 2000);
      
    } else {
      console.log('❌ Error actualizando datos');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar automáticamente
fixTypesAndRefresh();
