FROM node:20-alpine AS builder

WORKDIR /app

COPY *.json ./
COPY src src

RUN npm install

RUN npm run build


FROM node:20-alpine

COPY --from=builder /app/dist app
COPY --from=builder /app/node_modules /app/node_modules

CMD ["node", "/app/main.js"]
