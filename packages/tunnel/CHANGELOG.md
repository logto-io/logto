# @logto/tunnel

## 0.3.1

### Patch Changes

- Updated dependencies [35bbc4399]
  - @logto/shared@3.3.0

## 0.3.0

### Minor Changes

- 2961d355d: bump node version to ^22.14.0

### Patch Changes

- Updated dependencies [2961d355d]
  - @logto/core-kit@2.6.0
  - @logto/shared@3.2.0

## 0.2.6

### Patch Changes

- 6144149bb: disallow zstd compression to fix potential garbled text response

## 0.2.5

### Patch Changes

- e11e57de8: bump dependencies for security update
- Updated dependencies [e11e57de8]
  - @logto/core-kit@2.5.4
  - @logto/shared@3.1.4

## 0.2.4

### Patch Changes

- Updated dependencies [62eb8ed8d]
- Updated dependencies [a8080e891]
  - @logto/core-kit@2.5.3
  - @logto/shared@3.1.3

## 0.2.3

### Patch Changes

- Updated dependencies [239b81e31]
  - @logto/core-kit@2.5.2

## 0.2.2

### Patch Changes

- Updated dependencies [bc2a0ac03]
  - @logto/shared@3.1.2

## @logto/tunnel@0.2.1

### Patch Changes

- 349a6a405: support range request for mp4 video source hosting

  Safari browser uses range request to fetch video data, but it was not supported by the `@logto/tunnel` CLI tool. This prevents our users who want to build custom sign-in pages with video background. In order to fix this, we need to partially read the video file stream based on the `range` request header, and set proper response headers and status code (206).

- Updated dependencies [3c993d59c]
  - @logto/core-kit@2.5.1

## @logto/tunnel@0.2.0

### Minor Changes

- ff4cd67a9: add deploy command and env support

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

## 0.1.0

### Minor Changes

- 976558af9: add new cli command to setup Logto tunnel service for developing and debugging custom ui on your local machine

  This command will establish a tunnel service between the following 3 entities: Logto cloud auth services, your application, and your custom sign-in UI.

  #### Installation

  ```bash
  npm i @logto/tunnel -g
  ```

  #### Usage

  Assuming you have a custom sign-in page running on `http://localhost:4000`, then you can execute the command this way:

  ```bash
  logto-tunnel --endpoint https://<tenant-id>.logto.app --port 9000 --experience-uri http://localhost:4000
  ```

  Or if you don't have your custom UI pages hosted on a dev server, you can use the `--experience-path` option to specify the path to your static files:

  ```bash
  logto-tunnel --endpoint https://<tenant-id>.logto.app --port 9000 --experience-path /path/to/your/custom/ui
  ```

  This command also works if you have enabled custom domain in your Logto tenant. E.g.:

  ```bash
  logto-tunnel --endpoint https://your-custom-domain.com --port 9000 --experience-path /path/to/your/custom/ui
  ```

  This should set up the tunnel and it will be running on your local machine at `http://localhost:9000/`.

  Finally, run your application and set its endpoint in Logto config to the tunnel address `http://localhost:9000/` instead.

  If all set up correctly, when you click the "sign-in" button in your application, you should be navigated to your custom sign-in page instead of Logto's built-in UI, along with valid session (cookies) that allows you to further interact with Logto experience API.

  Refer to [Logto tunnel documentation](https://docs.logto.dev/docs/references/tunnel-cli/) for more details.
