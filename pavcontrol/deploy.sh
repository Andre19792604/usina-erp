#!/bin/bash
set -e

echo "========================================="
echo "  PavControl - Deploy"
echo "========================================="

# Verifica Docker
if ! command -v docker &> /dev/null; then
  echo "Docker não encontrado. Instalando..."
  curl -fsSL https://get.docker.com | sh
fi

if ! command -v docker compose &> /dev/null; then
  echo "Docker Compose não encontrado."
  exit 1
fi

# Build e deploy
echo "Construindo e iniciando containers..."
docker compose down
docker compose build --no-cache
docker compose up -d

# Aguarda banco
echo "Aguardando banco de dados..."
sleep 5

# Executa seed
echo "Executando seed..."
docker exec pavcontrol-backend sh -c "npx prisma db seed" || true

echo "========================================="
echo "  PavControl rodando!"
echo "  Frontend: http://localhost:5174"
echo "  Backend:  http://localhost:3002"
echo "  Login: admin@pavcontrol.com / admin123"
echo "========================================="
