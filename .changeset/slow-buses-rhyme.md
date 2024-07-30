---
"@logto/cli": minor
---

add new cli command to setup proxy for developing and debugging custom ui locally

This command will establish a proxy tunnel between the following 3 entities together: your Logto cloud auth services, your application, and your custom sign-in UI.

Assuming you have a custom sign-in page running on `http://localhost:4000`.
Then you can execute the command this way:

```bash
npm cli proxy --endpoint https://<tenant-id>.logto.app --port 9000 --experience-uri http://localhost:4000
```

Or if you don't have your custom UI pages hosted on a dev server, you can use the `--experience-path` option to specify the path to your static files:

```bash
npm cli proxy --endpoint https://<tenant-id>.logto.app --port 9000 --experience-path /path/to/your/custom/ui
```

This sets up the proxy and it will be running on your local machine at `http://localhost:9000/`.

Finally, run your application and set its Logto endpoint to the proxy address `http://localhost:9000/` instead.

If all set up correctly, when you click the "sign-in" button in your application, you should be navigated to your custom sign-in page instead of Logto's built-in UI, along with valid session (cookies) that allows you to further interact with Logto experience API.

Happy coding!
