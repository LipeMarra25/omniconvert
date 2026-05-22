# OmniConvert - Project Context

Este arquivo existe para retomar o projeto em outro PC ou em outro chat com o Codex.

## Projeto

Nome: OmniConvert

Posicionamento atual:
OmniConvert e uma plataforma SaaS premium de utilities.

Slogan:
Convert. Calculate. Transform.

Conceito:
Uma central moderna para conversoes, ferramentas tecnicas, calculos e utilidades para usuarios, devs, estudantes e profissionais.

Repositorio GitHub:
https://github.com/LipeMarra25/omniconvert

Pasta local atual deste PC:
C:\Users\Delta\Documents\Codex\2026-05-21\vamos-criar-uma-p-gina-de

## Stack atual

- Java puro no backend local
- HTML estatico
- CSS
- JavaScript modular
- LocalStorage/mock state para sessao, plano, uso, historico e favoritos
- API Frankfurter para moedas em tempo real, com cache/fallback

Servidor principal:
OmniConvertServer.java

Porta local:
http://localhost:4173

Dashboard:
http://localhost:4173/dashboard.html

Conversor:
http://localhost:4173/dashboard.html#converter

## Identidade visual

Direcao atual:
- SaaS premium minimalista
- Dark mode
- Cyberpunk muito sutil
- Roxo, ciano e azul como acentos
- Glassmorphism leve
- Menos gamer/neon exagerado
- Mais Linear/Vercel/Stripe/Raycast
- Filosofia: "Basico muito bem feito"

Paleta usada:
- Background: #070816
- Card: #0C1020
- Elevated: #11162A
- Purple: #8A5CFF
- Cyan: #59E3FF
- White: #F5F7FF
- Muted: #A9AEC4
- Border: rgba(255,255,255,0.08)

## Brand system criado

Foi criada a pasta:
assets/brand/

Arquivos gerados:
- omniconvert-logo-full.svg
- omniconvert-logo-full.png
- omniconvert-logo-mono.svg
- omniconvert-icon.svg
- omniconvert-icon.png
- omniconvert-icon-mono.svg
- omniconvert-wordmark.svg
- favicon.png
- favicon.ico

Integracao:
- Login e cadastro usam a logo completa.
- Dashboard/sidebar usam icone pequeno + wordmark.
- Favicon foi adicionado nas paginas.
- Loading de login/cadastro usa icone OC com animacao sutil.

Classes CSS criadas:
- .brand-logo
- .brand-logo-full
- .brand-logo-icon
- .brand-wordmark
- .brand-favicon
- .brand-loading

## Funcionalidades ja existentes

Autenticacao demo:
- Login
- Cadastro
- Sessao local
- Persistencia local

Backend Java:
- Serve HTML/CSS/JS/assets
- POST /api/login
- POST /api/register
- GET /api/leads
- Salva emails em data/emails.json
- MIME types corrigidos para SVG, PNG e ICO

Dashboard:
- Sidebar
- Overview
- Cards de uso
- Plano atual
- Favoritos
- Historico
- Plano Plus
- Settings

Conversor Universal:
- Conversao instantanea
- Historico
- Favoritos
- Limite de uso Free
- Plano Plus demo
- Modal de upgrade
- Copiar resultado
- Salvar no historico
- Resetar campo
- Inverter unidades

Moedas:
- Integracao com Frankfurter API
- Cambio real quando disponivel
- Cache diario por par
- Fallback local se API falhar

## Estrutura modular criada

Arquivos/pastas importantes:

- app/conversion-engine.js
- app/api-layer/currency-api.js
- app/dashboard.js
- app/state.js
- app/tools/tool-registry.js
- app/storage/storage.js
- app/plans/plans.js
- app/favorites/
- app/history/
- app/usage-limits/

Observacao:
Algumas pastas como app/favorites, app/history e app/usage-limits foram criadas para arquitetura futura, mas ainda podem estar vazias ou parcialmente preparadas.

## Ultimas mudancas grandes feitas

1. Rebranding de NeonGate para OmniConvert.
2. Transformacao do conceito para Universal Tools Platform.
3. Criacao de dashboard SaaS premium minimalista.
4. Criacao do brand kit em assets/brand.
5. Integracao de logos, favicon e loading brand.
6. Ajuste do backend Java para servir assets de imagem corretamente.
7. Inicio de redesign da area Universal Converter.
8. Polish da area Universal Converter sem alterar o motor de conversao.

## Estado atual da Universal Converter

A area Universal Converter foi parcialmente reorganizada e estabilizada.

Ela agora tem:
- Search maior no topo.
- Main tabs em linha:
  - Units
  - Currency
  - Data
  - Scientific
  - Time
  - Colors
- Subcategorias filtradas pela main tab ativa.
- Workspace central de conversao.
- Result card com resultado, detalhe e formula.
- Actions horizontais:
  - Copy
  - Save
  - Favorite
  - Share
  - Reset
- Painel lateral com recentes e presets.

Teste validado:
10 mm -> 1 cm

Resultado esperado:
1 cm

O motor de conversao nao foi alterado nesta etapa.

## Pontos conhecidos / pendencias

- Botao Share ainda nao tem fluxo real.
- Existe TODO no app/dashboard.js para conectar Share depois.
- Universal Converter ainda precisa de polish visual fino.
- Algumas strings aparecem com encoding estranho em arquivos antigos por causa de acentos, mas a tela continua funcional.
- CSS esta acumulado com camadas antigas + novas; futuramente convem limpar/refatorar.
- A arquitetura planejada ainda nao esta totalmente separada em componentes reais.
- Favoritos, historico e usage-limits ainda podem ser modularizados melhor.

## Como rodar neste PC ou em outro

No terminal, dentro da pasta do projeto:

```bash
javac OmniConvertServer.java
java OmniConvertServer
```

Depois abrir:

```text
http://localhost:4173
```

Dashboard:

```text
http://localhost:4173/dashboard.html
```

Conversor:

```text
http://localhost:4173/dashboard.html#converter
```

## Como baixar em outro PC

No outro PC:

```bash
git clone https://github.com/LipeMarra25/omniconvert.git
cd omniconvert
```

Depois compilar e rodar:

```bash
javac OmniConvertServer.java
java OmniConvertServer
```

## Como retomar com Codex no outro PC

Mensagem sugerida para mandar no outro PC:

```text
Codex, estou continuando o projeto OmniConvert em outro PC.
Leia PROJECT_CONTEXT.md e TODO.md.
Quero continuar exatamente de onde paramos, sem reconstruir tudo.
Antes de mexer, confira o estado do Git e valide se o projeto roda em http://localhost:4173.
```

## Ultima orientacao do usuario

O usuario pediu para:
- nao reconstruir a pagina inteira;
- nao alterar logica;
- nao mexer no motor de conversao;
- fazer apenas polish visual e organizacao da Universal Converter.

Essa etapa foi feita e validada com conversao simples.

