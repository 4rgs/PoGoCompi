EXPOSE 80                       

HEALTHCHECK CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]



