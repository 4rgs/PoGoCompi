#!/bin/bash

# 🚀 Instalación automática de PoGoCompi para CasaOS/Docker
# Un script simple que funciona sin complicaciones

set -e

echo "🚀 Instalando Comparador de Pokémon GO..."
echo "=========================================="

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    exit 1
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado"
    exit 1
fi

# Crear directorio
INSTALL_DIR="$HOME/pogocompi"
echo "📁 Creando directorio: $INSTALL_DIR"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Descargar docker-compose.yml
echo "📥 Descargando configuración..."
curl -sSL https://raw.githubusercontent.com/4rgs/PoGoCompi/develop/docker-compose.yml -o docker-compose.yml

# Iniciar servicios
echo "🚀 Iniciando servicios..."
docker-compose up -d

# Esperar y verificar
echo "⏳ Esperando que los servicios inicien..."
sleep 10

if curl -sSf http://localhost:3001 >/dev/null 2>&1; then
    echo "✅ ¡Instalación completada exitosamente!"
    echo ""
    echo "🌐 Acceso:"
    echo "   Local: http://localhost:3001"
    echo "   Red:   http://$(hostname -I | awk '{print $1}'):3001"
    echo ""
    echo "📱 Para instalar como PWA:"
    echo "   1. Visita la URL en tu navegador"
    echo "   2. Busca el ícono de 'Instalar app'"
    echo "   3. ¡Disfruta!"
    echo ""
    echo "🔧 Comandos útiles:"
    echo "   Ver logs:    docker-compose logs -f"
    echo "   Reiniciar:   docker-compose restart"
    echo "   Detener:     docker-compose down"
else
    echo "❌ Error: La aplicación no responde"
    echo "Ver logs: docker-compose logs"
    exit 1
fi
