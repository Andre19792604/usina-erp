# ─────────────────────────────────────────────────────────────────────────────
# Usina ERP — Script de instalação/atualização no Windows
# Execute no PowerShell como Administrador:
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#   .\deploy.ps1
# ─────────────────────────────────────────────────────────────────────────────
$ErrorActionPreference = "Stop"

$REPO = "https://github.com/Andre19792604/usina-erp.git"
$DIR  = "C:\usina-erp"

function info($msg)  { Write-Host "[OK] $msg" -ForegroundColor Green }
function warn($msg)  { Write-Host "[!]  $msg" -ForegroundColor Yellow }
function erro($msg)  { Write-Host "[X]  $msg" -ForegroundColor Red; exit 1 }

# ── 1. Verificar dependências ─────────────────────────────────────────────────
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    erro "Docker não encontrado. Instale o Docker Desktop em: https://www.docker.com/products/docker-desktop/"
}
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    erro "Git não encontrado. Instale em: https://git-scm.com/download/win"
}
info "Dependências OK"

# ── 2. Clonar ou atualizar repositório ───────────────────────────────────────
if (Test-Path "$DIR\.git") {
    info "Repositório existente — atualizando..."
    git -C $DIR pull origin main
} else {
    info "Clonando repositório..."
    git clone $REPO $DIR
}
Set-Location $DIR

# ── 3. Criar .env se não existir ─────────────────────────────────────────────
if (-not (Test-Path ".env")) {
    warn ".env não encontrado — criando..."
    Copy-Item ".env.example" ".env"

    # Gerar JWT_SECRET e senha do banco aleatórios
    $JWT    = -join ((1..64) | ForEach-Object { '{0:x}' -f (Get-Random -Max 16) })
    $DBPASS = -join ((1..20) | ForEach-Object { [char](Get-Random -Min 65 -Max 90) })

    (Get-Content ".env") `
        -replace "GERE_UMA_CHAVE_FORTE_AQUI", $JWT `
        -replace "TROQUE_ESTA_SENHA_FORTE",   $DBPASS |
        Set-Content ".env"

    Write-Host ""
    warn "Arquivo .env criado. Edite o IP/domínio do servidor:"
    Write-Host "    notepad $DIR\.env" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Altere a linha FRONTEND_URL=http://SEU_IP_OU_DOMINIO" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Pressione ENTER após editar o .env para continuar"
}

# ── 4. Build e subir containers ───────────────────────────────────────────────
info "Construindo imagens Docker..."
docker compose build --no-cache

info "Subindo serviços..."
docker compose up -d

# ── 5. Aguardar backend ficar saudável ────────────────────────────────────────
info "Aguardando backend inicializar (migrations + seed)..."
$tries = 0
do {
    Start-Sleep -Seconds 3
    $tries++
    if ($tries -gt 30) { erro "Backend não respondeu. Veja: docker compose logs backend" }
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -ErrorAction Stop
        $ok = $r.StatusCode -eq 200
    } catch { $ok = $false }
} while (-not $ok)

info "Backend OK"

# ── 6. Status final ───────────────────────────────────────────────────────────
Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Green
Write-Host "  Usina ERP instalado com sucesso!         " -ForegroundColor Green
Write-Host "═══════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "  Acesse:  http://localhost" -ForegroundColor Cyan
Write-Host "  Login:   admin@usina.com"
Write-Host "  Senha:   admin123"
Write-Host ""
warn "Troque a senha do admin no primeiro acesso!"
Write-Host ""
Write-Host "  Logs:    docker compose logs -f"
Write-Host "  Parar:   docker compose down"
Write-Host "  Backup:  docker compose exec postgres pg_dump -U usina usina_erp > backup.sql"
Write-Host ""
