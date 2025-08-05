// Test script para el sistema de versionado de PoGoCompi
// Ejecutar en la consola del navegador cuando la app esté cargada

console.log('🧪 Iniciando tests del sistema de versionado...');

// Test 1: Verificar estado del servicio
console.log('\n📊 Test 1: Estado del servicio');
const service = window.pokemonDataService?.pogoApiService;
if (service) {
  console.log('✅ Servicio PoGoAPI disponible');
  console.log('Cache status:', service.getCacheStatus());
} else {
  console.log('❌ Servicio no disponible');
}

// Test 2: Verificar hashes actuales
console.log('\n🔍 Test 2: Verificando hashes...');
service?.getApiHashes()
  .then(hashes => {
    console.log(`✅ Obtenidos hashes para ${Object.keys(hashes).length} archivos`);
    console.log('Ejemplos de hashes:');
    Object.entries(hashes).slice(0, 3).forEach(([file, data]) => {
      console.log(`  📄 ${file}: ${data.hash_sha256.substring(0, 12)}...`);
    });
  })
  .catch(err => console.error('❌ Error obteniendo hashes:', err));

// Test 3: Verificar actualizaciones
console.log('\n🔄 Test 3: Verificando actualizaciones...');
service?.checkForUpdates()
  .then(result => {
    console.log('📋 Resultado de verificación:', result);
    if (result.hasUpdates) {
      console.log(`🆕 ${result.updates.length} actualizaciones disponibles:`);
      result.updates.forEach(update => {
        console.log(`  📄 ${update.fileName}: ${update.currentHash} → ${update.newHash}`);
      });
    } else {
      console.log('✅ Todos los archivos están actualizados');
    }
  })
  .catch(err => console.error('❌ Error verificando actualizaciones:', err));

// Test 4: Información de versión completa
console.log('\n📄 Test 4: Información de versión...');
service?.getVersionInfo()
  .then(info => {
    console.log('📊 Información de versión:', info);
    console.log(`📁 Monitoreando ${info.monitoredFiles} de ${info.totalFiles} archivos`);
    console.log('Estado por archivo:');
    Object.entries(info.fileVersions).forEach(([file, data]) => {
      const status = data.upToDate ? '✅' : '⚠️';
      console.log(`  ${status} ${file}: ${data.apiHash}`);
    });
  })
  .catch(err => console.error('❌ Error obteniendo info de versión:', err));

// Test 5: Simular actualización forzada (comentado por seguridad)
/*
console.log('\n🔄 Test 5: Actualización forzada (descomentado solo para testing)');
service?.forceRefresh('/pokemon_stats.json')
  .then(data => {
    console.log('✅ Actualización forzada exitosa');
    console.log(`📊 Datos obtenidos: ${data.length} registros`);
  })
  .catch(err => console.error('❌ Error en actualización forzada:', err));
*/

// Test 6: Debug info
console.log('\n🔧 Test 6: Información de debug...');
const debugInfo = service?.exportDebugInfo();
if (debugInfo) {
  console.log('🔧 Debug info:', debugInfo);
  console.log(`⏰ Última verificación hace: ${Math.round((Date.now() - debugInfo.state.lastHashCheck) / 1000 / 60)}min`);
} else {
  console.log('❌ Debug info no disponible');
}

console.log('\n✅ Tests completados! Revisa los resultados arriba.');
console.log('💡 Para más tests, puedes ejecutar:');
console.log('   - service.checkForUpdates()');
console.log('   - service.getVersionInfo()');
console.log('   - service.getCacheStatus()');
console.log('   - service.exportDebugInfo()');
