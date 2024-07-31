import { conditional } from '@silverhand/essentials';
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
 * Intercept the response from Logto OIDC server and replace Logto Cloud endpoint URLs in the response
 * with the proxy URL. The string replace happens in the following cases:
 * - The response is a redirect response, and the response header contains `location` property.
 * - The response contains JSON data that consists of properties such as `**_endpoint` and `redirectTo`.
 * - The response is HTML content (logoutsource) that contains a form action URL.
 *
 * However, the `issuer` and `jwks_uri` properties in the `/oidc/.well-known` response will not be replaced,
 * even they also contain the Logto Cloud endpoint URL.
 */
export const createOidcResponseHandler = async ({
  proxyResponse,
  request,
  response,
  logtoCloudEndpointUrl,
  proxyUrl,
}: ProxyResponseHandler) => {
  const { location } = proxyResponse.headers;
  if (location) {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    proxyResponse.headers.location = location.replaceAll(logtoCloudEndpointUrl.href, proxyUrl.href);
  }

  void responseInterceptor(async (responseBuffer) => {
    const responseBody = responseBuffer.toString();
    consoleLog.info(`Response received: ${chalk.green(responseBody)}`);
    return responseBody
      .replaceAll(`_endpoint":"${logtoCloudEndpointUrl.href}`, `_endpoint":"${proxyUrl.href}`)
      .replace(`redirectTo":"${logtoCloudEndpointUrl.href}`, `redirectTo":"${proxyUrl.href}`)
      .replace(`action="${logtoCloudEndpointUrl.href}`, `action="${proxyUrl.href}`);
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
