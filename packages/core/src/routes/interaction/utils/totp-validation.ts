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

export const validateTotpSecret = (secret: string) => {
  const base32Regex =
    /^(?:[2-7A-Z]{8})*(?:[2-7A-Z]{2}={6}|[2-7A-Z]{4}={4}|[2-7A-Z]{5}={3}|[2-7A-Z]{7}=)?$/;

  return secret.length >= 16 && secret.length <= 32 && base32Regex.test(secret);
};

export const validateTotpToken = (secret: string, token: string) => {
  return authenticator.check(token, secret);
};
