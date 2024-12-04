FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

FROM node:20

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package*.json ./

RUN npm install --only=production

ENV PROMETHEUS_URL=http://192.168.13.160:9090
ENV OTEL_COLLECTOR_URL=http://192.168.13.160:4317


EXPOSE 3000



CMD ["node", "dist/main.js"]
