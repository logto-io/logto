# Logto Core

Logto is an open-source identity solution. This repo contains the core service.

## Get Started

Create `.env` under project root with the following vars:

```env
DB_URL=postgres://your-postgres-db-url
OIDC_PROVIDER_PRIVATE_KEY_BASE64=private-key-for-oidc-provider-base64-encoded
```

```bash
yarn && yarn dev
```

## Notes

Upgrade `xo` after [this issue](https://github.com/SamVerschueren/vscode-linter-xo/issues/91) is solved.
