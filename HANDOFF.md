# OmniConvert - Handoff rapido

Use este arquivo se quiser passar o projeto para outro PC rapidamente.

## Comandos para salvar neste PC

```bash
git status
git add .
git commit -m "Atualiza OmniConvert"
git push
```

## Comandos no outro PC

```bash
git clone https://github.com/LipeMarra25/omniconvert.git
cd omniconvert
javac OmniConvertServer.java
java OmniConvertServer
```

Abrir:

```text
http://localhost:4173
```

## Mensagem para enviar ao Codex no outro PC

```text
Codex, estou continuando o OmniConvert em outro PC.
Leia PROJECT_CONTEXT.md, TODO.md e HANDOFF.md.
Continue de onde paramos.
Nao reconstrua tudo.
Primeiro valide se o projeto roda localmente.
```

