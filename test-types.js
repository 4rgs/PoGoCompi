// Test script para verificar que los tipos de Pokémon se están cargando correctamente
import { PoGoAPIService } from './src/services/pogoApiService.js';

console.log('🧪 Iniciando prueba de tipos de Pokémon...');

async function testTypesLoading() {
  try {
    console.log('📡 Cargando datos de la API...');
    
    // Probar el servicio de API
    const service = new PoGoAPIService();
    
    // Obtener algunos Pokémon para verificar los tipos
    const testPokemonIds = [1, 4, 7, 25, 150]; // Bulbasaur, Charmander, Squirtle, Pikachu, Mewtwo
    
    for (const id of testPokemonIds) {
      const pokemon = await service.getPokemonById(id);
      if (pokemon) {
        console.log(`\n🎮 ${pokemon.pokemon_name} (#${pokemon.pokemon_id}):`)
        console.log(`  📊 Stats: ATK ${pokemon.base_attack}, DEF ${pokemon.base_defense}, STA ${pokemon.base_stamina}`);
        console.log(`  🏷️ Tipos: ${pokemon.types || 'No disponible'}`);
        console.log(`  🔢 Tipo 1: ${pokemon.type_1 || 'N/A'}, Tipo 2: ${pokemon.type_2 || 'N/A'}`);
      } else {
        console.log(`❌ No se encontró Pokémon con ID ${id}`);
      }
    }
    
    console.log('\n✅ Prueba completada');
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

testTypesLoading();
