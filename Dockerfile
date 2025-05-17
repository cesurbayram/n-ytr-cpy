FROM node:16-alpine

WORKDIR /app

# Bağımlılık dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Tüm projeyi kopyala
COPY . .

# TypeScript'i derle
RUN npx tsc

# Port ayarı
EXPOSE 8081 8082

# Uygulamayı başlat
CMD ["node", "server.js"] 