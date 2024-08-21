import {
  InteractionEvent,
  MfaFactor,
  MissingProfile,
  SignInIdentifier,
  type SsoConnectorMetadata,
  VerificationType,
} from '@logto/schemas';
import * as s from 'superstruct';

import { type IdentifierInputValue } from '@/components/InputFields/SmartInputField';

import { UserFlow } from '.';

export const userFlowGuard = s.enums([
  UserFlow.SignIn,
  UserFlow.Register,
  UserFlow.ForgotPassword,
  UserFlow.Continue,
]);

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

/* Mfa */
const mfaFactorsGuard = s.array(
  s.union([
    s.literal(MfaFactor.TOTP),
    s.literal(MfaFactor.WebAuthn),
    s.literal(MfaFactor.BackupCode),
  ])
);

export const mfaErrorDataGuard = s.object({
  availableFactors: mfaFactorsGuard,
  skippable: s.optional(s.boolean()),
});

export const mfaFlowStateGuard = mfaErrorDataGuard;

export type MfaFlowState = s.Infer<typeof mfaFlowStateGuard>;

export const totpBindingStateGuard = s.assign(
  s.object({
    secret: s.string(),
    secretQrCode: s.string(),
  }),
  mfaFlowStateGuard
);

export type TotpBindingState = s.Infer<typeof totpBindingStateGuard>;

export const backupCodeBindingStateGuard = s.object({
  codes: s.array(s.string()),
});

export type BackupCodeBindingState = s.Infer<typeof backupCodeBindingStateGuard>;

export const webAuthnStateGuard = s.assign(
  s.object({
    options: s.record(s.string(), s.unknown()),
  }),
  mfaFlowStateGuard
);

export type WebAuthnState = s.Infer<typeof webAuthnStateGuard>;

/* Single Sign On */
export const ssoConnectorMetadataGuard: s.Describe<SsoConnectorMetadata> = s.object({
  id: s.string(),
  logo: s.string(),
  darkLogo: s.optional(s.string()),
  connectorName: s.string(),
});

const identifierEnumGuard = s.enums([
  SignInIdentifier.Email,
  SignInIdentifier.Phone,
  SignInIdentifier.Username,
]);
/**
 * Defines the type guard for user identifier input value caching.
 *
 * Purpose:
 * - Used in conjunction with the HiddenIdentifierInput component to assist
 * password managers in associating the correct identifier with passwords.
 *
 * - Cache the identifier so that when the user returns from the verification
 *  page or the password page, the identifier they entered will not be cleared.
 */
export const identifierInputValueGuard: s.Describe<IdentifierInputValue> = s.object({
  type: s.optional(identifierEnumGuard),
  value: s.string(),
});

/**
 * Type guard for the `identifier` search param config on the identifier sign-in/register page.
 */
export const identifierSearchParamGuard = s.array(identifierEnumGuard);

type StringGuard = ReturnType<typeof s.string>;
// eslint-disable-next-line no-restricted-syntax -- Object.fromEntries can not infer the key type
const mapGuard = Object.fromEntries(
  Object.values(VerificationType).map((type) => [type, s.string()])
) as { [key in VerificationType]: StringGuard };

/**
 * Defines the type guard for the verification ids map.
 */
export const verificationIdsMapGuard = s.partial(mapGuard);
export type VerificationIdsMap = s.Infer<typeof verificationIdsMapGuard>;

/**
 * Define the interaction event state guard.
 *
 * This is used to pass the current interaction event state to the continue flow page.
 *
 * - If is in the sign in flow, directly call the submitInteraction endpoint after the user completes the profile.
 * - If is in the register flow, we need to call the identify endpoint first after the user completes the profile.
 */
export const continueFlowStateGuard = s.object({
  interactionEvent: s.enums([InteractionEvent.SignIn, InteractionEvent.Register]),
});

export type InteractionFlowState = s.Infer<typeof continueFlowStateGuard>;
