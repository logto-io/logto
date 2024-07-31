import type * as http from 'node:http';

export type ProxyCommandArgs = {
  'experience-uri'?: string;
  'experience-path'?: string;
  endpoint?: string;
  port: number;
  verbose: boolean;
};

export type ProxyResponseHandler = {
  proxyResponse: http.IncomingMessage;
  request: http.IncomingMessage;
  response: http.ServerResponse;
  logtoEndpointUrl: URL;
  proxyUrl: URL;
  verbose: boolean;
};
