FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json .

RUN npm ci

RUN npm run prisma:all:generate

COPY . .

RUN npm run build

CMD ["dist/index.handler"]