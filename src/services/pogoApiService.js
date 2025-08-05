// PoGoAPI Service - Integración con la API de PoGoAPI.net
import { getPokemonTypesWithFallback } from '../utils/pokemonTypesFallback.js';

const POGO_API_BASE = 'https://pogoapi.net/api/v1';

class PoGoAPIService {
  constructor() {
    // Cache para mejorar el rendimiento
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.hashCache = new Map(); // Cache para hashes de archivos
    this.CACHE_DURATION = 60 * 60 * 1000; // 1 hora en milisegundos
    this.HASH_CHECK_INTERVAL = 5 * 60 * 1000; // Verificar hashes cada 5 minutos
    this.lastHashCheck = 0;

    // Mapeo de endpoints a nombres de archivos en la API de hashes
    this.endpointFileMap = {
      '/pokemon_stats.json': 'pokemon_stats.json',
      '/current_pokemon_moves.json': 'current_pokemon_moves.json',
      '/fast_moves.json': 'fast_moves.json',
      '/charged_moves.json': 'charged_moves.json',
      '/pokemon_types.json': 'pokemon_types.json',
      '/shadow_pokemon.json': 'shadow_pokemon.json',
      '/mega_pokemon.json': 'mega_pokemon.json',
      '/pokemon_forms.json': 'pokemon_forms.json'
    };

    // Hashes actuales de los archivos almacenados
    this.currentHashes = new Map();
  }

  // Obtener hashes actuales de todos los archivos de la API
  async getApiHashes() {
    try {
      console.log('🔄 Obteniendo hashes de la API...');
      const response = await fetch(`${POGO_API_BASE}/api_hashes.json`);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      const hashData = await response.json();
      console.log(`✅ Hashes obtenidos para ${Object.keys(hashData).length} archivos`);
      return hashData;
    } catch (error) {
      console.error('❌ Error obteniendo hashes de la API:', error);
      throw error;
    }
  }

  // Verificar si necesitamos actualizar datos basado en hashes
  async shouldUpdateData(endpoint) {
    const now = Date.now();

    // Solo verificar hashes cada cierto intervalo para no sobrecargar la API
    if (now - this.lastHashCheck < this.HASH_CHECK_INTERVAL) {
      // Si tenemos datos en cache y no han expirado, usarlos
      if (this.cache.has(endpoint) && this.cacheExpiry.get(endpoint) > now) {
        return false;
      }
      // Si no tenemos datos o expiraron, pero estamos dentro del intervalo de hash check, usar cache expirado si existe
      return !this.cache.has(endpoint);
    }

    try {
      const fileName = this.endpointFileMap[endpoint];
      if (!fileName) {
        console.warn(`⚠️ No se encontró mapeo para endpoint ${endpoint}`);
        return !this.cache.has(endpoint);
      }

      // Obtener hashes actuales
      const apiHashes = await this.getApiHashes();
      this.lastHashCheck = now;

      if (!apiHashes[fileName]) {
        console.warn(`⚠️ No se encontró hash para archivo ${fileName}`);
        return !this.cache.has(endpoint);
      }

      const currentHash = apiHashes[fileName].hash_sha256;
      const storedHash = this.currentHashes.get(endpoint);

      // Si el hash cambió o no tenemos hash almacenado, necesitamos actualizar
      if (!storedHash || storedHash !== currentHash) {
        console.log(`🔄 Hash cambió para ${fileName}: ${storedHash?.substring(0, 8) || 'ninguno'} -> ${currentHash.substring(0, 8)}`);
        this.currentHashes.set(endpoint, currentHash);
        return true;
      }

      console.log(`✅ Hash no cambió para ${fileName}, datos actualizados`);
      return false;
    } catch (error) {
      console.error(`❌ Error verificando hashes para ${endpoint}:`, error);
      // En caso de error, verificar si tenemos datos en cache
      return !this.cache.has(endpoint);
    }
  }

  // Función genérica para fetch con cache inteligente basado en hashes
  async fetchWithCache(endpoint) {
    const now = Date.now();

    // Verificar si necesitamos actualizar basado en hashes
    const shouldUpdate = await this.shouldUpdateData(endpoint);

    // Si no necesitamos actualizar y tenemos datos válidos, usar cache
    if (!shouldUpdate && this.cache.has(endpoint)) {
      console.log(`📦 Cache hit para ${endpoint} (hash verificado)`);
      // Actualizar tiempo de expiración para indicar que los datos son frescos
      this.cacheExpiry.set(endpoint, now + this.CACHE_DURATION);
      return this.cache.get(endpoint);
    }

    try {
      console.log(`🌐 Fetching from PoGoAPI: ${endpoint} (datos actualizados necesarios)`);
      const response = await fetch(`${POGO_API_BASE}${endpoint}`);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      // Guardar en cache
      this.cache.set(endpoint, data);
      this.cacheExpiry.set(endpoint, now + this.CACHE_DURATION);

      console.log(`✅ Datos frescos guardados en cache para ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`❌ Error fetching ${endpoint}:`, error);

      // Si hay error y tenemos datos en cache (aunque expirados), usarlos
      if (this.cache.has(endpoint)) {
        console.warn(`⚠️ Usando datos expirados del cache para ${endpoint} debido a error de red`);
        return this.cache.get(endpoint);
      }

      throw error;
    }
  }

  // Forzar actualización de cache (útil para debugging o actualizaciones manuales)
  async forceRefresh(endpoint = null) {
    if (endpoint) {
      console.log(`🔄 Forzando actualización para ${endpoint}`);
      this.cache.delete(endpoint);
      this.cacheExpiry.delete(endpoint);
      this.currentHashes.delete(endpoint);
      this.lastHashCheck = 0; // Forzar verificación de hash
      return await this.fetchWithCache(endpoint);
    } else {
      console.log('🔄 Forzando actualización de todo el cache');
      this.cache.clear();
      this.cacheExpiry.clear();
      this.currentHashes.clear();
      this.lastHashCheck = 0;
      return await this.getAllPokemonData();
    }
  }

  // Obtener información del estado del cache
  getCacheStatus() {
    const status = {
      totalEndpoints: Object.keys(this.endpointFileMap).length,
      cachedEndpoints: this.cache.size,
      hashesStored: this.currentHashes.size,
      lastHashCheck: this.lastHashCheck ? new Date(this.lastHashCheck).toISOString() : 'nunca',
      timeSinceLastHashCheck: this.lastHashCheck ? Date.now() - this.lastHashCheck : null,
      cacheDetails: {}
    };

    // Detalles de cada endpoint
    for (const [endpoint, fileName] of Object.entries(this.endpointFileMap)) {
      const cached = this.cache.has(endpoint);
      const expires = this.cacheExpiry.get(endpoint);
      const hash = this.currentHashes.get(endpoint);

      status.cacheDetails[fileName] = {
        cached,
        expires: expires ? new Date(expires).toISOString() : null,
        expired: expires ? Date.now() > expires : true,
        hash: hash ? hash.substring(0, 12) + '...' : null
      };
    }

    return status;
  }

  // Obtener estadísticas base de Pokémon
  async getPokemonStats() {
    return await this.fetchWithCache('/pokemon_stats.json');
  }

  // Obtener movimientos actuales de Pokémon
  async getCurrentPokemonMoves() {
    return await this.fetchWithCache('/current_pokemon_moves.json');
  }

  // Obtener datos de movimientos rápidos
  async getFastMoves() {
    return await this.fetchWithCache('/fast_moves.json');
  }

  // Obtener datos de movimientos cargados
  async getChargedMoves() {
    return await this.fetchWithCache('/charged_moves.json');
  }

  // Obtener tipos de Pokémon
  async getPokemonTypes() {
    return await this.fetchWithCache('/pokemon_types.json');
  }

  // ====== MÉTODOS PARA FORMAS ESPECÍFICAS ======

  // Obtener datos de Pokémon Shadow
  async getShadowPokemon() {
    return await this.fetchWithCache('/shadow_pokemon.json');
  }

  // Obtener datos de Mega evoluciones
  async getMegaPokemon() {
    return await this.fetchWithCache('/mega_pokemon.json');
  }

  // Obtener todas las formas de Pokémon
  async getPokemonForms() {
    return await this.fetchWithCache('/pokemon_forms.json');
  }

  // Obtener todos los datos necesarios de una vez (incluyendo formas)
  async getAllPokemonData() {
    try {
      const [stats, moves, fastMoves, chargedMoves, types, shadowPokemon, megaPokemon, pokemonForms] = await Promise.all([
        this.getPokemonStats(),
        this.getCurrentPokemonMoves(),
        this.getFastMoves(),
        this.getChargedMoves(),
        this.getPokemonTypes(),
        this.getShadowPokemon().catch(() => null), // No falla si no hay datos
        this.getMegaPokemon().catch(() => null),   // No falla si no hay datos
        this.getPokemonForms().catch(() => null)   // No falla si no hay datos
      ]);

      return {
        stats,
        moves,
        fastMoves,
        chargedMoves,
        types,
        shadowPokemon,
        megaPokemon,
        pokemonForms
      };
    } catch (error) {
      console.error('Error obteniendo datos de PoGoAPI:', error);
      throw error;
    }
  }

  // Transformar los datos de la API al formato usado por la aplicación
  transformPokemonData(apiData) {
    console.log('🔄 Iniciando transformación de datos...');
    const { stats, moves, fastMoves, chargedMoves, types, shadowPokemon, megaPokemon, pokemonForms } = apiData;

    console.log(`📊 Datos recibidos:
      - Estadísticas: ${stats.length} Pokémon
      - Movimientos: ${moves.length} Pokémon
      - Movimientos rápidos: ${fastMoves.length}
      - Movimientos cargados: ${chargedMoves.length}
      - Tipos: ${types.length} Pokémon`);

    // Log de algunos ejemplos de tipos para debugging
    console.log('🔍 Ejemplos de estructura de tipos:');
    types.slice(0, 3).forEach((pokemon, index) => {
      console.log(`  ${index + 1}. ID ${pokemon.pokemon_id}:`, pokemon);
    });

    // Crear mapas para búsqueda rápida
    const fastMovesMap = new Map();
    fastMoves.forEach(move => {
      fastMovesMap.set(move.name, {
        name: move.name,
        power: move.power,
        cooldown: move.duration / 1000, // Convertir de ms a segundos
        type: move.type,
        energy: move.energy_delta
      });
    });

    const chargedMovesMap = new Map();
    chargedMoves.forEach(move => {
      chargedMovesMap.set(move.name, {
        name: move.name,
        power: move.power,
        cooldown: move.duration / 1000, // Convertir de ms a segundos
        type: move.type,
        energy: Math.abs(move.energy_delta) // Convertir a positivo
      });
    });

    const typesMap = new Map();
    types.forEach(pokemon => {
      const pokemonTypes = [];

      // Manejar diferentes estructuras posibles de la API
      if (pokemon.type_1) {
        pokemonTypes.push(pokemon.type_1);
      }
      if (pokemon.type_2 && pokemon.type_2 !== pokemon.type_1) {
        pokemonTypes.push(pokemon.type_2);
      }

      // Fallback si usa estructura diferente
      if (pokemonTypes.length === 0 && pokemon.type) {
        if (Array.isArray(pokemon.type)) {
          pokemonTypes.push(...pokemon.type);
        } else {
          pokemonTypes.push(pokemon.type);
        }
      }

      // Fallback adicional si usa estructura como "types"
      if (pokemonTypes.length === 0 && pokemon.types) {
        if (Array.isArray(pokemon.types)) {
          pokemonTypes.push(...pokemon.types);
        }
      }

      typesMap.set(pokemon.pokemon_id, pokemonTypes);
    });

    const movesMap = new Map();
    moves.forEach(pokemon => {
      movesMap.set(pokemon.pokemon_id, {
        fastMoves: pokemon.fast_moves,
        chargedMoves: pokemon.charged_moves
      });
    });

    // Transformar datos de estadísticas a formato de la aplicación
    const transformedPokemon = stats.map(pokemon => {
      const pokemonMoves = movesMap.get(pokemon.pokemon_id) || { fastMoves: [], chargedMoves: [] };
      const apiTypes = typesMap.get(pokemon.pokemon_id) || [];

      // Usar fallback para tipos si la API no tiene datos completos
      const pokemonTypes = getPokemonTypesWithFallback(pokemon.pokemon_id, apiTypes);

      // Generar nombre con descriptor si es necesario
      const displayName = this.generateDisplayName(pokemon);

      // Obtener datos de imagen
      const imageData = this.generatePokemonImageUrl(pokemon);

      // Verificar si hay estadísticas especiales para Mega evoluciones
      const megaStats = this.getMegaStats(pokemon, megaPokemon);
      const isShadow = this.isShadowPokemon(pokemon, shadowPokemon);

      return {
        id: pokemon.pokemon_id,
        name: displayName,
        originalName: pokemon.pokemon_name,
        baseAttack: megaStats?.base_attack || parseInt(pokemon.base_attack),
        baseDefense: megaStats?.base_defense || parseInt(pokemon.base_defense),
        baseStamina: megaStats?.base_stamina || parseInt(pokemon.base_stamina),
        types: pokemonTypes,
        form: pokemon.form,
        costume: pokemon.costume,
        // Datos de imagen
        imageUrl: imageData.primary,
        imageFallback: imageData.fallback,
        isSpecialForm: imageData.isSpecialForm,
        // Datos especiales
        isShadow: isShadow,
        isMega: megaStats !== null,
        shadowBonus: isShadow ? { attack: 1.2, defense: 0.833 } : null,
        fastMoves: pokemonMoves.fastMoves
          .map(moveName => fastMovesMap.get(moveName))
          .filter(Boolean), // Filtrar movimientos no encontrados
        chargedMoves: pokemonMoves.chargedMoves
          .map(moveName => chargedMovesMap.get(moveName))
          .filter(Boolean) // Filtrar movimientos no encontrados
      };
    });

    console.log(`✅ Transformación completada: ${transformedPokemon.length} Pokémon listos`);

    // Log específico para verificar el sistema de fallback
    let fallbackUsedCount = 0;
    const problemPokemon = [483, 150, 1, 6]; // Dialga, Mewtwo, Bulbasaur, Charizard

    console.log('\n🔍 Verificando tipos con sistema de fallback:');
    problemPokemon.forEach(id => {
      const pokemon = transformedPokemon.find(p => p.id === id);
      if (pokemon) {
        const apiTypes = typesMap.get(id) || [];
        const usedFallback = !apiTypes || apiTypes.length === 0;
        if (usedFallback) fallbackUsedCount++;

        console.log(`${usedFallback ? '🔄' : '📡'} ${pokemon.originalName} (ID: ${id}):`);
        console.log(`   API tipos: ${JSON.stringify(apiTypes)}`);
        console.log(`   Tipos finales: ${JSON.stringify(pokemon.types)}`);
        console.log(`   Fuente: ${usedFallback ? 'Fallback' : 'API'}`);
      }
    });

    console.log(`\n📊 Estadísticas: ${fallbackUsedCount}/${problemPokemon.length} usando fallback`);

    // Post-procesar para manejar duplicados restantes
    const finalPokemon = this.handleRemainingDuplicates(transformedPokemon);

    // Log de ejemplo del primer Pokémon transformado
    if (finalPokemon.length > 0) {
      const example = finalPokemon[0];
      console.log(`📝 Ejemplo: ${example.name} - ${example.fastMoves.length} movimientos rápidos, ${example.chargedMoves.length} cargados`);
    }

    return finalPokemon;
  }

  // ====== FUNCIONES AUXILIARES PARA FORMAS ESPECIALES ======

  // Obtener estadísticas especiales para Mega evoluciones
  getMegaStats(pokemon, megaPokemonData) {
    if (!megaPokemonData || !Array.isArray(megaPokemonData)) {
      return null;
    }

    const name = (pokemon.pokemon_name || '').toLowerCase();
    const isMega = name.includes('mega');

    if (!isMega) {
      return null;
    }

    // Buscar en los datos de Mega evoluciones
    const megaEntry = megaPokemonData.find(mega => {
      const megaName = (mega.pokemon_name || mega.name || '').toLowerCase();
      return megaName === name || mega.pokemon_id === pokemon.pokemon_id;
    });

    if (megaEntry) {
      return {
        base_attack: parseInt(megaEntry.base_attack || megaEntry.attack),
        base_defense: parseInt(megaEntry.base_defense || megaEntry.defense),
        base_stamina: parseInt(megaEntry.base_stamina || megaEntry.stamina || megaEntry.hp)
      };
    }

    return null;
  }

  // Verificar si un Pokémon es Shadow
  isShadowPokemon(pokemon, shadowPokemonData) {
    const name = (pokemon.pokemon_name || '').toLowerCase();

    // Verificar por nombre
    if (name.includes('shadow')) {
      return true;
    }

    // Verificar en los datos de Shadow Pokemon si están disponibles
    if (shadowPokemonData && Array.isArray(shadowPokemonData)) {
      return shadowPokemonData.some(shadow =>
        shadow.pokemon_id === pokemon.pokemon_id ||
        (shadow.pokemon_name || '').toLowerCase() === name
      );
    }

    return false;
  }

  // Método principal para obtener datos transformados
  async getPokemonDataForApp() {
    try {
      const apiData = await this.getAllPokemonData();
      const transformedData = this.transformPokemonData(apiData);

      console.log(`Datos transformados: ${transformedData.length} Pokémon cargados`);
      return transformedData;
    } catch (error) {
      console.error('Error obteniendo datos para la aplicación:', error);
      throw error;
    }
  }

  // Limpiar cache manualmente si es necesario
  clearCache() {
    this.cache.clear();
    this.cacheExpiry.clear();
    console.log('Cache limpiado');
  }

  // Obtener estado del cache
  getCacheStatus() {
    const now = Date.now();
    const status = {};

    for (const [key, expiry] of this.cacheExpiry.entries()) {
      status[key] = {
        cached: this.cache.has(key),
        expired: expiry <= now,
        expiresIn: Math.max(0, expiry - now)
      };
    }

    return status;
  }

  // Generar nombre descriptivo para Pokémon con variaciones
  generateDisplayName(pokemon) {
    let name = pokemon.pokemon_name;
    const descriptors = [];

    // Detectar Shadow Pokémon
    if (name.toLowerCase().includes('shadow')) {
      descriptors.push('Sombra');
      name = name.replace(/shadow\s*/gi, '').trim();
    }

    // Detectar Purified Pokémon
    if (name.toLowerCase().includes('purified')) {
      descriptors.push('Purificado');
      name = name.replace(/purified\s*/gi, '').trim();
    }

    // Detectar Mega evoluciones
    if (name.toLowerCase().includes('mega')) {
      if (name.toLowerCase().includes('mega x')) {
        descriptors.push('Mega X');
        name = name.replace(/mega\s*x\s*/gi, '').trim();
      } else if (name.toLowerCase().includes('mega y')) {
        descriptors.push('Mega Y');
        name = name.replace(/mega\s*y\s*/gi, '').trim();
      } else {
        descriptors.push('Mega');
        name = name.replace(/mega\s*/gi, '').trim();
      }
    }

    // Detectar formas regionales
    if (pokemon.form) {
      const form = pokemon.form.toLowerCase();
      if (form.includes('alola')) {
        descriptors.push('Alola');
      } else if (form.includes('galar')) {
        descriptors.push('Galar');
      } else if (form.includes('hisui')) {
        descriptors.push('Hisui');
      } else if (form.includes('paldea')) {
        descriptors.push('Paldea');
      } else if (form !== 'normal' && form !== '') {
        // Para otras formas, usar el nombre de la forma
        descriptors.push(pokemon.form);
      }
    }

    // Detectar disfraces/costumes
    if (pokemon.costume && pokemon.costume !== 'normal' && pokemon.costume !== '') {
      descriptors.push(pokemon.costume);
    }

    // Construir nombre final
    if (descriptors.length > 0) {
      return `${name} - ${descriptors.join(', ')}`;
    }

    return name;
  }

  // ====== SISTEMA DE IMÁGENES ======

  // Generar URL de imagen para un Pokémon con su forma específica
  generatePokemonImageUrl(pokemon) {
    let pokemonId = pokemon.pokemon_id || pokemon.id;

    // Mapeo de URLs de imágenes alternativas más confiables
    const imageUrls = {
      // Repositorio oficial de sprites de Pokémon (más confiable)
      primary: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
      // Alternativa desde Pokémon GO Hub
      secondary: `https://assets.pokemon.com/assets/cms2/img/pokedex/detail/${String(pokemonId).padStart(3, '0')}.png`,
      // Última alternativa - placeholder local
      fallback: `https://via.placeholder.com/128x128/4A90E2/FFFFFF?text=${pokemonId}`
    };

    // Para formas especiales, usar la imagen base pero marcar como forma especial
    // (Las imágenes específicas de formas son limitadas en repositorios públicos)

    return {
      primary: imageUrls.primary,
      secondary: imageUrls.secondary,
      fallback: imageUrls.fallback,
      isSpecialForm: this.isSpecialForm(pokemon)
    };
  }

  // Verificar si un Pokémon tiene una forma especial (para mostrar badges)
  isSpecialForm(pokemon) {
    const name = (pokemon.pokemon_name || pokemon.name || '').toLowerCase();
    const form = (pokemon.form || '').toLowerCase();

    return (
      name.includes('shadow') ||
      name.includes('mega') ||
      name.includes('purified') ||
      form.includes('alola') ||
      form.includes('galar') ||
      form.includes('hisui') ||
      form.includes('paldea')
    );
  }

  // Manejar duplicados restantes que no fueron resueltos por descriptores de forma
  handleRemainingDuplicates(pokemonList) {
    const nameGroups = new Map();

    // Agrupar por nombre
    pokemonList.forEach(pokemon => {
      const name = pokemon.name;
      if (!nameGroups.has(name)) {
        nameGroups.set(name, []);
      }
      nameGroups.get(name).push(pokemon);
    });

    const result = [];

    // Procesar cada grupo
    for (const [name, group] of nameGroups.entries()) {
      if (group.length === 1) {
        // Sin duplicados, agregar tal como está
        result.push(group[0]);
      } else {
        // Hay duplicados, necesitamos diferenciarlos
        console.log(`🔄 Resolviendo ${group.length} duplicados para: ${name}`);

        // Ordenar por ID para consistencia
        group.sort((a, b) => a.id - b.id);

        // Detectar diferencias
        const hasStatsDifferences = this.hasStatsDifferences(group);
        const hasMovesDifferences = this.hasMovesDifferences(group);

        group.forEach((pokemon, index) => {
          let finalName = pokemon.name;
          const descriptors = [];

          // Si hay diferencias significativas, agregar identificadores
          if (hasStatsDifferences || hasMovesDifferences) {
            // Agregar identificador por estadísticas si son muy diferentes
            if (hasStatsDifferences) {
              const attackTier = pokemon.baseAttack > 200 ? 'Alto ATK' : pokemon.baseAttack < 150 ? 'Bajo ATK' : 'Med ATK';
              descriptors.push(attackTier);
            }

            // Agregar número de versión si es necesario
            if (descriptors.length === 0) {
              descriptors.push(`V${index + 1}`);
            }
          }

          if (descriptors.length > 0) {
            finalName = `${pokemon.name} (${descriptors.join(', ')})`;
          }

          result.push({
            ...pokemon,
            name: finalName
          });
        });
      }
    }

    console.log(`📋 Procesamiento de duplicados completado: ${result.length} Pokémon únicos`);
    return result;
  }

  // Verificar si hay diferencias significativas en estadísticas
  hasStatsDifferences(group) {
    if (group.length < 2) return false;

    const firstStats = group[0];
    return group.some(pokemon =>
      Math.abs(pokemon.baseAttack - firstStats.baseAttack) > 10 ||
      Math.abs(pokemon.baseDefense - firstStats.baseDefense) > 10 ||
      Math.abs(pokemon.baseStamina - firstStats.baseStamina) > 20
    );
  }

  // Verificar si hay diferencias en movimientos
  hasMovesDifferences(group) {
    if (group.length < 2) return false;

    const firstMoves = group[0];
    return group.some(pokemon =>
      pokemon.fastMoves.length !== firstMoves.fastMoves.length ||
      pokemon.chargedMoves.length !== firstMoves.chargedMoves.length
    );
  }

  // ====== MÉTODOS DE GESTIÓN DE VERSIONADO ======

  // Verificar el estado de actualización de la API
  async checkForUpdates() {
    try {
      console.log('🔍 Verificando actualizaciones disponibles...');

      const apiHashes = await this.getApiHashes();
      const updates = [];

      for (const [endpoint, fileName] of Object.entries(this.endpointFileMap)) {
        const currentHash = this.currentHashes.get(endpoint);
        const apiHash = apiHashes[fileName]?.hash_sha256;

        if (apiHash && currentHash !== apiHash) {
          updates.push({
            endpoint,
            fileName,
            currentHash: currentHash?.substring(0, 12) || 'ninguno',
            newHash: apiHash.substring(0, 12),
            hasLocalData: this.cache.has(endpoint)
          });
        }
      }

      console.log(`📊 Verificación completa: ${updates.length} actualizaciones disponibles`);
      return {
        hasUpdates: updates.length > 0,
        updates,
        totalFiles: Object.keys(this.endpointFileMap).length,
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error verificando actualizaciones:', error);
      return {
        hasUpdates: false,
        updates: [],
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }

  // Obtener información detallada sobre el versionado
  async getVersionInfo() {
    try {
      const apiHashes = await this.getApiHashes();
      const info = {
        apiEndpoint: `${POGO_API_BASE}/api_hashes.json`,
        totalFiles: Object.keys(apiHashes).length,
        monitoredFiles: Object.keys(this.endpointFileMap).length,
        cacheStatus: this.getCacheStatus(),
        fileVersions: {}
      };

      // Información detallada de cada archivo monitoreado
      for (const [endpoint, fileName] of Object.entries(this.endpointFileMap)) {
        const apiHashData = apiHashes[fileName];
        const localHash = this.currentHashes.get(endpoint);

        info.fileVersions[fileName] = {
          endpoint,
          apiHash: apiHashData?.hash_sha256?.substring(0, 12) || 'no disponible',
          localHash: localHash?.substring(0, 12) || 'no almacenado',
          upToDate: localHash === apiHashData?.hash_sha256,
          fullPath: apiHashData?.full_path || endpoint,
          allHashes: {
            md5: apiHashData?.hash_md5,
            sha1: apiHashData?.hash_sha1,
            sha256: apiHashData?.hash_sha256
          }
        };
      }

      return info;
    } catch (error) {
      console.error('❌ Error obteniendo información de versión:', error);
      throw error;
    }
  }

  // Exportar configuración actual para debugging
  exportDebugInfo() {
    return {
      config: {
        cacheExpiry: this.CACHE_DURATION,
        hashCheckInterval: this.HASH_CHECK_INTERVAL,
        endpointMapping: this.endpointFileMap
      },
      state: {
        cacheSize: this.cache.size,
        hashesStored: this.currentHashes.size,
        lastHashCheck: this.lastHashCheck,
        timeSinceLastCheck: Date.now() - this.lastHashCheck
      },
      cacheStatus: this.getCacheStatus()
    };
  }
}

// Crear instancia singleton
const pogoApiService = new PoGoAPIService();

export default pogoApiService;
