#!/bin/bash

# Script de configuración PWA para CasaOS - PoGoCompi
# Este script resuelve problemas comunes de instalación PWA

set -e

echo "🚀 Configurador PWA para PoGoCompi en CasaOS"
echo "=============================================="

# Función para mostrar mensajes coloridos
info() { echo -e "\033[1;34m[INFO]\033[0m $1"; }
success() { echo -e "\033[1;32m[SUCCESS]\033[0m $1"; }
warning() { echo -e "\033[1;33m[WARNING]\033[0m $1"; }
error() { echo -e "\033[1;31m[ERROR]\033[0m $1"; }

# Verificar si Docker está disponible
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado o no está disponible"
    exit 1
fi

# Verificar si docker-compose está disponible
if ! command -v docker-compose &> /dev/null; then
    error "docker-compose no está instalado o no está disponible"
    exit 1
fi

# Crear directorio de trabajo
WORK_DIR="$HOME/pogocompi-pwa"
info "Creando directorio de trabajo: $WORK_DIR"
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

# Función para generar certificados SSL auto-firmados
generate_ssl_certs() {
    info "Generando certificados SSL auto-firmados..."

    mkdir -p ssl-certs

    # Detectar IP local
    LOCAL_IP=$(hostname -I | awk '{print $1}')

    # Generar certificado
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl-certs/localhost.key \
        -out ssl-certs/localhost.crt \
        -subj "/CN=localhost" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:$LOCAL_IP" 2>/dev/null || {
        # Fallback para versiones antiguas de OpenSSL
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl-certs/localhost.key \
            -out ssl-certs/localhost.crt \
            -subj "/CN=localhost"
    }

    success "Certificados SSL generados en ssl-certs/"
}

# Función para descargar archivos de configuración
download_configs() {
    info "Descargando archivos de configuración..."

    # Docker Compose para PWA
    curl -sSL https://raw.githubusercontent.com/4rgs/PoGoCompi/develop/docker-compose.pwa.yml -o docker-compose.yml

    # Configuración Nginx
    curl -sSL https://raw.githubusercontent.com/4rgs/PoGoCompi/develop/nginx-pwa.conf -o nginx-pwa.conf

    success "Archivos de configuración descargados"
}

# Función para configurar el entorno
setup_environment() {
    info "Configurando variables de entorno..."

    cat > .env << EOF
# Configuración PWA para PoGoCompi
TZ=America/Mexico_City
DOMAIN=localhost
HTTP_PORT=3001
HTTPS_PORT=3443
COMPOSE_PROJECT_NAME=pogocompi-pwa
EOF

    success "Archivo .env creado"
}

# Función para iniciar servicios
start_services() {
    info "Iniciando servicios..."

    echo "Opciones de deployment:"
    echo "1) Solo HTTP (básico)"
    echo "2) HTTP + HTTPS con SSL (recomendado para PWA)"
    echo
    read -p "Selecciona una opción (1-2): " choice

    case $choice in
        1)
            info "Iniciando deployment básico (solo HTTP)..."
            docker-compose up -d pogocompi watchtower
            ;;
        2)
            info "Iniciando deployment completo con HTTPS..."
            generate_ssl_certs
            docker-compose --profile https up -d
            ;;
        *)
            warning "Opción inválida, usando deployment básico"
            docker-compose up -d pogocompi watchtower
            ;;
    esac

    success "Servicios iniciados"
}

# Función para mostrar información de acceso
show_access_info() {
    LOCAL_IP=$(hostname -I | awk '{print $1}')

    success "🎉 PoGoCompi instalado exitosamente!"
    echo
    echo "📱 URLs de acceso:"
    echo "   HTTP:  http://localhost:3001"
    echo "   HTTP:  http://$LOCAL_IP:3001"

    if docker-compose ps nginx-ssl >/dev/null 2>&1; then
        echo "   HTTPS: https://localhost:3443"
        echo "   HTTPS: https://$LOCAL_IP:3443"
        echo
        warning "Para HTTPS, acepta el certificado auto-firmado en tu navegador"
    fi

    echo
    echo "🔧 Comandos útiles:"
    echo "   Ver logs:      docker-compose logs -f"
    echo "   Reiniciar:     docker-compose restart"
    echo "   Actualizar:    docker-compose pull && docker-compose up -d"
    echo "   Detener:       docker-compose down"
    echo
    echo "📱 Para instalar como PWA:"
    echo "   1. Visita la URL en tu navegador"
    echo "   2. Busca el ícono de 'Instalar app' en la barra de direcciones"
    echo "   3. O usa el menú del navegador → 'Instalar aplicación'"
    echo
    if docker-compose ps nginx-ssl >/dev/null 2>&1; then
        echo "✅ HTTPS configurado - PWA funcionará completamente"
    else
        warning "Para funcionalidad PWA completa, reinicia con opción 2 (HTTPS)"
    fi
}

# Función para verificar el estado
check_status() {
    info "Verificando estado de los servicios..."

    sleep 5  # Esperar a que los servicios se inicien

    if curl -sSf http://localhost:3001 >/dev/null 2>&1; then
        success "✅ Servicio HTTP funcionando correctamente"
    else
        error "❌ Servicio HTTP no responde"
    fi

    if docker-compose ps nginx-ssl >/dev/null 2>&1; then
        if curl -sSfk https://localhost:3443 >/dev/null 2>&1; then
            success "✅ Servicio HTTPS funcionando correctamente"
        else
            warning "⚠️  Servicio HTTPS configurado pero no responde"
        fi
    fi
}

# Función para limpiar instalación anterior
cleanup_previous() {
    if [ -f "docker-compose.yml" ]; then
        warning "Detectada instalación anterior. ¿Quieres limpiarla?"
        read -p "¿Continuar? (y/N): " confirm
        if [[ $confirm =~ ^[Yy] ]]; then
            info "Limpiando instalación anterior..."
            docker-compose down -v 2>/dev/null || true
            docker-compose --profile https down -v 2>/dev/null || true
        fi
    fi
}

# Función principal
main() {
    echo
    info "Este script configurará PoGoCompi con soporte PWA completo"
    echo

    cleanup_previous
    download_configs
    setup_environment
    start_services
    check_status
    show_access_info

    echo
    success "🎊 ¡Instalación completada!"
    echo "   Ahora puedes instalar la app como PWA desde tu navegador"
}

# Verificar argumentos
case "${1:-}" in
    --help|-h)
        echo "Uso: $0 [opciones]"
        echo
        echo "Opciones:"
        echo "  --help, -h     Mostrar esta ayuda"
        echo "  --cleanup      Solo limpiar instalación anterior"
        echo "  --status       Verificar estado de servicios"
        echo
        exit 0
        ;;
    --cleanup)
        cleanup_previous
        exit 0
        ;;
    --status)
        check_status
        exit 0
        ;;
    *)
        main
        ;;
esac
