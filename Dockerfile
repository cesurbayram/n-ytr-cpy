# Node.js 18 kullan
FROM node:18

# Çalışma dizini
WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Tüm dosyaları kopyala
COPY . .

# TypeScript'i derle
RUN npm run build

# Portları aç
EXPOSE 8081 8082

# Uygulamayı başlat
CMD ["npm", "start"] 