FROM node:20-alpine AS builder

ARG CONTAINER_PORT=3000

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --include=dev --legacy-peer-deps

COPY . .

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /usr/src/app

ENV PORT=${CONTAINER_PORT}

COPY package*.json ./

RUN npm ci --omit=dev --legacy-peer-deps

COPY --from=builder /usr/src/app/dist ./dist

RUN chown -R node:node .
USER node

EXPOSE ${CONTAINER_PORT}

CMD ["node", "dist/main.js"]

