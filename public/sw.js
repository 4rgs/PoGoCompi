// Service Worker para PWA Comparador de Pokémon GO
// Versión del cache - incrementar para forzar actualización
const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `pokemon-dps-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `pokemon-dps-dynamic-${CACHE_VERSION}`;
const API_CACHE = `pokemon-dps-api-${CACHE_VERSION}`;

// URLs a cachear estáticamente
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/App.css',
  '/src/index.css',
  // Componentes
  '/src/components/ComparisonTable.jsx',
  '/src/components/DPSChart.jsx',
  '/src/components/MoveBadge.jsx',
  '/src/components/PokemonForm.jsx',
  '/src/components/PokemonImage.jsx',
  '/src/components/TypeChips.jsx',
  '/src/components/TypeIcon.jsx',
  // Servicios y utilidades
  '/src/services/pogoApiService.js',
  '/src/services/pokemonDataService.js',
  '/src/utils/dpsCalculator.js',
  '/src/utils/pokemonTypesFallback.js',
  '/src/utils/typeColors.js',
  // Datos de fallback
  '/src/data/pokemon_data.json'
];

// APIs de PoGoAPI.net para cachear
const API_ENDPOINTS = [
  'https://pogoapi.net/api/v1/pokemon_stats.json',
  'https://pogoapi.net/api/v1/current_pokemon_moves.json',
  'https://pogoapi.net/api/v1/fast_moves.json',
  'https://pogoapi.net/api/v1/charged_moves.json',
  'https://pogoapi.net/api/v1/pokemon_types.json',
  'https://pogoapi.net/api/v1/shadow_pokemon.json',
  'https://pogoapi.net/api/v1/mega_pokemon.json',
  'https://pogoapi.net/api/v1/pokemon_forms.json'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Service Worker: Cacheando assets estáticos...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker: Assets estáticos cacheados');
        return self.skipWaiting(); // Activar inmediatamente
      })
      .catch(error => {
        console.error('❌ Service Worker: Error cacheando assets:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activando...');
  
  event.waitUntil(
    // Limpiar caches antiguos
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('🗑️ Service Worker: Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activado y limpieza completada');
        return self.clients.claim(); // Tomar control de todas las páginas
      })
  );
});

// Intercepción de requests (estrategias de cache)
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Estrategia para assets estáticos: Cache First
  if (STATIC_ASSETS.some(asset => request.url.includes(asset))) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Estrategia para APIs de PoGoAPI: Network First con fallback a cache
  if (url.hostname === 'pogoapi.net') {
    event.respondWith(networkFirstWithTimeout(request, API_CACHE, 5000));
    return;
  }

  // Estrategia para imágenes de Pokémon: Cache First con fallback
  if (request.url.includes('pokemon') && 
      (request.url.includes('.png') || request.url.includes('.jpg') || request.url.includes('.jpeg'))) {
    event.respondWith(cacheFirstImages(request, DYNAMIC_CACHE));
    return;
  }

  // Estrategia para otros recursos: Network First
  if (request.method === 'GET') {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  }
});

// Estrategia Cache First - Para assets estáticos
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📦 Cache hit:', request.url);
      return cachedResponse;
    }

    console.log('🌐 Fetching from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Cache First error:', error);
    return new Response('Recurso no disponible', { status: 404 });
  }
}

// Estrategia Network First con timeout - Para APIs críticas
async function networkFirstWithTimeout(request, cacheName, timeout = 3000) {
  try {
    const cache = await caches.open(cacheName);
    
    // Intentar network con timeout
    const networkPromise = fetch(request);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeout)
    );

    try {
      const networkResponse = await Promise.race([networkPromise, timeoutPromise]);
      
      if (networkResponse.ok) {
        console.log('🌐 API response from network:', request.url);
        cache.put(request, networkResponse.clone());
        return networkResponse;
      }
    } catch (error) {
      console.warn('⚠️ Network timeout o error, usando cache:', error.message);
    }

    // Fallback a cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('📦 API fallback from cache:', request.url);
      return cachedResponse;
    }

    throw new Error('No hay respuesta de red ni cache disponible');
  } catch (error) {
    console.error('❌ Network First error:', error);
    return new Response(JSON.stringify({ 
      error: 'Datos no disponibles', 
      offline: true,
      message: 'Verifica tu conexión a internet' 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Estrategia Cache First para imágenes con múltiples fallbacks
async function cacheFirstImages(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    // Fallback para imágenes no encontradas
    return generatePlaceholderImage(request.url);
  } catch (error) {
    return generatePlaceholderImage(request.url);
  }
}

// Estrategia Network First - Para contenido dinámico
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    return getCachedResponse(request, cacheName);
  } catch (error) {
    return getCachedResponse(request, cacheName);
  }
}

// Obtener respuesta del cache
async function getCachedResponse(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  return new Response('Contenido no disponible offline', { status: 404 });
}

// Generar imagen placeholder para Pokémon
function generatePlaceholderImage(url) {
  // Extraer ID del Pokémon de la URL
  const pokemonId = url.match(/\/(\d+)\.png/) ? url.match(/\/(\d+)\.png/)[1] : '?';
  
  const svg = `
    <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" fill="#4A90E2"/>
      <text x="64" y="70" font-family="Arial, sans-serif" font-size="24" 
            fill="white" text-anchor="middle" font-weight="bold">${pokemonId}</text>
    </svg>
  `;
  
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'max-age=86400'
    }
  });
}

// Manejar mensajes del cliente
self.addEventListener('message', event => {
  const { action, data } = event.data;
  
  switch (action) {
    case 'CACHE_API_DATA':
      cacheApiData(data);
      break;
    case 'CLEAR_CACHE':
      clearAllCaches();
      break;
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage(status);
      });
      break;
  }
});

// Cachear datos de API manualmente
async function cacheApiData(apiData) {
  try {
    const cache = await caches.open(API_CACHE);
    
    // Crear responses sintéticas para los datos
    for (const [endpoint, data] of Object.entries(apiData)) {
      const response = new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=3600'
        }
      });
      
      await cache.put(`https://pogoapi.net/api/v1/${endpoint}.json`, response);
    }
    
    console.log('✅ Datos de API cacheados manualmente');
  } catch (error) {
    console.error('❌ Error cacheando datos de API:', error);
  }
}

// Limpiar todos los caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('🗑️ Todos los caches eliminados');
}

// Obtener estado del cache
async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};
  
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    status[name] = keys.length;
  }
  
  return status;
}
