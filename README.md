# ZPRO Agenda — Frontend

Frontend público do sistema **ZPRO Agenda**, usado pelo cliente final para realizar o agendamento
através de um link enviado pelo WhatsApp.

Domínio: `https://agenda.linkaonline.cloud`

> Escopo desta primeira versão: rota `/a/{token}`, validação do link, Telas 1 a 4 do fluxo de
> agendamento, tela de link expirado e tela de confirmação — conforme a seção 34 da especificação.
> As chamadas de profissionais/disponibilidade/pagamento já estão implementadas no frontend
> apontando para os endpoints do backend; elas ficarão totalmente funcionais quando as integrações
> de fase 2 (Z-PRO, Google Calendar, Asaas) forem implementadas no backend.

## Requisitos

- Node.js 20+
- npm 10+
- Angular CLI 19 (`npx @angular/cli`, não precisa instalar globalmente)

## Stack

- Angular 19 (standalone components, sem NgModules)
- TypeScript
- Tailwind CSS (sem Angular Material)
- Angular Router, HttpClient, Reactive Forms
- Layout mobile-first

## Instalação

```bash
npm install
```

## Configuração da URL da API

A URL do backend é definida por ambiente em `src/environments/`:

- `environment.ts` (dev): consumindo `http://localhost:8080/api`
- `environment.prod.ts` (produção): consumindo `https://api.agenda.linkaonline.cloud/api`

Ajuste esses arquivos se os domínios mudarem — não há variáveis de ambiente em runtime no Angular,
a URL é definida em tempo de build.

## Execução em desenvolvimento

```bash
npm start
# ou
npx ng serve
```

Acesse `http://localhost:4200/a/{qualquer-token}` (o backend precisa estar rodando e ter gerado
um token válido via `POST /api/booking-links`).

## Build de produção

```bash
npx ng build --configuration production
```

Saída em `dist/zpro-agenda-frontend/`.

## Testes

```bash
npx ng test
```

> Nota: rodar os testes com Karma exige um Chrome instalado (`CHROME_BIN`). Em ambientes CI/containers
> sem navegador, use `karma-chrome-launcher` com `ChromeHeadlessNoSandbox`, ou migre para um runner
> headless como o Jest/Web Test Runner.

## Estrutura de pastas

```
src/app/
├── core/               # services/interceptors/guards/models transversais
│   ├── services/         # BookingLinkApiService (validação do token)
│   └── models/           # ApiResponse, ValidateBookingLinkResult
├── features/
│   └── booking/
│       ├── pages/         # BookingFlowPageComponent (orquestra /a/:token)
│       ├── components/    # Step1..Step4 (as 4 telas do fluxo)
│       ├── services/      # estado do fluxo + chamadas HTTP (professionals, availability, payments)
│       └── models/
├── shared/
│   └── components/       # PageCardComponent, ProgressIndicatorComponent
└── pages/
    ├── expired-link/      # tela de link inválido/expirado
    └── confirmation/      # tela de confirmação do agendamento
```

## Fluxo

`/a/{token}` → valida o token no backend → libera Tela 1 (Serviço) → Tela 2 (Profissional) →
Tela 3 (Data/Horário) → Tela 4 (Pagamento) → `/confirmacao`.

Se o token for inválido/expirado em qualquer momento da validação inicial, o usuário é
redirecionado para `/link-expirado`.

O token do link é mantido apenas em memória (via `BookingStateService`, usando Angular signals)
durante a navegação — nunca em `localStorage`, conforme a seção 23 da especificação.

## Regras respeitadas

- O Angular **nunca** chama diretamente Asaas, Google Calendar ou a API externa do Z-PRO — tudo
  passa pelos endpoints do Backend Agenda.
- Nenhum dado sensível de cartão é armazenado ou processado no frontend.
- Angular Material não é usado; toda a UI é Tailwind CSS.
