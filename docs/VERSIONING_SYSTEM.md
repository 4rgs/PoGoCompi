# Sistema de Versionado con Hashes - PoGoCompi

## Descripción General

El sistema de versionado implementado en PoGoCompi utiliza los hashes SHA-256 proporcionados por la API de PoGoAPI.net para gestionar de manera inteligente el cache de datos, asegurando que siempre tengas la información más actualizada de Pokémon GO.

## Características Principales

### 🔍 Verificación Automática de Actualizaciones
- **Endpoint de Hashes**: Utiliza `https://pogoapi.net/api/v1/api_hashes.json`
- **Verificación Inteligente**: Solo verifica hashes cada 5 minutos para no sobrecargar la API
- **Comparación SHA-256**: Compara hashes locales con los de la API para detectar cambios

### 📦 Cache Inteligente
- **Cache por Hash**: Los datos se mantienen en cache hasta que cambie su hash
- **Fallback Robusto**: Si hay errores de red, usa datos en cache aunque estén "expirados"
- **Expiración Flexible**: Los datos se mantienen frescos basándose en versiones, no solo tiempo

### 🔄 Actualización Granular
- **Por Archivo**: Puedes actualizar archivos específicos (pokemon_stats.json, moves, etc.)
- **Actualización Completa**: O forzar una actualización completa de todos los datos
- **Sin Interrupciones**: Las actualizaciones no bloquean la funcionalidad de la app

## Archivos Monitoreados

El sistema monitorea estos endpoints críticos:

| Endpoint | Archivo | Descripción |
|----------|---------|-------------|
| `/pokemon_stats.json` | Estadísticas base | ATK, DEF, STA de todos los Pokémon |
| `/current_pokemon_moves.json` | Movimientos actuales | Moveset disponible por Pokémon |
| `/fast_moves.json` | Movimientos rápidos | Stats de todos los ataques rápidos |
| `/charged_moves.json` | Movimientos cargados | Stats de todos los ataques cargados |
| `/pokemon_types.json` | Tipos de Pokémon | Tipo primario/secundario |
| `/shadow_pokemon.json` | Pokémon Shadow | Lista de Shadow disponibles |
| `/mega_pokemon.json` | Mega Evoluciones | Stats y costos de Mega evoluciones |
| `/pokemon_forms.json` | Formas especiales | Formas disponibles (Alola, Galar, etc.) |

## Implementación Técnica

### Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │    │   API Service   │    │   PoGoAPI.net   │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Version     │ │◄──►│ │ Hash Manager│ │◄──►│ │ Hash API    │ │
│ │ Status      │ │    │ │             │ │    │ │             │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Update      │ │◄──►│ │ Cache       │ │◄──►│ │ Data APIs   │ │
│ │ Controls    │ │    │ │ Manager     │ │    │ │             │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Flujo de Verificación

1. **Inicio de la App**: Se cargan los datos normalmente
2. **Verificación Periódica**: Cada 5 minutos se verifican los hashes
3. **Comparación**: Se comparan hashes locales vs API
4. **Actualización Selectiva**: Solo se descargan archivos con hashes diferentes
5. **Notificación**: Se informa al usuario sobre actualizaciones disponibles

### Ejemplo de Hash Data

```json
{
    "pokemon_stats.json": {
        "api_filename": "pokemon_stats.json",
        "full_path": "/api/v1/pokemon_stats.json",
        "hash_md5": "355f4ec183f1f519d9cae8e16013dcf4",
        "hash_sha1": "0bb393f6819825afa0ae89e38c1c57e2805371f3",
        "hash_sha256": "d3ea3002c9bbbd4a955bec49352a36c8ed5c6c62cfe8b3f71acfd2083a828b33"
    }
}
```

## Uso en la Aplicación

### Hook useApiVersioning

```javascript
const {
  versionInfo,      // Información detallada de versiones
  updateStatus,     // Estado de actualizaciones disponibles
  isChecking,       // Boolean: verificando actualizaciones
  isUpdating,       // Boolean: actualizando datos
  checkForUpdates,  // Función: verificar actualizaciones
  forceUpdate       // Función: forzar actualización
} = useApiVersioning();
```

### Componente ApiVersionStatus

El componente muestra:
- **Estado actual** del cache y sincronización
- **Actualizaciones disponibles** con botones de acción
- **Detalles de archivos** monitoreados
- **Controles de actualización** manual

## Beneficios del Sistema

### 🚀 Performance
- **Menos tráfico de red**: Solo descarga cuando hay cambios reales
- **Cache inteligente**: Mantiene datos frescos automáticamente
- **Experiencia fluida**: Actualizaciones en background

### 🔒 Confiabilidad
- **Detección de cambios**: 100% precisa usando hashes criptográficos
- **Fallback robusto**: Funciona offline con datos en cache
- **Error handling**: Continúa funcionando aunque falle la verificación

### 🎯 Transparencia
- **Visibilidad completa**: Usuario ve el estado de sincronización
- **Control manual**: Puede forzar actualizaciones si necesita
- **Información detallada**: Debug info disponible para desarrolladores

## Monitoreo y Debug

### Estados del Cache

```javascript
// Obtener estado actual
const cacheStatus = pogoApiService.getCacheStatus();
console.log(cacheStatus);

// Información de debug completa
const debugInfo = pogoApiService.exportDebugInfo();
console.log(debugInfo);
```

### Logs Informativos

El sistema genera logs detallados:
- `🔄 Obteniendo hashes de la API...`
- `✅ Hash no cambió para pokemon_stats.json, datos actualizados`
- `📦 Cache hit para /pokemon_stats.json (hash verificado)`
- `🌐 Fetching from PoGoAPI: /pokemon_stats.json (datos actualizados necesarios)`

## Configuración

### Intervalos Configurables

```javascript
this.CACHE_DURATION = 60 * 60 * 1000;      // 1 hora (respaldo tiempo)
this.HASH_CHECK_INTERVAL = 5 * 60 * 1000;  // 5 minutos (verificación)
```

### Personalización

Puedes modificar:
- **Archivos monitoreados**: Agregar/quitar endpoints en `endpointFileMap`
- **Intervalos de verificación**: Ajustar frecuencia de verificación
- **Políticas de cache**: Modificar duración y comportamiento

## Consideraciones Futuras

1. **LocalStorage**: Persistir hashes entre sesiones del navegador
2. **Service Worker**: Implementar actualizaciones en background
3. **Notificaciones Push**: Alertar sobre actualizaciones importantes
4. **Métricas**: Tracking de eficiencia del cache y actualizaciones
5. **Compresión**: Optimizar tamaño de datos almacenados

Este sistema asegura que tu aplicación PoGoCompi siempre tenga los datos más actualizados de Pokémon GO, optimizando el uso de la red y proporcionando una experiencia de usuario superior.
