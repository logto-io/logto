import { GuardErrorCode } from './collection/guard-errors';
import { OidcErrorCode } from './collection/oidc-errors';
import { RegisterErrorCode } from './collection/register-errors';
import { SwaggerErrorCode } from './collection/swagger-errors';
import { SignInErrorCode } from './collection/sign-in-errors';

export { GuardErrorCode, OidcErrorCode, SwaggerErrorCode, RegisterErrorCode, SignInErrorCode };

export type RequestErrorCode =
  | GuardErrorCode
  | OidcErrorCode
  | RegisterErrorCode
  | SwaggerErrorCode
  | SignInErrorCode;

export type RequestErrorMetadata = {
  code: RequestErrorCode;
  status?: number;
};

export type RequestErrorBody = { message: string; data: unknown; code: string };
