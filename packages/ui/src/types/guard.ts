import { SignInIdentifier, MissingProfile } from '@logto/schemas';
import * as s from 'superstruct';

import { UserFlow } from '.';

export const userFlowGuard = s.enums([
  UserFlow.signIn,
  UserFlow.register,
  UserFlow.forgotPassword,
  UserFlow.continue,
]);

/* Password SignIn Flow */
export const passwordIdentifierStateGuard = s.object({
  identifier: s.enums([SignInIdentifier.Email, SignInIdentifier.Phone, SignInIdentifier.Username]),
  value: s.string(),
});

/* Continue Flow */
export const continueFlowStateGuard = s.optional(
  s.type({
    flow: userFlowGuard,
  })
);

/* Verification Code Flow Guard */
const verificationCodeMethodGuard = s.union([
  s.literal(SignInIdentifier.Email),
  s.literal(SignInIdentifier.Phone),
]);
export const verificationCodeStateGuard = s.object({
  identifier: verificationCodeMethodGuard,
  value: s.string(),
});

/* Social Flow Guard */
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

export const registeredSocialIdentityStateGuard = s.type({
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
