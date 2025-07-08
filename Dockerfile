FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN npm run build               

FROM nginx:1.25-alpine          
WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist ./

RUN rm -rf /etc/nginx/conf.d/*

EXPOSE 80                       # puerto real que escucha Nginx

HEALTHCHECK CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]



