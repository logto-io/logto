import type { LogtoErrorCode } from '@logto/phrases';

export type RequestErrorMetadata = Record<string, unknown> & {
  code: LogtoErrorCode;
  status?: number;
  expose?: boolean;
};

export type RequestErrorBody<T = unknown> = {
  message: string;
  data: T;
  code: LogtoErrorCode;
  details?: string;
};
