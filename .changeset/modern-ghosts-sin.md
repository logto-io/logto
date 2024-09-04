---
"@logto/tunnel": minor
---

add deploy command and env support

#### Add new `deploy` command to deploy your local custom UI assets to your Logto Cloud tenant

1. Create a machine-to-machine app with Management API permissions in your Logto tenant.
2. Run the following command:

```bash
npx @logto/tunnel deploy --auth <your-m2m-app-id>:<your-m2m-app-secret> --endpoint https://<tenant-id>.logto.app --management-api-resource https://<tenant-id>.logto.app/api --experience-path /path/to/your/custom/ui
```

Note:
1. The `--management-api-resource` (or `--resource`) can be omitted when using the default Logto domain, since the CLI can infer the value automatically. If you are using custom domain for your Logto endpoint, this option must be provided.
2. You can also specify an existing zip file (`--zip-path` or `--zip`) instead of a directory to deploy. Only one of `--experience-path` or `--zip-path` can be used at a time.

```bash
npx @logto/tunnel deploy --auth <your-m2m-app-id>:<your-m2m-app-secret> --endpoint https://<tenant-id>.logto.app --zip-path /path/to/your/custom/ui.zip
```

#### Add environment variable support

1. Create a `.env` file in the CLI root directory, or any parent directory where the CLI is located.
2. Alternatively, specify environment variables directly when running CLI commands:

```bash
LOGTO_ENDPOINT=https://<tenant-id>.logto.app npx @logto/tunnel ...
```

Supported environment variables:

- LOGTO_AUTH
- LOGTO_ENDPOINT
- LOGTO_EXPERIENCE_PATH (or LOGTO_PATH)
- LOGTO_EXPERIENCE_URI (or LOGTO_URI)
- LOGTO_MANAGEMENT_API_RESOURCE (or LOGTO_RESOURCE)
- LOGTO_ZIP_PATH (or LOGTO_ZIP)
```
