// Script para analizar duplicados en los datos de PoGoAPI
const POGO_API_BASE = 'https://pogoapi.net/api/v1';

console.log('🔍 Analizando duplicados en datos de PoGoAPI...');

async function fetchAPI(endpoint) {
  try {
    console.log(`Fetching: ${endpoint}`);
    const response = await fetch(`${POGO_API_BASE}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

async function analyzeDuplicates() {
  try {
    // Obtener datos de stats
    const stats = await fetchAPI('/pokemon_stats.json');
    if (!stats) return;
    
    console.log(`\n📊 Analizando ${stats.length} Pokémon...`);
    
    // Analizar duplicados por nombre
    const nameGroups = new Map();
    
    stats.forEach(pokemon => {
      const name = pokemon.pokemon_name;
      if (!nameGroups.has(name)) {
        nameGroups.set(name, []);
      }
      nameGroups.get(name).push(pokemon);
    });
    
    console.log('\n🔄 Pokémon con múltiples formas/versiones:');
    let duplicateCount = 0;
    
    for (const [name, variants] of nameGroups.entries()) {
      if (variants.length > 1) {
        duplicateCount++;
        console.log(`\n  📛 ${name} (${variants.length} versiones):`);
        
        variants.forEach((pokemon, index) => {
          const form = pokemon.form || 'Normal';
          const costume = pokemon.costume || '';
          const shadow = pokemon.pokemon_name.includes('Shadow') ? 'Shadow' : '';
          const purified = pokemon.pokemon_name.includes('Purified') ? 'Purified' : '';
          
          console.log(`    ${index + 1}. ID: ${pokemon.pokemon_id}, Form: ${form}${costume ? `, Costume: ${costume}` : ''}${shadow ? `, Type: ${shadow}` : ''}${purified ? `, Type: ${purified}` : ''}`);
          console.log(`       Stats: ATK ${pokemon.base_attack}, DEF ${pokemon.base_defense}, STA ${pokemon.base_stamina}`);
        });
      }
    }
    
    console.log(`\n📈 Total de nombres con variaciones: ${duplicateCount}`);
    
    // Buscar patrones específicos
    console.log('\n🎭 Patrones encontrados:');
    const patterns = {
      shadow: stats.filter(p => p.pokemon_name.toLowerCase().includes('shadow')).length,
      purified: stats.filter(p => p.pokemon_name.toLowerCase().includes('purified')).length,
      mega: stats.filter(p => p.pokemon_name.toLowerCase().includes('mega')).length,
      alolan: stats.filter(p => p.form && p.form.toLowerCase().includes('alola')).length,
      galarian: stats.filter(p => p.form && p.form.toLowerCase().includes('galar')).length,
      hisuian: stats.filter(p => p.form && p.form.toLowerCase().includes('hisui')).length
    };
    
    Object.entries(patterns).forEach(([pattern, count]) => {
      if (count > 0) {
        console.log(`  ${pattern}: ${count} Pokémon`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

analyzeDuplicates();
