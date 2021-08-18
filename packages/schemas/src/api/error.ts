import { LogtoErrorCode } from '@logto/phrases';

export type RequestErrorMetadata = Record<string, unknown> & {
  code: LogtoErrorCode;
  status?: number;
};

export type RequestErrorBody = { message: string; data: unknown; code: string };
