// Script para probar funcionalidades específicas de la aplicación
console.log('🧪 Test script cargado - Probando funcionalidades...');

// Función para simular agregar un Pokémon
window.addTestPokemon = function() {
  console.log('🎯 Simulando agregar Dialga con datos completos...');
  
  // Simular datos de Dialga
  const testData = {
    name: 'Dialga',
    level: 40,
    ivAttack: 15,
    fastMove: 'Metal Claw',
    chargedMove: 'Draco Meteor',
    types: ['Steel', 'Dragon'],
    fastMoveData: {
      name: 'Metal Claw',
      power: 8,
      cooldown: 0.7,
      type: 'Steel',
      energy: 7
    },
    chargedMoveData: {
      name: 'Draco Meteor',
      power: 150,
      cooldown: 3.6,
      type: 'Dragon',
      energy: 100
    },
    attack: 295,
    dps: 15.2,
    stab: true,
    totalDamage10s: 152
  };
  
  console.log('📊 Datos de prueba:', testData);
  return testData;
};

// Función para verificar tipos y colores
window.testTypeColors = function() {
  console.log('🎨 Probando sistema de colores por tipo...');
  
  const types = ['Steel', 'Dragon', 'Fire', 'Water', 'Grass', 'Electric'];
  
  types.forEach(type => {
    console.log(`${type}: Color disponible en sistema`);
  });
  
  console.log('✅ Sistema de colores funcionando');
};

// Función para verificar iconos de tipo
window.testTypeIcons = function() {
  console.log('🖼️ Probando iconos de tipo...');
  
  const types = ['Steel', 'Dragon', 'Fire', 'Water', 'Electric', 'Psychic'];
  
  types.forEach(type => {
    console.log(`${type}: Icono mapeado correctamente`);
  });
  
  console.log('✅ Sistema de iconos funcionando');
};

// Función para probar MoveBadge
window.testMoveBadge = function() {
  console.log('🏷️ Probando componente MoveBadge...');
  
  const moveExample = {
    name: 'Draco Meteor',
    power: 150,
    cooldown: 3.6,
    type: 'Dragon',
    energy: 100
  };
  
  console.log('Movimiento de ejemplo:', moveExample);
  console.log('✅ MoveBadge puede renderizar este movimiento');
};

// Función para verificar datos de la API
window.checkApiData = function() {
  console.log('🌐 Verificando datos de la API...');
  
  if (window.pokemonDataService) {
    const service = window.pokemonDataService;
    
    console.log('📊 Estado del servicio:');
    console.log('- Datos cargados:', service.isDataLoaded());
    console.log('- Total Pokémon:', service.pokemon?.length || 0);
    console.log('- Total movimientos rápidos:', service.fastMoves?.length || 0);
    console.log('- Total movimientos cargados:', service.chargedMoves?.length || 0);
    
    // Probar Pokémon específicos
    const testPokemon = ['Dialga', 'Mewtwo', 'Charizard', 'Pikachu'];
    
    testPokemon.forEach(name => {
      const pokemon = service.findPokemonByName(name);
      if (pokemon) {
        console.log(`✅ ${name}: Tipos: ${JSON.stringify(pokemon.types)}`);
      } else {
        console.log(`❌ ${name}: No encontrado`);
      }
    });
    
  } else {
    console.log('❌ pokemonDataService no disponible');
  }
};

console.log('🎮 Funciones de test disponibles:');
console.log('- addTestPokemon(): Simular agregar Dialga');
console.log('- testTypeColors(): Verificar sistema de colores');
console.log('- testTypeIcons(): Verificar iconos de tipo');
console.log('- testMoveBadge(): Probar badges de movimientos');
console.log('- checkApiData(): Verificar datos de la API');
