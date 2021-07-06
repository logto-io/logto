import pick from 'lodash.pick';
import { requestErrorMessage } from './message';
import { RequestErrorBody, RequestErrorCode, RequestErrorMetadata } from './types';

export * from './types';
export * from './message';

export default class RequestError extends Error {
  code: RequestErrorCode;
  status: number;
  expose: boolean;
  data: unknown;

  constructor(input: RequestErrorMetadata | RequestErrorCode, data?: unknown) {
    const { code, status = 400 } = typeof input === 'string' ? { code: input } : input;
    const message = requestErrorMessage[code];

    super(message);

    this.expose = true;
    this.code = code;
    this.status = status;
    this.data = data;
  }

  get body(): RequestErrorBody {
    return pick(this, 'message', 'code', 'data');
  }
}
