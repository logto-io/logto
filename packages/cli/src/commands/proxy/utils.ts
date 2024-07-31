import { conditional, trySafe } from '@silverhand/essentials';
import chalk from 'chalk';
import { createProxyMiddleware, responseInterceptor } from 'http-proxy-middleware';
import { type OnProxyEvent } from 'http-proxy-middleware/dist/types.js';

import { consoleLog } from '../../utils.js';

import { type ProxyResponseHandler } from './types.js';

export const createProxy = (targetUrl: string, onProxyResponse?: OnProxyEvent['proxyRes']) => {
  const hasResponseHandler = Boolean(onProxyResponse);
  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    selfHandleResponse: hasResponseHandler,
    ...conditional(
      hasResponseHandler && {
        on: {
          proxyRes: onProxyResponse,
        },
      }
    ),
  });
};

/**
 * Intercept the response from Logto endpoint and replace Logto endpoint URLs in the response with the
 * proxy URL. The string replace happens in the following cases:
 * - The response is a redirect response, and the response header contains `location` property.
 * - The response contains JSON data that consists of properties such as `**_endpoint` and `redirectTo`.
 * - The response is HTML content (logoutsource) that contains a form action URL.
 * Note: the `issuer` and `jwks_uri` properties in the `/oidc/.well-known` response should not be replaced,
 * even they also contain the Logto endpoint URL.
 */
export const createLogtoResponseHandler = async ({
  proxyResponse,
  request,
  response,
  logtoEndpointUrl,
  proxyUrl,
}: ProxyResponseHandler) => {
  const { location } = proxyResponse.headers;
  if (location) {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    proxyResponse.headers.location = location.replace(logtoEndpointUrl.href, proxyUrl.href);
  }

  void responseInterceptor(async (responseBuffer, proxyResponse) => {
    const responseBody = responseBuffer.toString();
    consoleLog.info(`Response received: ${chalk.green(responseBody)}`);

    if (proxyResponse.headers['content-type']?.includes('text/html')) {
      return responseBody.replace(
        `action="${logtoEndpointUrl.href}oidc/session/end/confirm"`,
        `action="${proxyUrl.href}oidc/session/end/confirm"`
      );
    }

    // eslint-disable-next-line no-restricted-syntax
    const jsonData = trySafe(() => JSON.parse(responseBody) as Record<string, unknown>);

    if (jsonData) {
      for (const [key, value] of Object.entries(jsonData)) {
        if ((key === 'redirectTo' || key.endsWith('_endpoint')) && typeof value === 'string') {
          // eslint-disable-next-line @silverhand/fp/no-mutation
          jsonData[key] = value.replace(logtoEndpointUrl.href, proxyUrl.href);
        }
      }
      return JSON.stringify(jsonData);
    }

    return responseBody;
  })(proxyResponse, request, response);
};

/**
 * Check if the request path is a Logto request path.
 * @example isLogtoRequestPath('/oidc/.well-known/openid-configuration') // true
 * @example isLogtoRequestPath('/oidc/auth') // true
 * @example isLogtoRequestPath('/api/interaction/submit') // true
 * @example isLogtoRequestPath('/consent') // true
 */
export const isLogtoRequestPath = (requestPath?: string) =>
  ['/oidc/', '/api/'].some((path) => requestPath?.startsWith(path)) || requestPath === '/consent';
