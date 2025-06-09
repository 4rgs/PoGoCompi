#!/bin/bash

# Script para construir y desplegar en Google Cloud Run

set -e

# Configuración
PROJECT_ID="pogocompi"
SERVICE_NAME="pogo-compi"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🔍 Verificando entorno..."
# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado. Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js $(node -v) encontrado"

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm no está instalado"
    exit 1
fi
echo "✅ npm $(npm -v) encontrado"

# Verificar si docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado. Por favor instala Docker desde https://www.docker.com/products/docker-desktop/"
    exit 1
fi
echo "✅ Docker encontrado"

# Verificar si gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: Google Cloud CLI (gcloud) no está instalado. Por favor instala gcloud desde https://cloud.google.com/sdk/docs/install"
    exit 1
fi
echo "✅ Google Cloud CLI encontrado"

# Verificar que estás autenticado en gcloud
if ! gcloud auth print-access-token &> /dev/null; then
    echo "❌ Error: No estás autenticado en Google Cloud. Por favor ejecuta 'gcloud auth login'"
    exit 1
fi
echo "✅ Autenticación de Google Cloud verificada"

# Verificar que los archivos necesarios existen
if [ ! -f "Dockerfile" ]; then
    echo "❌ Error: No se encuentra el archivo Dockerfile en el directorio actual"
    exit 1
fi
echo "✅ Dockerfile encontrado"

if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encuentra el archivo package.json en el directorio actual"
    exit 1
fi
echo "✅ package.json encontrado"

# Verificar y habilitar las APIs necesarias
echo "🔄 Verificando APIs requeridas en Google Cloud..."
# Habilitar Artifact Registry API si no está habilitada
echo "- Verificando Artifact Registry API..."
if ! gcloud services list --project $PROJECT_ID --filter="name:artifactregistry.googleapis.com" | grep -q artifactregistry.googleapis.com; then
    echo "   ⚙️ Habilitando Artifact Registry API..."
    gcloud services enable artifactregistry.googleapis.com --project $PROJECT_ID
else
    echo "   ✅ Artifact Registry API ya está habilitada"
fi

# Habilitar Cloud Run API si no está habilitada
echo "- Verificando Cloud Run API..."
if ! gcloud services list --project $PROJECT_ID --filter="name:run.googleapis.com" | grep -q run.googleapis.com; then
    echo "   ⚙️ Habilitando Cloud Run API..."
    gcloud services enable run.googleapis.com --project $PROJECT_ID
else
    echo "   ✅ Cloud Run API ya está habilitada"
fi

# Habilitar Container Registry API para gcr.io
echo "- Verificando Container Registry API..."
if ! gcloud services list --project $PROJECT_ID --filter="name:containerregistry.googleapis.com" | grep -q containerregistry.googleapis.com; then
    echo "   ⚙️ Habilitando Container Registry API..."
    gcloud services enable containerregistry.googleapis.com --project $PROJECT_ID
else
    echo "   ✅ Container Registry API ya está habilitada"
fi

echo "🏗️  Construyendo imagen Docker..."
docker build -t $IMAGE_NAME . --no-cache

echo "🔑 Configurando Docker para acceso a Google Container Registry..."
gcloud auth configure-docker --quiet

echo "📤 Subiendo imagen a Google Container Registry..."
docker push $IMAGE_NAME || {
    echo "❌ Error al subir la imagen. Asegurándose que Docker tiene permiso para acceder a GCR..."
    # Intentar configurar Docker para GCR con credenciales actualizadas
    gcloud auth print-access-token | docker login -u oauth2accesstoken --password-stdin https://gcr.io
    echo "🔄 Intentando subir la imagen de nuevo..."
    docker push $IMAGE_NAME
}

echo "🚀 Desplegando a Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --project $PROJECT_ID || {
    echo "❌ Error al desplegar a Cloud Run. Comprobando permisos y roles..."
    echo "ℹ️ Para resolver este problema, asegúrate de que tu usuario tiene los siguientes roles:"
    echo "   - roles/run.admin"
    echo "   - roles/iam.serviceAccountUser"
    echo "   - roles/artifactregistry.admin"
    echo "   - roles/storage.admin"
    echo "Puedes añadir estos roles con el comando:"
    echo "gcloud projects add-iam-policy-binding $PROJECT_ID --member=user:TU_EMAIL --role=NOMBRE_DEL_ROL"
    exit 1
}

echo "✅ ¡Despliegue completado!"
echo "🌐 Tu aplicación estará disponible en:"
gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)' --project $PROJECT_ID
