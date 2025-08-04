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

# Crear configuración nginx optimizada para PWA
RUN cat > /etc/nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Configuración para PWA
    map $sent_http_content_type $expires {
        default                    off;
        text/html                  epoch;
        text/css                   max;
        application/javascript     max;
        application/woff2          max;
        ~image/                    max;
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    server {
        listen 8080;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Headers de seguridad para PWA
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";

        # Cache headers
        expires $expires;

        # Manifest y Service Worker con headers específicos
        location = /manifest.webmanifest {
            add_header Content-Type application/manifest+json;
            add_header Cache-Control "public, max-age=31536000";
        }

        location = /sw.js {
            add_header Content-Type application/javascript;
            add_header Cache-Control "public, max-age=0";
            add_header Service-Worker-Allowed "/";
        }

        location = /registerSW.js {
            add_header Content-Type application/javascript;
            add_header Cache-Control "public, max-age=31536000";
        }

        # Assets estáticos con cache largo
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            add_header Cache-Control "public, max-age=31536000";
        }

        # Fallback para SPA
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

# ⚠️ SOLO artefactos finales; el nodo_modules se descarta
COPY --from=build /app/dist .

EXPOSE 8080
HEALTHCHECK CMD wget -qO- http://localhost:8080/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
