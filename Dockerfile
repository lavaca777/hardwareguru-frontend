# syntax=docker/dockerfile:1

FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_USE_MOCKS=true
ARG VITE_REAL_CATALOG=false
ARG VITE_REAL_SIMULATION=false
ARG VITE_REAL_CHAT=false
ARG VITE_API_URL=http://localhost:3000/api
ARG VITE_MOCK_DELAY_MS=400

ENV VITE_USE_MOCKS=${VITE_USE_MOCKS}
ENV VITE_REAL_CATALOG=${VITE_REAL_CATALOG}
ENV VITE_REAL_SIMULATION=${VITE_REAL_SIMULATION}
ENV VITE_REAL_CHAT=${VITE_REAL_CHAT}
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_MOCK_DELAY_MS=${VITE_MOCK_DELAY_MS}

RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
