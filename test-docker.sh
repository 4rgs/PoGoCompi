#!/bin/bash

# Script para probar el contenedor localmente antes del deploy

echo "🔧 Construyendo imagen localmente..."
docker build -t pogocompi-test .

echo "🚀 Ejecutando contenedor en puerto 8080..."
docker run -d --name pogocompi-test -p 8080:80 pogocompi-test

echo "⏳ Esperando que el contenedor esté listo..."
sleep 5

echo "🔍 Probando endpoints..."

# Test básico
echo "📍 Test página principal:"
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/ && echo " ✅ OK" || echo " ❌ FAIL"

# Test manifest.json
echo "📍 Test manifest.json:"
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/manifest.json && echo " ✅ OK" || echo " ❌ FAIL"

# Test service worker
echo "📍 Test service worker:"
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/sw.js && echo " ✅ OK" || echo " ❌ FAIL"

# Test health check
echo "📍 Test health check:"
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health && echo " ✅ OK" || echo " ❌ FAIL"

echo ""
echo "🌐 La aplicación está corriendo en: http://localhost:8080"
echo "📱 Puedes probar la instalación del PWA desde tu navegador"
echo ""
echo "🛑 Para detener el contenedor:"
echo "   docker stop pogocompi-test"
echo "   docker rm pogocompi-test"
