# Etapa de build - Usar versión segura y con soporte LTS
FROM node:20-alpine AS build

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para build)
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Etapa de producción con Nginx
FROM nginx:alpine

# Preparar entorno de Nginx: instalar utilidades, crear directorios necesarios
RUN apk add --no-cache dumb-init && \
    mkdir -p /tmp/nginx && \
    chmod 755 /tmp/nginx

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos construidos desde la etapa de build
COPY --from=build /app/dist /usr/share/nginx/html

# Crear un script de inicio para manejar correctamente la PID y los logs
RUN echo '#!/bin/sh\n\
mkdir -p /tmp/nginx\n\
touch /tmp/nginx/access.log /tmp/nginx/error.log\n\
echo "Starting Nginx..."\n\
exec nginx -g "daemon off; pid /tmp/nginx/nginx.pid;"\n' > /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Exponer puerto que usa Cloud Run por defecto
EXPOSE 8080

# Usar dumb-init como entrypoint para una mejor gestión de señales
ENTRYPOINT ["dumb-init", "--"]

# Comando para iniciar Nginx a través de nuestro script
CMD ["/docker-entrypoint.sh"]
