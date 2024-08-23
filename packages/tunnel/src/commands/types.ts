import type * as http from 'node:http';

export type TunnelCommandArgs = {
  'experience-uri'?: string;
  'experience-path'?: string;
  endpoint?: string;
  port: number;
  verbose: boolean;
};

export type LogtoResponseHandler = {
  proxyResponse: http.IncomingMessage;
  request: http.IncomingMessage;
  response: http.ServerResponse;
  logtoEndpointUrl: URL;
  tunnelServiceUrl: URL;
  verbose: boolean;
};
