############  BUILD  ############
FROM node:20-alpine AS build
WORKDIR /app

# 1) deps completas (prod + dev) → hace falta Vite
COPY package*.json ./
RUN npm ci

# 2) copia el resto y compila la SPA
COPY . .
RUN npm run build                # genera /app/dist

############  RUNTIME ############
FROM nginx:1.25-alpine AS runtime
WORKDIR /usr/share/nginx/html

# ⚠️ SOLO artefactos finales; el nodo_modules se descarta
COPY --from=build /app/dist .

EXPOSE 80
HEALTHCHECK CMD wget -qO- http://localhost:80/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
