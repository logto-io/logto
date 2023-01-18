import { SignInIdentifier, MissingProfile } from '@logto/schemas';
import * as s from 'superstruct';

import { UserFlow } from '.';

export const emailOrPhoneStateGuard = s.object({
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

export const userFlowGuard = s.enums([
  UserFlow.signIn,
  UserFlow.register,
  UserFlow.forgotPassword,
  UserFlow.continue,
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

const registeredSocialIdentity = s.optional(
  s.object({
    email: s.optional(s.string()),
    phone: s.optional(s.string()),
  })
);

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
  registeredSocialIdentity,
});

export const registeredSocialIdentityStateGuard = s.object({
  registeredSocialIdentity,
});

export const socialAccountNotExistErrorDataGuard = s.object({
  relatedUser: s.object({
    type: s.union([s.literal('email'), s.literal('phone')]),
    value: s.string(),
  }),
});

export type SocialRelatedUserInfo = s.Infer<
  typeof socialAccountNotExistErrorDataGuard
>['relatedUser'];
