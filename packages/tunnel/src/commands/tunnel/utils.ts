import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import type http from 'node:http';
import path from 'node:path';

import { isFileAssetPath, isValidUrl, parseRange } from '@logto/core-kit';
import { conditional, trySafe } from '@silverhand/essentials';
import chalk from 'chalk';
import { createProxyMiddleware, responseInterceptor } from 'http-proxy-middleware';
import { type OnProxyEvent } from 'http-proxy-middleware/dist/types.js';
import mime from 'mime';

import { consoleLog } from '../../utils.js';

import { type LogtoResponseHandler } from './types.js';

export const createProxy = (targetUrl: string, onProxyResponse?: OnProxyEvent['proxyRes']) => {
  const hasResponseHandler = Boolean(onProxyResponse);
  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    selfHandleResponse: hasResponseHandler,
    ...conditional(
      hasResponseHandler && {
        on: {
          proxyReq: (proxyRequest) => {
            // Disable potential `zstd` compression since it's not supported by http-proxy-middleware
            // https://github.com/chimurai/http-proxy-middleware/issues/1070
            proxyRequest.setHeader('Accept-Encoding', 'gzip, deflate, br');
          },
          proxyRes: onProxyResponse,
          error: (error) => {
            consoleLog.error(chalk.red(error.message));
          },
        },
      }
    ),
  });
};

const index = 'index.html';
const indexContentType = 'text/html; charset=utf-8';
const noCache = 'no-cache, no-store, must-revalidate';
const maxAgeSevenDays = 'max-age=604_800_000';

export const getSafeStaticFilePath = (staticPath: string, requestUrl: string) => {
  const [pathname = ''] = requestUrl.split(/[#?]/);
  const decodedPathname = trySafe(() => decodeURIComponent(pathname));

  if (!decodedPathname || decodedPathname.includes('\\')) {
    return;
  }

  const staticRoot = path.resolve(staticPath);
  const requestPath = decodedPathname.replace(/^\/+/, '');
  const resolvedPath = path.resolve(staticRoot, requestPath);
  const relativePath = path.relative(staticRoot, resolvedPath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return;
  }

  return resolvedPath;
};

const readFile = async (requestPath: string, start?: number, end?: number) => {
  const fileHandle = await fs.open(requestPath, 'r');
  const { size } = await fileHandle.stat();
  const readStart = start ?? 0;
  const readEnd = end ?? Math.max(size - 1, 0);
  const buffer = Buffer.alloc(readEnd - readStart + 1);
  await fileHandle.read(buffer, 0, buffer.length, readStart);
  await fileHandle.close();
  return { buffer, totalFileSize: size };
};

const setRangeHeaders = (response: http.ServerResponse, range: string, totalFileSize: number) => {
  if (range) {
    const { start, end } = parseRange(range);
    const readStart = start ?? 0;
    const readEnd = end ?? totalFileSize - 1;
    response.setHeader('Accept-Ranges', 'bytes');
    response.setHeader('Content-Range', `bytes ${readStart}-${readEnd}/${totalFileSize}`);
  }
};

const isStaticFileProxyMethod = (method?: string) => method === 'HEAD' || method === 'GET';

const getStaticFileRequestPath = (
  staticPath: string,
  requestUrl: string,
  fallBackToIndex: boolean
) =>
  fallBackToIndex ? path.resolve(staticPath, index) : getSafeStaticFilePath(staticPath, requestUrl);

const getStaticFileErrorStatusCode = (errorMessage: string, requestPath: string) =>
  errorMessage === 'Range not satisfiable.' ? 416 : existsSync(requestPath) ? 500 : 404;

export const createStaticFileProxy =
  (staticPath: string) => async (request: http.IncomingMessage, response: http.ServerResponse) => {
    if (!request.url) {
      response.writeHead(400).end();
      return;
    }

    if (!isStaticFileProxyMethod(request.method)) {
      return;
    }

    const fallBackToIndex = !isFileAssetPath(request.url);
    const requestPath = getStaticFileRequestPath(staticPath, request.url, fallBackToIndex);
    const { range = '' } = request.headers;

    if (!requestPath) {
      response.writeHead(404).end();
      return;
    }

    try {
      const { start, end } = parseRange(range);
      const { buffer, totalFileSize } = await readFile(requestPath, start, end);
      response.setHeader('cache-control', fallBackToIndex ? noCache : maxAgeSevenDays);
      response.setHeader('content-type', getMimeType(request.url));
      setRangeHeaders(response, range, totalFileSize);

      response.setHeader('content-length', String(buffer.length));
      response.writeHead(range ? 206 : 200);
      response.end(buffer);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      consoleLog.error(chalk.red(errorMessage));

      response.setHeader('content-type', getMimeType(request.url));
      response.writeHead(getStaticFileErrorStatusCode(errorMessage, requestPath));
      response.end();
    }
  };

/**
 * Intercept the response from Logto endpoint and replace Logto endpoint URLs in the response with the
 * tunnel service URL. The string replace happens in the following cases:
 * - The response is a redirect response, and the `location` property in response header may contain Logto
 *   endpoint URI.
 * - The response body is JSON, which consists of properties such as `**_endpoint` and `redirectTo`. These
 *   properties may contain Logto endpoint URI.
 * - The response is HTML content that contains a form. The form action URL may contain Logto endpoint URI.
 *
 * Note: the `issuer` and `jwks_uri` properties in the `/oidc/.well-known` response should not be replaced,
 * even they also contain the Logto endpoint URI.
 */
export const createLogtoResponseHandler = async ({
  proxyResponse,
  request,
  response,
  logtoEndpointUrl,
  tunnelServiceUrl,
  verbose,
}: LogtoResponseHandler) => {
  const { location } = proxyResponse.headers;
  if (location) {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    proxyResponse.headers.location = location.replace(logtoEndpointUrl.href, tunnelServiceUrl.href);
  }

  void responseInterceptor(async (responseBuffer, proxyResponse) => {
    const responseBody = responseBuffer.toString();
    if (verbose) {
      consoleLog.info(`[${proxyResponse.statusCode}] ${chalk.cyan(responseBody)}`);
    }

    if (proxyResponse.headers['content-type']?.includes('text/html')) {
      return responseBody.replace(
        `action="${logtoEndpointUrl.href}`,
        `action="${tunnelServiceUrl.href}`
      );
    }

    if (proxyResponse.headers['content-type']?.includes('application/json')) {
      const jsonData = trySafe<unknown>(() => JSON.parse(responseBody));

      if (jsonData && typeof jsonData === 'object') {
        const updatedEntries: Array<[string, unknown]> = Object.entries(jsonData).map(
          ([key, value]) => {
            if ((key === 'redirectTo' || key.endsWith('_endpoint')) && typeof value === 'string') {
              return [key, value.replace(logtoEndpointUrl.href, tunnelServiceUrl.href)];
            }
            return [key, value];
          }
        );

        return JSON.stringify(Object.fromEntries(updatedEntries));
      }
    }
    return responseBody;
  })(proxyResponse, request, response);
};

export const checkExperienceInput = (url?: string, staticPath?: string) => {
  if (staticPath && url) {
    consoleLog.fatal('Only one of the experience URI or path can be provided.');
  }
  if (!staticPath && !url) {
    consoleLog.fatal(`Either a sign-in experience URI or local path must be provided.
      
Specify --help for available options`);
  }
  if (url && !isValidUrl(url)) {
    consoleLog.fatal(
      'A valid sign-in experience URI must be provided. E.g. `--experience-uri http://localhost:4000` or add `LOGTO_EXPERIENCE_URI` to your environment variables.'
    );
  }
  if (staticPath && !existsSync(path.join(staticPath, index))) {
    consoleLog.fatal('The provided path must contain a valid index.html file.');
  }
};

/**
 * Check if the request path is a Logto request path.
 * @example isLogtoRequestPath('/oidc/.well-known/openid-configuration') // true
 * @example isLogtoRequestPath('/oidc/auth') // true
 * @example isLogtoRequestPath('/api/interaction/submit') // true
 * @example isLogtoRequestPath('/consent') // true
 */
export const isLogtoRequestPath = (requestPath?: string): boolean =>
  ['/oidc/', '/api/'].some((path) => requestPath?.startsWith(path)) || requestPath === '/consent';

export const getMimeType = (requestPath: string) => {
  const fallBackToIndex = !isFileAssetPath(requestPath);
  if (fallBackToIndex) {
    return indexContentType;
  }
  return mime.getType(requestPath) ?? 'application/octet-stream';
};
