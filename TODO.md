# OmniConvert - TODO / Next Steps

Este arquivo lista o que ficou pendente para continuar em outro PC.

## Prioridade 0 - Antes de sair deste PC

- Conferir `git status`.
- Adicionar todos os arquivos importantes.
- Fazer commit.
- Fazer push para GitHub.
- No outro PC, fazer clone/pull do repositorio.

Comandos sugeridos:

```bash
git status
git add .
git commit -m "Atualiza dashboard, branding e conversor OmniConvert"
git push
```

## Prioridade 1 - Validacao no outro PC

- Rodar:

```bash
javac OmniConvertServer.java
java OmniConvertServer
```

- Abrir:

```text
http://localhost:4173/dashboard.html#converter
```

- Testar:
  - digitar `10`;
  - manter `mm` para `cm`;
  - confirmar resultado `1 cm`;
  - clicar nas tabs `Units`, `Currency`, `Data`, `Scientific`, `Time`, `Colors`;
  - conferir se a tela nao quebra.

## Prioridade 2 - Universal Converter polish

Objetivo:
Deixar a tela Universal Converter mais limpa, premium e consistente, sem alterar o motor.

Tarefas:
- Refinar spacing dos blocos.
- Ajustar altura dos cards de subcategoria.
- Melhorar alinhamento do result card.
- Melhorar responsividade mobile.
- Revisar states hover/active/focus.
- Trocar textos quebrados por strings sem encoding estranho.
- Melhorar contraste dos pills.
- Refinar painel lateral de recentes/presets.

Regras:
- Nao refatorar tudo.
- Nao mexer em conversion-engine.js sem necessidade.
- Nao quebrar historico, favoritos, limites ou plano Plus.

## Prioridade 3 - Share button

Status:
Parcial.

Existe TODO no codigo.

Ideia:
- Se `navigator.share` existir, usar Web Share API.
- Se nao existir, copiar texto da conversao para clipboard.
- Mostrar toast de sucesso.

## Prioridade 4 - Limpeza tecnica

Objetivo:
Diminuir acumulacao de CSS e separar melhor responsabilidades.

Tarefas:
- Separar CSS por secoes futuramente:
  - base
  - auth
  - dashboard
  - converter
  - brand
- Revisar duplicacoes antigas de `.result-card`, `.tabs-list`, `.converter-form`.
- Remover estilos antigos que nao sao mais usados.
- Padronizar strings com UTF-8 correto ou sem acentos.

## Prioridade 5 - Modularizacao real

Pastas ja criadas ou planejadas:

- app/favorites/
- app/history/
- app/usage-limits/
- app/storage/
- app/plans/
- app/tools/
- app/api-layer/

Proximos passos:
- Mover funcoes de favoritos para app/favorites.
- Mover funcoes de historico para app/history.
- Mover limites de uso para app/usage-limits.
- Deixar app/dashboard.js menor e mais facil de manter.

## Prioridade 6 - SaaS features futuras

- Plano Plus real.
- Stripe ou Mercado Pago.
- Backend com banco real.
- Auth real.
- API de cambio robusta.
- Analytics.
- Multi-language.
- PWA.
- Deploy online.

## Notas importantes

- O projeto ainda e demo/local.
- O backend Java salva emails em `data/emails.json`.
- O estado de uso, favoritos e historico usa localStorage.
- API Frankfurter pode depender de internet; se falhar, usa fallback local.

