# NeonGate Login

Página de login neon responsiva, com backend Java e dashboard pós-login.

## Recursos

- Layout responsivo para desktop e celular
- Alternância entre tema claro e escuro
- Animações e microinterações em CSS
- Validação visual de email e senha
- Botão para mostrar ou ocultar senha
- Backend local sem dependências externas
- Persistência dos emails em `data/emails.json`
- Dashboard aberta depois do login

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
