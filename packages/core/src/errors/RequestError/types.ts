import { GuardErrorCode } from './collection/guard-errors';
import { OidcErrorCode } from './collection/oidc-errors';
import { RegisterErrorCode } from './collection/register-errors';
import { SwaggerErrorCode } from './collection/swagger-errors';

export { GuardErrorCode, OidcErrorCode, SwaggerErrorCode, RegisterErrorCode };

export type RequestErrorCode =
  | GuardErrorCode
  | OidcErrorCode
  | RegisterErrorCode
  | SwaggerErrorCode;

export type RequestErrorMetadata = {
  code: RequestErrorCode;
  status?: number;
};

export type RequestErrorBody = { message: string; data: unknown; code: string };
