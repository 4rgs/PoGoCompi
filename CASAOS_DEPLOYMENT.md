# 🚀 Deployment en CasaOS - Zima Board

## 📋 Opciones de Deployment

### 1. **Setup Básico** (`docker-compose.casaos.yml`)
Recomendado para la mayoría de usuarios.

```bash
# En tu Zima Board
wget https://raw.githubusercontent.com/4rgs/PoGoCompi/develop/docker-compose.casaos.yml
docker-compose -f docker-compose.casaos.yml up -d
```

### 2. **Setup Completo** (`docker-compose.yml`)
Con auto-actualización y monitoreo.

```bash
# En tu Zima Board
wget https://raw.githubusercontent.com/4rgs/PoGoCompi/develop/docker-compose.yml
docker-compose up -d
```

### 3. **Setup Avanzado** (`docker-compose.full.yml`)
Con monitoreo opcional y configuraciones avanzadas.

```bash
# En tu Zima Board
wget https://raw.githubusercontent.com/4rgs/PoGoCompi/develop/docker-compose.full.yml
docker-compose -f docker-compose.full.yml up -d
```

### 4. **Setup PWA Completo** (`docker-compose.pwa.yml`) 🆕
**Para resolver problemas de instalación PWA.**

```bash
# Script automático (recomendado)
curl -sSL https://raw.githubusercontent.com/4rgs/PoGoCompi/develop/setup-pwa-casaos.sh | bash

# O manual
wget https://raw.githubusercontent.com/4rgs/PoGoCompi/develop/docker-compose.pwa.yml
docker-compose -f docker-compose.pwa.yml --profile https up -d
```

## 🔧 Configuración en CasaOS

### Importar desde CasaOS App Store:

1. **Abrir CasaOS** → Apps → Custom Install
2. **Pegar URL del docker-compose**:
   ```
   https://raw.githubusercontent.com/4rgs/PoGoCompi/develop/docker-compose.casaos.yml
   ```
3. **Configurar**:
   - **Nombre**: Pokémon GO Comparador
   - **Puerto**: 3001
   - **Categoría**: Entertainment

### Configuración Manual:

1. **SSH a tu Zima Board**
2. **Crear directorio**:
   ```bash
   mkdir -p ~/apps/pogocompi
   cd ~/apps/pogocompi
   ```
3. **Descargar configuración**:
   ```bash
   wget https://raw.githubusercontent.com/4rgs/PoGoCompi/develop/docker-compose.casaos.yml
   ```
4. **Ejecutar**:
   ```bash
   docker-compose -f docker-compose.casaos.yml up -d
   ```

## 🌐 Acceso

Una vez instalado:
- **URL Local**: `http://tu-zima-ip:3001`
- **CasaOS Dashboard**: Aparecerá como app instalada
- **PWA**: Instalar desde el navegador para mejor experiencia

## ⚙️ Configuraciones Opcionales

### Variables de Entorno (`.env`):
```env
TZ=America/Mexico_City
DOMAIN=tu-dominio.com
```

### Zona Horaria:
Edita en el docker-compose:
```yaml
environment:
  - TZ=America/Mexico_City  # Cambia por tu zona
```

### Puerto Personalizado:
```yaml
ports:
  - "PUERTO_DESEADO:80"  # Cambia PUERTO_DESEADO
```

## 🔄 Auto-actualización

El setup incluye **Watchtower** que:
- ✅ Revisa updates automáticamente
- ✅ Actualiza cuando hay nueva imagen
- ✅ Reinicia con rolling restart
- ✅ Limpia imágenes antiguas

### Horario de actualización:
- **Básico**: Cada 30 minutos
- **Completo**: Cada 6 horas
- **Avanzado**: Cada noche a las 2 AM

## 📊 Monitoreo

### Health Checks:
- Endpoint: `/health`
- Intervalo: 30 segundos
- Timeout: 10 segundos

### Logs:
```bash
# Ver logs de la app
docker logs pogocompi-app

# Ver logs de watchtower
docker logs pogocompi-watchtower

# Logs en tiempo real
docker-compose logs -f
```

## 🛠️ Troubleshooting

### App no responde:
```bash
# Verificar estado
docker ps
docker logs pogocompi-app

# Reiniciar
docker-compose restart pogocompi
```

### Puerto ocupado:
```bash
# Verificar puertos en uso
netstat -tulpn | grep :3001

# Cambiar puerto en docker-compose.yml
ports:
  - "NUEVO_PUERTO:80"
```

### Problemas de permisos:
```bash
# Verificar usuario en Zima
id
# Ajustar PUID/PGID en docker-compose si es necesario
```

## 🔧 Personalización para CasaOS

### Cambiar icono:
```yaml
labels:
  - "casaos.icon=https://tu-icono-personalizado.png"
```

### Cambiar categoría:
```yaml
labels:
  - "casaos.category=Games"  # o Productivity, Utilities, etc.
```

### Añadir al dashboard:
La app aparecerá automáticamente en el dashboard de CasaOS una vez instalada.

## 📱 Funcionalidades PWA

- ✅ **Instalable**: Como app nativa
- ✅ **Offline**: Funciona sin internet una vez cacheado
- ✅ **Responsive**: Optimizado para móvil y desktop
- ✅ **Fast**: Carga rápida con cache inteligente

### 🔧 Solución a Problemas de Instalación PWA

Si no puedes descargar/instalar la aplicación como PWA en tu deployment de CasaOS:

#### **1. Verificar HTTPS**
```bash
# La PWA requiere HTTPS o localhost para funcionar
# Verificar que CasaOS esté configurado correctamente
curl -I https://tu-zima-ip:3001
```

#### **2. Verificar Archivos PWA**
```bash
# Verificar que el manifest esté disponible
curl https://tu-zima-ip:3001/manifest.webmanifest

# Verificar que el service worker esté disponible
curl https://tu-zima-ip:3001/sw.js
```

#### **3. Configurar Proxy Inverso (Recomendado)**
Para habilitar HTTPS, añade a tu `docker-compose.yml`:

```yaml
services:
  pogocompi:
    # ... configuración existente ...

  nginx-proxy:
    image: nginx:alpine
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx-ssl.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - pogocompi
    environment:
      - DOMAIN=tu-dominio.local
```

#### **4. Certificado Auto-firmado**
```bash
# Crear certificado auto-firmado
mkdir -p certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/tu-dominio.local.key \
  -out certs/tu-dominio.local.crt \
  -subj "/CN=tu-dominio.local"
```

#### **5. Configuración Nginx para HTTPS**
Crear `nginx-ssl.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream pogocompi {
        server pogocompi:80;
    }

    server {
        listen 443 ssl;
        server_name tu-dominio.local;

        ssl_certificate /etc/nginx/certs/tu-dominio.local.crt;
        ssl_certificate_key /etc/nginx/certs/tu-dominio.local.key;

        location / {
            proxy_pass http://pogocompi;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    server {
        listen 80;
        server_name tu-dominio.local;
        return 301 https://$server_name$request_uri;
    }
}
```

#### **6. Acceso vía túnel HTTPS**
Alternativa rápida usando ngrok o cloudflared:

```bash
# Con ngrok
ngrok http tu-zima-ip:3001

# Con cloudflared
cloudflared tunnel --url http://tu-zima-ip:3001
```

#### **7. Navegadores Compatibles**
- ✅ **Chrome/Edge**: Soporte completo
- ✅ **Firefox**: Soporte completo
- ✅ **Safari (iOS 16.4+)**: Soporte completo
- ⚠️ **Safari (iOS < 16.4)**: Limitado

#### **8. Instalación Manual por Navegador**

**Chrome/Edge:**
1. Busca el ícono de instalación (📱) en la barra de direcciones
2. O ve a Menú → Instalar aplicación

**Firefox:**
1. Ve a Menú → Instalar esta aplicación
2. O busca el ícono de instalación en la barra de direcciones

**Safari (iOS):**
1. Toca "Compartir" (📤)
2. Selecciona "Añadir a pantalla de inicio"
3. Confirma la instalación

**Safari (macOS):**
1. Ve a Archivo → Añadir a Dock
2. O usa el botón de instalación en la barra de direcciones

#### **9. Verificar Estado PWA**
Una vez instalada, verifica que funciona:
- La app debe abrirse en ventana independiente
- Debe funcionar offline (desconecta internet y verifica)
- Los datos deben persistir entre sesiones

#### **🔍 Debug PWA**
Para diagnosticar problemas:

```bash
# Logs de la aplicación
docker logs pogocompi-app

# Verificar archivos PWA en el navegador
# Abre DevTools → Application → Manifest
# Verifica que todos los iconos y configuraciones estén correctos
```

#### **📱 Test de Instalación**
```javascript
// En la consola del navegador, verifica:
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations.length);
});

// Verificar manifest
fetch('/manifest.webmanifest')
  .then(r => r.json())
  .then(manifest => console.log('Manifest:', manifest));
```

## 🚀 Updates

Para actualizaciones manuales:
```bash
docker-compose pull
docker-compose up -d
```

La auto-actualización está habilitada por defecto con Watchtower.
