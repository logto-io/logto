import { SignInIdentifier } from '@logto/schemas';
import * as s from 'superstruct';

export const bindSocialStateGuard = s.object({
  relatedUser: s.optional(s.string()),
});

export const passcodeStateGuard = s.object({
  email: s.optional(s.string()),
  phone: s.optional(s.string()),
});

export const passcodeMethodGuard = s.union([
  s.literal(SignInIdentifier.Email),
  s.literal(SignInIdentifier.Sms),
]);

export const SignInMethodGuard = s.union([
  s.literal(SignInIdentifier.Email),
  s.literal(SignInIdentifier.Sms),
  s.literal(SignInIdentifier.Username),
]);

export const userFlowGuard = s.union([
  s.literal('sign-in'),
  s.literal('register'),
  s.literal('forgot-password'),
  s.literal('continue'),
]);

export const continueMethodGuard = s.union([
  s.literal('password'),
  s.literal('username'),
  s.literal(SignInIdentifier.Email),
  s.literal(SignInIdentifier.Sms),
]);

export const usernameGuard = s.object({
  username: s.string(),
});
