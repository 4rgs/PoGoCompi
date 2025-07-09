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

## 🚀 Updates

Para actualizaciones manuales:
```bash
docker-compose pull
docker-compose up -d
```

La auto-actualización está habilitada por defecto con Watchtower.
