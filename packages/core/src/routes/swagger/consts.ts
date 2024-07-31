export const managementApiAuthDescription = `Logto Management API is a comprehensive set of REST APIs that gives you the full control over Logto to suit your product needs and tech stack. To see the full guide on Management API interactions, visit [Interact with Management API](https://docs.logto.io/docs/recipes/interact-with-management-api/).

### Get started

The API follows the same authentication principles as other API resources in Logto, with some slight differences. To use Logto Management API:

1. A machine-to-machine (M2M) application needs to be created.
2. A machine-to-machine (M2M) role with Management API permission \`all\` needs to be assigned to the application.

Once you have them set up, you can use the \`client_credentials\` grant type to fetch an access token and use it to authenticate your requests to the Logto Management API.

### Fetch an access token

To fetch an access token, you need to make a \`POST\` request to the \`/oidc/token\` endpoint of your Logto tenant.

For Logto Cloud users, the base URL is your Logto endpoint, i.e. \`https://[tenant-id].logto.app\`. The tenant ID can be found in the following places:

- The first path segment of the URL when you are signed in to Logto Cloud. For example, if the URL is \`https://cloud.logto.io/foo/get-started\`, the tenant ID is \`foo\`.
- In the "Settings" tab of Logto Cloud.

The request should follow the OAuth 2.0 [client credentials](https://datatracker.ietf.org/doc/html/rfc6749#section-4.4) grant type. Here is a non-normative example of how to fetch an access token:

\`\`\`bash
curl --location \\
  --request POST 'https://[tenant-id].logto.app/oidc/token' \\
  --header 'Content-Type: application/x-www-form-urlencoded' \\
  --data-urlencode 'grant_type=client_credentials' \\
  --data-urlencode 'client_id=[app-id]' \\
  --data-urlencode 'client_secret=[app-secret]' \\
  --data-urlencode 'resource=https://[tenant-id].logto.app/api' \\
  --data-urlencode 'scope=all'
\`\`\`

Replace \`[tenant-id]\`, \`[app-id]\`, and \`[app-secret]\` with your Logto tenant ID, application ID, and application secret, respectively.

The response will be like:

\`\`\`json
{
  "access_token": "eyJhbG...2g", // Use this value for accessing the Logto Management API
  "expires_in": 3600, // Token expiration in seconds
  "token_type": "Bearer", // Token type for your request when using the access token
  "scope": "all" // Scope \`all\` for Logto Management API
}
\`\`\`

### Use the access token

Once you have the access token, you can use it to authenticate your requests to the Logto Management API. The access token should be included in the \`Authorization\` header of your requests with the \`Bearer\` authentication scheme.

Here is an example of how to list the first page of users in your Logto tenant:

\`\`\`bash
curl --location \\
  --request GET 'https://[tenant-id].logto.app/api/users' \\
  --header 'Authorization: Bearer eyJhbG...2g'
\`\`\`

Replace \`[tenant-id]\` with your Logto tenant ID and \`eyJhbG...2g\` with the access token you fetched earlier.`;
