# ──────────────── build stage ────────────────
FROM node:20-alpine AS build
WORKDIR /app

# 1️⃣ aprovecha la caché: primero solo package*.json
COPY package*.json ./
RUN npm ci --omit=dev           # instala SOLO deps de producción

# 2️⃣ copia el resto y compila
COPY . .
RUN npm run build               # genera /app/dist

# ─────────────── runtime stage ───────────────
FROM nginx:1.25-alpine          # versión fija → builds reproducibles
WORKDIR /usr/share/nginx/html

# 3️⃣ copia el resultado final
COPY --from=build /app/dist ./

# 4️⃣ opcional: elimina los archivos de configuración por defecto
RUN rm -rf /etc/nginx/conf.d/*
#    ↳ si quieres un nginx.conf propio, cópialo aquí:
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80                       # puerto real que escucha Nginx

HEALTHCHECK CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
