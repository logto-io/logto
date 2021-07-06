import { RequestErrorCode } from './types';
import { guardErrorMessage } from './collection/guard-errors';
import { oidcErrorMessage } from './collection/oidc-errors';
import { registerErrorMessage } from './collection/register-errors';

export const requestErrorMessage: Record<RequestErrorCode, string> = {
  ...guardErrorMessage,
  ...oidcErrorMessage,
  ...registerErrorMessage,
};
