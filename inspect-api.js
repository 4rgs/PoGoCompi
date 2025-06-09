// Script para inspeccionar la estructura de datos de la API
const POGO_API_BASE = 'https://pogoapi.net/api/v1';

(async () => {
  try {
    console.log('🔍 Inspeccionando estructura directa de PoGoAPI...\n');
    
    // Probar endpoint de stats
    console.log('📊 Probando /pokemon_stats.json...');
    const statsResponse = await fetch(`${POGO_API_BASE}/pokemon_stats.json`);
    const stats = await statsResponse.json();
    console.log(`Recibidos ${stats.length} elementos`);
    console.log('Primer elemento:', JSON.stringify(stats[0], null, 2));
    console.log('Campos:', Object.keys(stats[0] || {}));
    
    console.log('\n---\n');
    
    // Probar endpoint de moves
    console.log('⚡ Probando /current_pokemon_moves.json...');
    const movesResponse = await fetch(`${POGO_API_BASE}/current_pokemon_moves.json`);
    const moves = await movesResponse.json();
    console.log(`Recibidos ${moves.length} elementos`);
    console.log('Primer elemento:', JSON.stringify(moves[0], null, 2));
    console.log('Campos:', Object.keys(moves[0] || {}));
    
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
