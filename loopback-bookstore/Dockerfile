# ---- Backend microservice loopback-bookstore ----
  FROM node:16-slim

  WORKDIR /app
  
  COPY package*.json ./
  RUN npm install --legacy-peer-deps
  
  COPY . .
  
  # On supprime le dossier des tests pour que le compilateur ne plante pas dessus
  RUN rm -rf src/__tests__
  
  RUN npm run build
  
  ENV HOST=0.0.0.0
  ENV PORT=3000
  EXPOSE 3000
  
  CMD ["node", "."]