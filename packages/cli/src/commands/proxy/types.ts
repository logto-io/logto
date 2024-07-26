import type * as http from 'node:http';

export type ProxyResponseHandler = {
  proxyResponse: http.IncomingMessage;
  request: http.IncomingMessage;
  response: http.ServerResponse;
  logtoCloudEndpointUrl: URL;
  proxyUrl: URL;
};
