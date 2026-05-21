# NeonGate Converter

SaaS visual premium para conversões universais, com login, cadastro, dashboard, limites por plano, histórico e favoritos.

## Recursos

- Layout responsivo para desktop e celular
- Alternância entre tema claro e escuro
- Animações e microinterações em CSS
- Validação visual de email e senha
- Botão para mostrar ou ocultar senha
- Tela de cadastro com medidor visual de senha
- Dashboard SaaS com métricas de conversão
- Conversor universal com abas por categoria
- Histórico e favoritos por conta via `localStorage`
- Plano Free com limite diário e Plus em modo demo
- Backend local sem dependências externas
- Persistência dos emails em `data/emails.json`
- Dashboard aberta depois do login

## Estrutura

- `app/conversion-engine.js`: motor reutilizável de conversões
- `app/state.js`: sessão, plano, limites, histórico e favoritos
- `app/dashboard.js`: UI, tabs, ações e modal Plus
- `OrbitPassServer.java`: backend local de autenticação demo

## Como visualizar

Compile e rode o servidor:

```bash
javac OrbitPassServer.java
java OrbitPassServer
```

Depois abra:

```text
http://localhost:4173
```

## Publicação

Por ter backend, publique em uma plataforma que rode Java, como Render, Railway, Fly.io ou uma VPS. Para uma versão 100% estática, remova as chamadas `/api`.
