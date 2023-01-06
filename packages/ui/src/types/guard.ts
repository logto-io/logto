import { SignInIdentifier, MissingProfile } from '@logto/schemas';
import * as s from 'superstruct';

export const bindSocialStateGuard = s.object({
  relatedUser: s.object({
    type: s.union([s.literal('email'), s.literal('phone')]),
    value: s.string(),
  }),
});

export const verificationCodeStateGuard = s.object({
  email: s.optional(s.string()),
  phone: s.optional(s.string()),
});

export const verificationCodeMethodGuard = s.union([
  s.literal(SignInIdentifier.Email),
  s.literal(SignInIdentifier.Phone),
]);

export const SignInMethodGuard = s.union([
  s.literal(SignInIdentifier.Email),
  s.literal(SignInIdentifier.Phone),
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
  s.literal(SignInIdentifier.Phone),
]);

export const usernameGuard = s.object({
  username: s.string(),
});

export const missingProfileErrorDataGuard = s.object({
  missingProfile: s.array(
    s.union([
      s.literal(MissingProfile.password),
      s.literal(MissingProfile.email),
      s.literal(MissingProfile.phone),
      s.literal(MissingProfile.username),
      s.literal(MissingProfile.emailOrPhone),
    ])
  ),
});
