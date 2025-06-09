// Script de prueba para verificar PoGoAPI
import pogoApiService from './src/services/pogoApiService.js';

async function testPoGoAPI() {
  console.log('🧪 Iniciando pruebas de PoGoAPI...\n');

  try {
    // Test 1: Obtener datos de estadísticas
    console.log('📊 Test 1: Estadísticas de Pokémon');
    const stats = await pogoApiService.getPokemonStats();
    console.log(`✅ Obtenidas ${stats.length} estadísticas de Pokémon`);
    console.log(`📝 Ejemplo: ${stats[0].pokemon_name} - Ataque: ${stats[0].base_attack}\n`);

    // Test 2: Obtener movimientos actuales
    console.log('⚡ Test 2: Movimientos actuales');
    const moves = await pogoApiService.getCurrentPokemonMoves();
    console.log(`✅ Obtenidos movimientos para ${moves.length} Pokémon`);
    console.log(`📝 Ejemplo: ${moves[0].pokemon_name} - Movimientos rápidos: ${moves[0].fast_moves.join(', ')}\n`);

    // Test 3: Obtener movimientos rápidos
    console.log('🏃 Test 3: Movimientos rápidos');
    const fastMoves = await pogoApiService.getFastMoves();
    console.log(`✅ Obtenidos ${fastMoves.length} movimientos rápidos`);
    console.log(`📝 Ejemplo: ${fastMoves[0].name} - Poder: ${fastMoves[0].power}\n`);

    // Test 4: Obtener movimientos cargados
    console.log('💥 Test 4: Movimientos cargados');
    const chargedMoves = await pogoApiService.getChargedMoves();
    console.log(`✅ Obtenidos ${chargedMoves.length} movimientos cargados`);
    console.log(`📝 Ejemplo: ${chargedMoves[0].name} - Poder: ${chargedMoves[0].power}\n`);

    // Test 5: Obtener todos los datos transformados
    console.log('🔄 Test 5: Transformación de datos');
    const allData = await pogoApiService.getAllPokemonData();
    const transformed = pogoApiService.transformPokemonData(allData);
    console.log(`✅ Transformados ${transformed.length} Pokémon para la aplicación`);
    
    if (transformed.length > 0) {
      const example = transformed[0];
      console.log(`📝 Ejemplo transformado: ${example.name}`);
      console.log(`   - Ataque base: ${example.baseAttack}`);
      console.log(`   - Tipos: ${example.types.join(', ')}`);
      console.log(`   - Movimientos rápidos: ${example.fastMoves.length}`);
      console.log(`   - Movimientos cargados: ${example.chargedMoves.length}\n`);
    }

    // Test 6: Cache status
    console.log('🗄️ Test 6: Estado del cache');
    const cacheStatus = pogoApiService.getCacheStatus();
    console.log('✅ Estado del cache:', cacheStatus);

    console.log('\n🎉 ¡Todas las pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  }
}

// Ejecutar pruebas si este archivo se ejecuta directamente
if (process.argv[1].includes('test-api.js')) {
  testPoGoAPI();
}

export { testPoGoAPI };
