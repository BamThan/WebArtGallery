FROM node:18

WORKDIR /app

COPY backend/package.json ./
RUN npm install --omit=dev

COPY backend/src ./src

CMD ["node", "src/server.js"]
