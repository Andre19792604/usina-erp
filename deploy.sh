#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Usina ERP — Script de instalação/atualização no VPS
# Uso: bash deploy.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

REPO="https://github.com/Andre19792604/usina-erp.git"
DIR="/opt/usina-erp"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# ── 1. Verificar dependências ─────────────────────────────────────────────────
command -v docker  >/dev/null 2>&1 || error "Docker não encontrado. Instale em: https://docs.docker.com/engine/install/"
command -v git     >/dev/null 2>&1 || error "Git não encontrado. Execute: apt install git"
info "Dependências OK"

# ── 2. Clonar ou atualizar repositório ───────────────────────────────────────
if [ -d "$DIR/.git" ]; then
  info "Repositório existente encontrado — atualizando..."
  git -C "$DIR" pull origin main
else
  info "Clonando repositório..."
  git clone "$REPO" "$DIR"
fi
cd "$DIR"

# ── 3. Criar .env se não existir ─────────────────────────────────────────────
if [ ! -f ".env" ]; then
  warn ".env não encontrado — criando a partir do exemplo..."
  cp .env.example .env

  # Gerar JWT_SECRET aleatório automaticamente
  JWT=$(openssl rand -hex 64)
  sed -i "s|GERE_UMA_CHAVE_FORTE_AQUI|$JWT|" .env

  # Gerar senha do banco aleatória
  DBPASS=$(openssl rand -base64 20 | tr -dc 'a-zA-Z0-9' | head -c 20)
  sed -i "s|TROQUE_ESTA_SENHA_FORTE|$DBPASS|" .env

  echo ""
  warn "Arquivo .env criado com senhas geradas automaticamente."
  warn "Edite o IP/domínio em FRONTEND_URL antes de continuar:"
  echo ""
  echo "    nano $DIR/.env"
  echo ""
  read -p "Pressione ENTER após editar o .env para continuar..." _
fi

# ── 4. Build e subir containers ───────────────────────────────────────────────
info "Construindo imagens Docker..."
docker compose build --no-cache

info "Subindo serviços..."
docker compose up -d

# ── 5. Aguardar backend ficar saudável ────────────────────────────────────────
info "Aguardando backend inicializar (migrations + seed)..."
TRIES=0
until curl -sf http://localhost:3001/health >/dev/null 2>&1; do
  TRIES=$((TRIES+1))
  [ $TRIES -gt 30 ] && error "Backend não respondeu após 60s. Veja: docker compose logs backend"
  sleep 2
done

info "Backend OK"

# ── 6. Status final ───────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}  Usina ERP instalado com sucesso!         ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
echo "  Acesse: http://$IP"
echo "  Login:  admin@usina.com"
echo "  Senha:  admin123"
echo ""
warn "Troque a senha do admin no primeiro acesso!"
echo ""
echo "  Logs:    docker compose logs -f"
echo "  Parar:   docker compose down"
echo "  Backup:  docker compose exec postgres pg_dump -U usina usina_erp > backup.sql"
echo ""
