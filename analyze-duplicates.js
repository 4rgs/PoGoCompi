// Script para analizar duplicados en los datos de PoGoAPI
import { PoGoAPIService } from './src/services/pogoApiService.js';

console.log('🔍 Analizando duplicados en datos de PoGoAPI...');

async function analyzeDuplicates() {
  try {
    const service = new PoGoAPIService();
    const apiData = await service.getAllPokemonData();
    
    console.log('\n📊 Análisis de datos de la API:');
    console.log(`- Stats: ${apiData.stats.length} entradas`);
    console.log(`- Moves: ${apiData.moves.length} entradas`);
    console.log(`- Types: ${apiData.types.length} entradas`);
    
    // Analizar duplicados en stats
    const nameCount = new Map();
    const idCount = new Map();
    const variations = new Map();
    
    apiData.stats.forEach(pokemon => {
      const name = pokemon.pokemon_name;
      const id = pokemon.pokemon_id;
      
      // Contar nombres
      nameCount.set(name, (nameCount.get(name) || 0) + 1);
      
      // Contar IDs
      idCount.set(id, (idCount.get(id) || 0) + 1);
      
      // Analizar variaciones
      const key = `${name}_${id}`;
      if (!variations.has(key)) {
        variations.set(key, []);
      }
      variations.get(key).push({
        pokemon_id: pokemon.pokemon_id,
        pokemon_name: pokemon.pokemon_name,
        form: pokemon.form || 'Normal',
        base_attack: pokemon.base_attack,
        base_defense: pokemon.base_defense,
        base_stamina: pokemon.base_stamina
      });
    });
    
    console.log('\n🔄 Nombres duplicados:');
    let duplicateCount = 0;
    for (const [name, count] of nameCount.entries()) {
      if (count > 1) {
        duplicateCount++;
        console.log(`  ${name}: ${count} versiones`);
        
        // Mostrar detalles de las versiones
        const pokemonVersions = apiData.stats.filter(p => p.pokemon_name === name);
        pokemonVersions.forEach((pokemon, index) => {
          console.log(`    ${index + 1}. ID: ${pokemon.pokemon_id}, Form: ${pokemon.form || 'Normal'}, ATK: ${pokemon.base_attack}, DEF: ${pokemon.base_defense}`);
        });
        console.log('');
      }
    }
    
    console.log(`📈 Total de nombres con duplicados: ${duplicateCount}`);
    
    // Analizar formas específicas
    console.log('\n🎭 Análisis de formas:');
    const formsFound = new Set();
    apiData.stats.forEach(pokemon => {
      if (pokemon.form && pokemon.form !== 'Normal') {
        formsFound.add(pokemon.form);
      }
    });
    
    console.log(`Formas encontradas: ${Array.from(formsFound).join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

analyzeDuplicates();
