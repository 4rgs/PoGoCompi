// Script para probar la aplicación desde la consola del navegador
console.log('🔍 Script de debugging cargado');

// Función para probar Pokémon específicos
window.testPokemon = function(pokemonName = 'Dialga') {
  console.log(`🧪 Probando datos de ${pokemonName}...`);
  
  if (window.pokemonDataService) {
    const pokemon = window.pokemonDataService.findPokemonByName(pokemonName);
    console.log('Pokemon encontrado:', pokemon);
    
    if (pokemon) {
      console.log('🎯 Tipos:', pokemon.types);
      console.log('⚔️ Ataque base:', pokemon.baseAttack);
      console.log('⚡ Movimientos rápidos:', pokemon.fastMoves);
      console.log('💫 Movimientos cargados:', pokemon.chargedMoves);
    }
  } else {
    console.log('❌ pokemonDataService no está disponible');
  }
};

// Función para probar tipos específicos
window.testTypes = function() {
  console.log('🔍 Probando sistema de tipos...');
  
  if (window.pokemonDataService) {
    const dialga = window.pokemonDataService.findPokemonByName('Dialga');
    const mewtwo = window.pokemonDataService.findPokemonByName('Mewtwo');
    
    console.log('Dialga tipos:', dialga?.types);
    console.log('Mewtwo tipos:', mewtwo?.types);
  }
};

// Función para listar todos los Pokémon disponibles
window.listPokemon = function(limit = 10) {
  console.log(`📋 Listando primeros ${limit} Pokémon...`);
  
  if (window.pokemonDataService && window.pokemonDataService.pokemon) {
    const pokemon = window.pokemonDataService.pokemon.slice(0, limit);
    pokemon.forEach(p => {
      console.log(`${p.id}: ${p.name} - ${JSON.stringify(p.types)}`);
    });
  }
};

console.log('✅ Funciones disponibles: testPokemon(), testTypes(), listPokemon()');
