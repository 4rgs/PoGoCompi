// Script para inspeccionar la estructura real de los datos de tipos de PoGoAPI
console.log('🔍 Inspeccionando estructura de datos de tipos de PoGoAPI...');

async function inspectTypesData() {
  try {
    const response = await fetch('https://pogoapi.net/api/v1/pokemon_types.json');
    const typesData = await response.json();
    
    console.log(`📊 Total de entradas de tipos: ${typesData.length}`);
    
    // Mostrar estructura de los primeros elementos
    console.log('\n🔍 Estructura de los primeros 5 elementos:');
    typesData.slice(0, 5).forEach((item, index) => {
      console.log(`\n${index + 1}. Pokémon ID ${item.pokemon_id}:`);
      console.log(`   Estructura completa:`, item);
    });
    
    // Buscar Pokémon específicos
    const testIds = [483, 150, 1, 6, 25]; // Dialga, Mewtwo, Bulbasaur, Charizard, Pikachu
    
    console.log('\n🎯 Datos de tipos para Pokémon específicos:');
    testIds.forEach(id => {
      const pokemon = typesData.find(p => p.pokemon_id === id);
      if (pokemon) {
        console.log(`\nID ${id}:`, pokemon);
      } else {
        console.log(`\nID ${id}: No encontrado`);
      }
    });
    
    // Analizar qué campos están disponibles
    console.log('\n🔑 Campos disponibles en los datos de tipos:');
    if (typesData.length > 0) {
      const sampleItem = typesData[0];
      Object.keys(sampleItem).forEach(key => {
        console.log(`  - ${key}: ${typeof sampleItem[key]} (ejemplo: ${JSON.stringify(sampleItem[key])})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error inspeccionando datos de tipos:', error);
  }
}

inspectTypesData();
