import pick from 'lodash.pick';

export enum GuardErrorCode {
  InvalidInput = 'guard.invalid_input',
}

export enum RegisterErrorCode {
  UsernameExists = 'register.username_exists',
}

export type RequestErrorCode = GuardErrorCode | RegisterErrorCode;

const requestErrorMessage: Record<RequestErrorCode, string> = {
  [RegisterErrorCode.UsernameExists]: 'The username already exists.',
  [GuardErrorCode.InvalidInput]: 'The request input is invalid.',
};

export type RequestErrorMetadata = {
  code: RequestErrorCode;
  status?: number;
};

export type RequestErrorBody = { message: string; data: unknown; code: string };

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
