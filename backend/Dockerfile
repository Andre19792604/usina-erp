FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate
RUN npm run build

# ─── Imagem de produção (mínima) ─────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist         ./dist
COPY --from=builder /app/prisma       ./prisma
COPY package*.json ./
COPY src ./src

RUN mkdir -p uploads && chown appuser:appgroup uploads

USER appuser

EXPOSE 3001

# Executa migrations e inicia o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx prisma/seed.ts 2>/dev/null; node dist/index.js"]
