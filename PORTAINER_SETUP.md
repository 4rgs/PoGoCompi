# 🐋 Portainer Stack Configuration
# Archivo de configuración para desplegar PoGoCompi en Portainer

## 📋 Instrucciones de Despliegue:

### 1. Crear Stack en Portainer:
- Ve a **Stacks** → **Add Stack**
- Nombre: `pogocompi`
- Método: **Upload**
- Sube el archivo `docker-compose.portainer.yml`

### 2. Variables de Entorno (Opcional):
```env
TZ=America/Santiago
POGOCOMPI_PORT=80
WATCHTOWER_SCHEDULE=0 2 * * *
WATCHTOWER_POLL_INTERVAL=3600
```

### 3. Configuración de Red:
- **Nombre de red**: `pogocompi-net`
- **Subnet**: `172.25.0.0/16`
- **Gateway**: `172.25.0.1`

### 4. Volúmenes:
- **pogocompi-logs**: Logs persistentes de Nginx
- **Tipo**: Local driver
- **Backup**: Recomendado para logs importantes

---

## 🎯 Características Optimizadas para Portainer:

### ✅ **Auto-actualización**:
- Watchtower revisa cada hora nuevas imágenes
- Actualiza automáticamente a las 2:00 AM
- Limpia imágenes viejas para ahorrar espacio

### ✅ **Límites de recursos**:
- PoGoCompi: 256MB RAM máx, 64MB reservado
- Watchtower: 64MB RAM máx, 32MB reservado
- CPU limitado para no sobrecargar el servidor

### ✅ **Monitoreo**:
- Health checks cada 30 segundos
- Logs estructurados y persistentes
- Métricas visibles en Portainer

### ✅ **Seguridad**:
- Socket Docker en modo read-only
- Acceso controlado por equipos/usuarios
- Red interna aislada

---

## 🚀 Acceso y Uso:

### **URL de acceso**:
```
http://tu-servidor-ip:80
```

### **Monitoreo en Portainer**:
1. **Containers**: Ver estado de contenedores
2. **Logs**: Logs en tiempo real
3. **Stats**: Uso de CPU/RAM
4. **Health**: Estado de health checks

### **Watchtower Logs**:
```bash
docker logs pogocompi-watchtower
```

---

## 🔧 Personalización:

### **Cambiar puerto**:
```yaml
ports:
  - "3001:80"  # Puerto personalizado
```

### **Cambiar zona horaria**:
```yaml
environment:
  - TZ=America/Mexico_City
```

### **Cambiar horario de actualización**:
```yaml
environment:
  - WATCHTOWER_SCHEDULE=0 3 * * *  # 3:00 AM
```

### **Desactivar auto-actualización**:
```yaml
labels:
  - "com.centurylinklabs.watchtower.enable=false"
```

---

## 📱 PWA (Progressive Web App):

La aplicación funciona como PWA:
- **Instalable**: Desde cualquier navegador
- **Offline**: Funciona sin conexión
- **Responsive**: Adaptada a móviles
- **Rápida**: Carga instantánea

### **Para instalar como PWA**:
1. Abre en navegador móvil
2. Busca "Agregar a pantalla inicio"
3. Confirma instalación
4. ¡Listo! Funciona como app nativa

---

## 🔍 Troubleshooting:

### **App no carga**:
```bash
# Verificar contenedor
docker ps | grep pogocompi

# Ver logs
docker logs pogocompi-app

# Verificar health
docker exec pogocompi-app wget -qO- http://localhost/health
```

### **Watchtower no actualiza**:
```bash
# Ver logs de Watchtower
docker logs pogocompi-watchtower

# Forzar actualización
docker exec pogocompi-watchtower watchtower --run-once
```

### **Problemas de red**:
```bash
# Verificar red
docker network ls | grep pogocompi

# Inspeccionar red
docker network inspect pogocompi-net
```

---

## 📊 Métricas Recomendadas:

### **Monitoreo en Portainer**:
- ✅ CPU usage < 50%
- ✅ Memory usage < 80%
- ✅ Health check: Healthy
- ✅ Uptime > 99%

### **Alertas sugeridas**:
- 🚨 Container down
- 🚨 Memory > 200MB
- 🚨 Health check failed
- 🚨 Update failed

---

**¡Stack listo para producción con Portainer!** 🚀
