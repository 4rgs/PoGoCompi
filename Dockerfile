############  BUILD  ############
FROM node:20-alpine AS build
WORKDIR /app

# Variables de entorno para build
ARG VITE_GIT_COMMIT=unknown
ARG VITE_BUILD_DATE=unknown
ENV VITE_GIT_COMMIT=$VITE_GIT_COMMIT
ENV VITE_BUILD_DATE=$VITE_BUILD_DATE

# 1) deps completas (prod + dev) → hace falta Vite
COPY package*.json ./
RUN npm ci

# 2) copia el resto y compila la SPA
COPY . .
RUN npm run build                # genera /app/dist

############  RUNTIME ############
FROM nginx:1.26-alpine AS runtime
WORKDIR /usr/share/nginx/html

# Instalar wget para el healthcheck
RUN apk add --no-cache wget

# Copiar configuración nginx optimizada para PWA
COPY nginx.conf /etc/nginx/nginx.conf

# ⚠️ SOLO artefactos finales; el nodo_modules se descarta
COPY --from=build /app/dist .

EXPOSE 8080
HEALTHCHECK CMD wget -qO- http://localhost:8080/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
