import type { SignInIdentifier } from '@logto/schemas';

export type SignInMethodsObject = Record<
  SignInIdentifier,
  { password: boolean; verificationCode: boolean }
>;
