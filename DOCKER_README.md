# Docker y Cloud Run - Guía de Despliegue

Esta guía te ayudará a dockerizar y desplegar tu aplicación React PWA en Google Cloud Run.

## 📋 Prerrequisitos

1. **Docker instalado** en tu máquina local
2. **Google Cloud CLI (gcloud)** instalado y configurado
3. **Proyecto de Google Cloud** con facturación habilitada
4. **APIs habilitadas**:
   - Cloud Run API
   - Container Registry API

## 🏗️ Construcción Local

### Probar la aplicación localmente con Docker

```bash
# Construir la imagen Docker
npm run docker:build

# Ejecutar el contenedor localmente
npm run docker:run

# O hacer ambos pasos de una vez
npm run docker:test
```

La aplicación estará disponible en `http://localhost:8080`

## ☁️ Despliegue en Google Cloud Run

### 1. Configurar el proyecto

Edita el archivo `deploy.sh` y cambia las siguientes variables:

```bash
PROJECT_ID="tu-proyecto-gcp"        # ID de tu proyecto en GCP
SERVICE_NAME="pogo-compi"           # Nombre del servicio (puedes cambiarlo)
REGION="us-central1"                # Región donde desplegar
```

### 2. Autenticación con Google Cloud

```bash
# Iniciar sesión
gcloud auth login

# Configurar el proyecto por defecto
gcloud config set project TU_PROJECT_ID

# Configurar Docker para usar gcloud
gcloud auth configure-docker
```

### 3. Habilitar APIs necesarias

```bash
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 4. Desplegar

```bash
# Ejecutar el script de despliegue
npm run gcp:deploy

# O manualmente:
./deploy.sh
```

### 5. Despliegue alternativo con archivo de configuración

También puedes usar el archivo `cloudrun.yaml` para un despliegue más controlado:

```bash
# Primero, construir y subir la imagen
docker build -t gcr.io/TU_PROJECT_ID/pogo-compi .
docker push gcr.io/TU_PROJECT_ID/pogo-compi

# Luego, actualizar el PROJECT_ID en cloudrun.yaml y desplegar
gcloud run services replace cloudrun.yaml --region=us-central1
```

## 🔧 Configuración del Dockerfile

El Dockerfile usa un build multi-stage optimizado:

1. **Etapa de build**: Usa Node.js para construir la aplicación
2. **Etapa de producción**: Usa Nginx Alpine para servir los archivos estáticos

### Características principales:

- ✅ **Optimizado para producción** con archivos estáticos
- ✅ **Nginx configurado** para PWA (Service Workers, manifest.json)
- ✅ **Headers de seguridad** incluidos
- ✅ **Compresión gzip** habilitada
- ✅ **Health check endpoint** para Cloud Run
- ✅ **Usuario no-root** para seguridad
- ✅ **Caché optimizado** para assets estáticos

## 🌐 Configuración de Nginx

La configuración de Nginx incluye:

- **Soporte PWA completo**: Service Workers y manifest cacheados correctamente
- **SPA routing**: Todas las rutas redirigen a `index.html`
- **Headers de seguridad**: XSS protection, CSRF, etc.
- **Compresión**: Gzip para todos los assets
- **Health check**: Endpoint `/health` para Cloud Run

## 📊 Monitoreo

Una vez desplegado, puedes monitorear tu aplicación en:

- **Cloud Run Console**: `https://console.cloud.google.com/run`
- **Logs**: `gcloud logging read "resource.type=cloud_run_revision"`
- **Métricas**: Disponibles en Cloud Monitoring

## 🚀 Comandos Útiles

```bash
# Ver logs en tiempo real
gcloud run services logs tail pogo-compi --region=us-central1

# Ver información del servicio
gcloud run services describe pogo-compi --region=us-central1

# Actualizar configuración sin rebuild
gcloud run services update pogo-compi --memory=1Gi --region=us-central1

# Eliminar el servicio
gcloud run services delete pogo-compi --region=us-central1
```

## 💰 Costos

Cloud Run cobra solo por el tiempo de uso:

- **CPU y memoria**: Solo cuando hay requests
- **Requests**: Primeros 2 millones gratis por mes
- **Estimado**: Para una PWA típica, muy bajo costo mensual

## 🔒 Seguridad

El contenedor está configurado con:

- Usuario no-root
- Headers de seguridad
- Recursos limitados
- Health checks configurados

## 🐛 Troubleshooting

### La aplicación no carga
- Verifica que el puerto 8080 esté expuesto
- Revisa los logs: `gcloud run services logs tail pogo-compi`

### Error de autenticación Docker
```bash
gcloud auth configure-docker
```

### Service Worker no funciona
- Verifica la configuración de Nginx para `/sw.js`
- Asegúrate de que HTTPS esté habilitado (automático en Cloud Run)

## 📝 Notas Adicionales

- Cloud Run automáticamente proporciona HTTPS
- El autoscaling va de 0 a 10 instancias por defecto
- Los cold starts son mínimos con Nginx
- Perfect Lighthouse scores esperados para PWA
