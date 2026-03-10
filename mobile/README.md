# Usina ERP – Mobile

Aplicativo mobile para monitoramento e operação da usina de asfalto.

## Tecnologias
- React Native + Expo SDK 50
- TypeScript
- React Navigation (Bottom Tabs + Stack)
- Axios (REST API)
- WebSocket (tempo real: balança + MX3000)
- AsyncStorage (autenticação JWT)

## Telas
| Tela | Descrição |
|------|-----------|
| Login | Autenticação JWT |
| Dashboard | Painel com MX3000 em tempo real, leitura da balança, resumo financeiro |
| Produção | Ordens de produção — iniciar, pausar, concluir |
| Balança | Pesagem em tempo real, registro de tickets |
| Estoque | Materiais com alertas de estoque mínimo |
| Financeiro | KPIs financeiros, contas a pagar/receber |

## Configuração

```bash
cp .env.example .env
# Edite EXPO_PUBLIC_API_URL com o IP do servidor backend
npm install
npm start
```

## Variáveis de Ambiente
| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `EXPO_PUBLIC_API_URL` | URL base da API REST | `http://192.168.1.100:3001/api` |

> O WebSocket é inferido automaticamente da API URL substituindo `/api` por `/ws`.
