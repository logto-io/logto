import { LogtoErrorCode } from '@logto/phrases';

export type RequestErrorMetadata = {
  code: LogtoErrorCode;
  status?: number;
};

export type RequestErrorBody = { message: string; data: unknown; code: string };
