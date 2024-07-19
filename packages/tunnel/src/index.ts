import chalk from 'chalk';
import express from 'express';
import { createProxyMiddleware, responseInterceptor } from 'http-proxy-middleware';

import Client from './client/index.js';
import {
  customUiSignInUrl,
  logtoExperienceUrl,
  logtoTunnelServiceUrl,
  tunnelPort,
} from './consts.js';

const app = express();

const client = new Client();
await client.initSession();

// Modify the response body, replace the "redirectTo" url hostname with localhost
const modifyResponseBody = responseInterceptor(async (responseBuffer, proxyResponse) => {
  // eslint-disable-next-line @silverhand/fp/no-let
  let responseBody = responseBuffer.toString(); // Convert buffer to string

  // Check if the response is JSON
  if (proxyResponse.headers['content-type']?.includes('application/json')) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const jsonResponse = JSON.parse(responseBody);
      // eslint-disable-next-line @silverhand/fp/no-mutation, @typescript-eslint/no-unsafe-call
      jsonResponse.redirectTo &&= jsonResponse.redirectTo.replace(
        logtoExperienceUrl,
        logtoTunnelServiceUrl
      );
      // eslint-disable-next-line @silverhand/fp/no-mutation
      responseBody = JSON.stringify(jsonResponse); // Convert back to JSON string
    } catch (error) {
      console.error(chalk.red('Error parsing JSON response:\n'), error);
    }
  }

  // Update cookies
  const setCookie = proxyResponse.headers['set-cookie'];
  if (setCookie?.length) {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    client.rawCookies = setCookie;
  }

  return responseBody;
});

// Setup a route to handle the sign-in callback and print the ID token
app.get('/result', async (_, response) => {
  await client.handleSignInCallback();
  const token = await client.getIdToken();
  response.send('ID token:\n' + token);
});

// Proxy path for the local custom sign-in web app
app.use(
  '/custom-experience/',
  createProxyMiddleware({
    target: customUiSignInUrl,
    changeOrigin: true,
  })
);

// Proxy all file resources (*.js, *.css, etc.) to the local SPA web app
app.use(
  '/',
  createProxyMiddleware({
    target: customUiSignInUrl,
    changeOrigin: true,
    pathFilter: '**/*.*',
  })
);

// Proxy all other API requests and page navigation requests to the Logto server
app.use(
  '/',
  createProxyMiddleware({
    target: logtoExperienceUrl,
    pathFilter: (path) => {
      return path !== '/result';
    },
    changeOrigin: true,
    selfHandleResponse: true,
    on: {
      proxyReq: (proxyRequest) => {
        proxyRequest.setHeader('cookie', client.sessionCookie);
      },
      proxyRes: async (proxyResponse, request, response) => {
        await modifyResponseBody(proxyResponse, request, response);
        const { location } = proxyResponse.headers;

        if (location) {
          if (location.startsWith(`${logtoExperienceUrl}/demo-app?code=`)) {
            client.setSignInCallbackUrl(location);

            // eslint-disable-next-line @silverhand/fp/no-mutation
            proxyResponse.headers.location = '/result';
          } else {
            // eslint-disable-next-line @silverhand/fp/no-mutation
            proxyResponse.headers.location = location.replace(
              logtoExperienceUrl,
              logtoTunnelServiceUrl
            );
          }
        }
      },
    },
  })
);

app.listen(tunnelPort, () => {
  console.log(chalk.green('✅ Logto tunnel service is running...'));
  console.log(
    'Your custom sign-in page is available at:',
    chalk.blue(`http://localhost:${tunnelPort}/custom-experience`)
  );
});
