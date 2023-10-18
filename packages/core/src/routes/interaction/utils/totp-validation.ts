import { authenticator } from 'otplib';

/**
 * Note:
 * Considering T1 and T2 two consecutive time steps,
 * any token generated within T1 but checked with T2 could be considered valid according to [RFC 6238 5.2](https://datatracker.ietf.org/doc/html/rfc6238#section-5.2).
 *
 * FYI: https://github.com/yeojz/otplib/issues/697#issuecomment-1655749578
 */
// eslint-disable-next-line @silverhand/fp/no-mutation
authenticator.options = { window: 1 };

export const generateTotpSecret = () => authenticator.generateSecret();

export const validateTotpToken = (secret: string, token: string) => {
  return authenticator.check(token, secret);
};
