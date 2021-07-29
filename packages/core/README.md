# @logto/core

The core backend service.

## Get Started

Copy proper `.env` to project root. (TBD: design the config process)

```bash
pnpm i && pnpm dev
```

## OpenAPI Doc

OpenAPI (Swagger) json is available on `http(s)://your-domain/api/swagger.json`. If you are running locally, the default URL will be `http://localhost:3001/api/swagger.json`. Consume it in the way you like.

### Using ReDoc

The doc website can be served by [redoc-cli](https://github.com/Redocly/redoc/blob/master/cli/README.md) in an extremely easy way:

```bash
npx redoc-cli serve http://localhost:3001/api/swagger.json
```

### Using Swagger Editor

Copy the API output and paste it in the [Swagger Editor](https://editor.swagger.io/).
