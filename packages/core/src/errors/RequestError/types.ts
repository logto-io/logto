import { GuardErrorCode } from './collection/guard-errors';
import { OidcErrorCode } from './collection/oidc-errors';
import { RegisterErrorCode } from './collection/register-errors';

export { GuardErrorCode, OidcErrorCode, RegisterErrorCode };

export type RequestErrorCode = GuardErrorCode | OidcErrorCode | RegisterErrorCode;

export type RequestErrorMetadata = {
  code: RequestErrorCode;
  status?: number;
};

export type RequestErrorBody = { message: string; data: unknown; code: string };
