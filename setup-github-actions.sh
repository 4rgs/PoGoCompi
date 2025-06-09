#!/bin/bash

# 🚀 Script de configuración automatizada para GitHub Actions + Google Cloud Run
# Este script configura todo lo necesario para deployar automáticamente desde GitHub

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_step() {
    echo -e "\n${BLUE}🔧 $1${NC}"
}

# Verificar prerequisitos
print_step "Verificando prerequisitos..."

if ! command -v gcloud &> /dev/null; then
    print_error "Google Cloud CLI no está instalado"
    exit 1
fi
print_success "Google Cloud CLI encontrado"

if ! gcloud auth print-access-token &> /dev/null; then
    print_error "No estás autenticado en Google Cloud. Ejecuta 'gcloud auth login'"
    exit 1
fi
print_success "Autenticación verificada"

# Solicitar información del usuario
echo ""
print_step "Configuración del proyecto"

# 🔧 CONFIGURA ESTOS VALORES POR DEFECTO:
DEFAULT_PROJECT_ID="pogocompi"
DEFAULT_SERVICE_NAME="pogo-compi"
DEFAULT_REGION="us-central1"

read -p "Project ID de Google Cloud [$DEFAULT_PROJECT_ID]: " PROJECT_ID
PROJECT_ID=${PROJECT_ID:-$DEFAULT_PROJECT_ID}

read -p "Nombre del servicio Cloud Run [$DEFAULT_SERVICE_NAME]: " SERVICE_NAME
SERVICE_NAME=${SERVICE_NAME:-$DEFAULT_SERVICE_NAME}

read -p "Región para Cloud Run [$DEFAULT_REGION]: " REGION
REGION=${REGION:-$DEFAULT_REGION}

read -p "Tu repositorio GitHub (formato: usuario/repo): " GITHUB_REPO

if [[ -z "$GITHUB_REPO" ]]; then
    print_error "El repositorio GitHub es requerido"
    exit 1
fi

# Obtener project number
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
print_success "Project Number: $PROJECT_NUMBER"

# Habilitar APIs
print_step "Habilitando APIs necesarias..."
gcloud services enable run.googleapis.com \
  artifactregistry.googleapis.com \
  iamcredentials.googleapis.com \
  --project=$PROJECT_ID
print_success "APIs habilitadas"

# Crear service account
print_step "Creando Service Account..."
if gcloud iam service-accounts describe github-actions@$PROJECT_ID.iam.gserviceaccount.com --project=$PROJECT_ID &> /dev/null; then
    print_warning "Service Account 'github-actions' ya existe"
else
    gcloud iam service-accounts create github-actions \
      --description="Service Account para GitHub Actions" \
      --display-name="GitHub Actions" \
      --project=$PROJECT_ID
    print_success "Service Account creado"
fi

# Asignar roles
print_step "Asignando roles al Service Account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin" \
  --quiet

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.admin" \
  --quiet

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser" \
  --quiet

print_success "Roles asignados"

# Crear workload identity pool
print_step "Configurando Workload Identity Federation..."
if gcloud iam workload-identity-pools describe github-pool --project="$PROJECT_ID" --location="global" &> /dev/null; then
    print_warning "Workload Identity Pool 'github-pool' ya existe"
else
    gcloud iam workload-identity-pools create "github-pool" \
      --project="$PROJECT_ID" \
      --location="global" \
      --description="Pool para GitHub Actions"
    print_success "Workload Identity Pool creado"
fi

# Crear proveedor OIDC
if gcloud iam workload-identity-pools providers describe github-provider --project="$PROJECT_ID" --location="global" --workload-identity-pool="github-pool" &> /dev/null; then
    print_warning "Proveedor OIDC 'github-provider' ya existe - eliminando para recrear con configuración correcta..."
    gcloud iam workload-identity-pools providers delete github-provider \
      --project="$PROJECT_ID" \
      --location="global" \
      --workload-identity-pool="github-pool" \
      --quiet
    print_success "Proveedor anterior eliminado"
fi

print_status "Creando proveedor OIDC con configuración correcta..."
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="$PROJECT_ID" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --attribute-condition="assertion.repository_owner == \"$(echo $GITHUB_REPO | cut -d'/' -f1)\"" \
  --issuer-uri="https://token.actions.githubusercontent.com"
print_success "Proveedor OIDC creado"

# Configurar binding
print_step "Configurando binding para el repositorio..."
gcloud iam service-accounts add-iam-policy-binding \
  "github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --project="$PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/attribute.repository/$GITHUB_REPO" \
  --quiet

print_success "Binding configurado"

# Mostrar información para GitHub Secrets
print_step "Configuración completada! 🎉"
echo ""
print_status "Ahora agrega estos secrets en tu repositorio GitHub:"
print_status "Ve a: https://github.com/$GITHUB_REPO/settings/secrets/actions"
echo ""
echo "🔐 Secrets para agregar:"
echo "========================"
echo "Nombre: WIF_PROVIDER"
echo "Valor:  projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-provider"
echo ""
echo "Nombre: WIF_SERVICE_ACCOUNT"
echo "Valor:  github-actions@$PROJECT_ID.iam.gserviceaccount.com"
echo ""

print_step "Verificando configuración del workflow..."
if [[ -f ".github/workflows/deploy.yml" ]]; then
    print_warning "Revisa que las variables en .github/workflows/deploy.yml coincidan con tu configuración:"
    echo "  PROJECT_ID: $PROJECT_ID"
    echo "  SERVICE_NAME: $SERVICE_NAME"
    echo "  REGION: $REGION"
else
    print_error "No se encuentra .github/workflows/deploy.yml"
    print_status "Asegúrate de haber creado el archivo de workflow"
fi

echo ""
print_success "¡Configuración completada! Ya puedes hacer push a tu rama principal para deployar automáticamente."
print_status "Para más detalles, revisa el archivo GITHUB_ACTIONS_SETUP.md"
