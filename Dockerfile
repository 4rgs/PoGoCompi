# Dockerfile simplificado para aplicación React PWA optimizada para Cloud Run

# Etapa de build - Usar la misma versión de Node que tienes localmente (20)
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

# Instalar dumb-init para manejo adecuado de señales
RUN apk add --no-cache dumb-init

# Crear directorio para nginx pid
RUN mkdir -p /tmp/nginx

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos construidos desde la etapa de build
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer puerto que usa Cloud Run por defecto
EXPOSE 8080

# Usar dumb-init como entrypoint
ENTRYPOINT ["dumb-init", "--"]

# Comando para iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
