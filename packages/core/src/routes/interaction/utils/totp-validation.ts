import { authenticator } from 'otplib';

export const generateTotpSecret = () => authenticator.generateSecret();

export const validateTotpToken = (secret: string, token: string) =>
  authenticator.check(token, secret);
