# 🚀 Configuración de GitHub Actions para Deploy a Google Cloud Run

Este documento te guía paso a paso para configurar el deployment automático de tu aplicación a Google Cloud Run usando GitHub Actions.

## 📋 Prerequisitos

1. **Proyecto en Google Cloud Platform** con billing habilitado
2. **Repositorio en GitHub** 
3. **APIs habilitadas en GCP:**
   - Cloud Run API
   - Artifact Registry API
   - IAM Service Account Credentials API

## 🔧 Configuración en Google Cloud

### 1. Habilitar APIs necesarias

```bash
# Reemplaza 'pogocompi' con tu PROJECT_ID
export PROJECT_ID="pogocompi"

gcloud services enable run.googleapis.com \
  artifactregistry.googleapis.com \
  iamcredentials.googleapis.com \
  --project=$PROJECT_ID
```

### 2. Crear Service Account

```bash
# Crear service account
gcloud iam service-accounts create github-actions \
  --description="Service Account para GitHub Actions" \
  --display-name="GitHub Actions" \
  --project=$PROJECT_ID

# Asignar roles necesarios
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

### 3. Configurar Workload Identity Federation

```bash
# Obtener project number
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Crear workload identity pool
gcloud iam workload-identity-pools create "github-pool" \
  --project="$PROJECT_ID" \
  --location="global" \
  --description="Pool para GitHub Actions"

# Crear proveedor OIDC
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="$PROJECT_ID" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Configurar binding (REEMPLAZA TU_USUARIO y TU_REPO)
export GITHUB_REPO="TU_USUARIO/TU_REPO"  # Ejemplo: "alvarogonzalez/PoGoCompi"

gcloud iam service-accounts add-iam-policy-binding \
  "github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --project="$PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/attribute.repository/$GITHUB_REPO"
```

### 4. Obtener valores para GitHub Secrets

```bash
# WIF_PROVIDER
echo "WIF_PROVIDER: projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-provider"

# WIF_SERVICE_ACCOUNT  
echo "WIF_SERVICE_ACCOUNT: github-actions@$PROJECT_ID.iam.gserviceaccount.com"
```

## 🔐 Configuración en GitHub

### Agregar Secrets

Ve a tu repositorio en GitHub → **Settings** → **Secrets and variables** → **Actions** y agrega:

1. **`WIF_PROVIDER`**: El valor obtenido del comando anterior
2. **`WIF_SERVICE_ACCOUNT`**: El email del service account

### Ejemplo de valores:
```
WIF_PROVIDER: projects/123456789/locations/global/workloadIdentityPools/github-pool/providers/github-provider
WIF_SERVICE_ACCOUNT: github-actions@pogocompi.iam.gserviceaccount.com
```

## 🔧 Personalizar el Workflow

Edita `.github/workflows/deploy.yml` y actualiza estas variables:

```yaml
env:
  PROJECT_ID: pogocompi                    # 🔧 Tu Project ID
  SERVICE_NAME: pogo-compi                 # 🔧 Nombre de tu servicio
  REGION: us-central1                      # 🔧 Tu región preferida
  GAR_LOCATION: us-central1                # 🔧 Ubicación del Artifact Registry
  REPOSITORY: pogo-compi-repo              # 🔧 Nombre del repositorio
```

También actualiza:
- **Rama principal**: Cambia `main` por tu rama si es diferente
- **Versión de Node.js**: Cambia `'18'` por tu versión
- **Comandos de test**: Agrega tus tests si los tienes

## 🚀 Despliegue

### Automático
- **Push a main**: Ejecuta build, test y deploy
- **Pull Request**: Solo ejecuta build y test
- **Manual**: Ve a Actions → Deploy to Google Cloud Run → Run workflow

### Manual (tradicional)
Sigue usando tu script `deploy.sh` para deployments manuales cuando necesites.

## 🔍 Troubleshooting

### Error de permisos
```bash
# Verificar roles del service account
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:github-actions@$PROJECT_ID.iam.gserviceaccount.com"
```

### Error en Workload Identity
```bash
# Verificar configuración
gcloud iam workload-identity-pools describe github-pool \
  --project="$PROJECT_ID" \
  --location="global"
```

### Logs del deployment
- Ve a **GitHub Actions** → tu workflow → logs detallados
- En GCP: **Cloud Run** → tu servicio → Logs

## 📚 Recursos adicionales

- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [GitHub Actions for GCP](https://github.com/google-github-actions)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
