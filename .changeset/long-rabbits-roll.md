---
"@logto/tunnel": minor
---

add new cli command to setup Logto tunnel service for developing and debugging custom ui on your local machine

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
