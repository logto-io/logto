import { type Log } from '@logto/schemas';

/**
 * Check if the log (token exchange) is an impersonation log.
 *
 * @param log - The log object.
 * @returns Whether the log is an impersonation log.
 */
export const isImpersonationLog = (
  log: Pick<Log, 'key'> & { payload: Pick<Log['payload'], 'params'> }
) => {
  if (log.key !== 'ExchangeTokenBy.TokenExchange') {
    return false;
  }

  if (log.payload.params?.subject_token_type === 'urn:ietf:params:oauth:token-type:access_token') {
    return true;
  }

  return false;
};
