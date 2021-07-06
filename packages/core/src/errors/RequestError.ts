import pick from 'lodash.pick';

export enum GuardErrorCode {
  InvalidInput = 'guard.invalid_input',
}

export enum OidcErrorCode {
  Aborted = 'oidc.aborted',
}

export enum RegisterErrorCode {
  UsernameExists = 'register.username_exists',
}

export type RequestErrorCode = GuardErrorCode | OidcErrorCode | RegisterErrorCode;

const requestErrorMessage: Record<RequestErrorCode, string> = {
  [GuardErrorCode.InvalidInput]: 'The request input is invalid.',
  [OidcErrorCode.Aborted]: 'The end-user aborted interaction.',
  [RegisterErrorCode.UsernameExists]: 'The username already exists.',
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
