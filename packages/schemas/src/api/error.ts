import type { LogtoErrorCode } from '@logto/phrases';

export type RequestErrorMetadata = Record<string, unknown> & {
  code: LogtoErrorCode;
  status?: number;
  expose?: boolean;
};

export type RequestErrorBody = {
  message: string;
  data: unknown;
  code: LogtoErrorCode;
  details?: string;
};
