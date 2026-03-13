FROM node:20-alpine AS builder
WORKDIR /app

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

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist         ./dist
COPY --from=builder /app/prisma       ./prisma
COPY package*.json ./

RUN mkdir -p uploads && chown appuser:appgroup uploads

USER appuser

EXPOSE 3001

# Executa migrations e inicia o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
