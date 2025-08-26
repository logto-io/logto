import {
  CustomProfileFieldType,
  InteractionEvent,
  MfaFactor,
  MissingProfile,
  SignInIdentifier,
  type SsoConnectorMetadata,
  SupportedDateFormat,
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
      s.literal(MissingProfile.extraProfile),
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
    s.literal(MfaFactor.EmailVerificationCode),
    s.literal(MfaFactor.PhoneVerificationCode),
  ])
);

const mfaFactorEnumValues = [
  MfaFactor.EmailVerificationCode,
  MfaFactor.PhoneVerificationCode,
] as const;

export const mfaErrorDataGuard = s.object({
  availableFactors: mfaFactorsGuard,
  skippable: s.optional(s.boolean()),
  maskedIdentifiers: s.optional(s.record(s.enums(mfaFactorEnumValues), s.string())),
  // Whether this MFA flow is an optional suggestion (e.g., add another factor after sign-up)
  suggestion: s.optional(s.boolean()),
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

export const extraProfileFieldNamesGuard = s.union([
  s.literal('name'),
  s.literal('avatar'),
  s.literal('givenName'),
  s.literal('familyName'),
  s.literal('middleName'),
  s.literal('nickname'),
  s.literal('preferredUsername'),
  s.literal('profile'),
  s.literal('website'),
  s.literal('gender'),
  s.literal('birthdate'),
  s.literal('zoneinfo'),
  s.literal('locale'),
  s.literal('fullname'),
  s.literal('address.formatted'),
  s.literal('address.streetAddress'),
  s.literal('address.locality'),
  s.literal('address.region'),
  s.literal('address.postalCode'),
  s.literal('address.country'),
]);

export const addressFieldValueGuard = s.optional(
  s.object({
    formatted: s.optional(s.string()),
    streetAddress: s.optional(s.string()),
    locality: s.optional(s.string()),
    region: s.optional(s.string()),
    postalCode: s.optional(s.string()),
    country: s.optional(s.string()),
  })
);

const profileFieldTypeGuard = s.enums(Object.values(CustomProfileFieldType));

const dateFormatEnumGuard = s.enums(Object.values(SupportedDateFormat));

export const dateFieldConfigGuard = s.object({
  format: dateFormatEnumGuard,
  placeholder: s.optional(s.string()),
  customFormat: s.optional(s.string()),
});

const baseConfigPartGuard = s.object({
  enabled: s.boolean(),
  type: profileFieldTypeGuard,
  label: s.optional(s.string()),
  description: s.optional(s.string()),
  required: s.boolean(),
  config: s.optional(
    s.object({
      placeholder: s.optional(s.string()),
      minLength: s.optional(s.number()),
      maxLength: s.optional(s.number()),
      minValue: s.optional(s.number()),
      maxValue: s.optional(s.number()),
      options: s.optional(s.array(s.object({ value: s.string(), label: s.optional(s.string()) }))),
      format: s.optional(s.string()),
      customFormat: s.optional(s.string()),
      defaultValue: s.optional(s.string()),
    })
  ),
});

export const addressFieldConfigGuard = s.object({
  parts: s.array(
    s.assign(
      baseConfigPartGuard,
      s.object({
        name: s.union([
          s.literal('streetAddress'),
          s.literal('locality'),
          s.literal('region'),
          s.literal('postalCode'),
          s.literal('country'),
          s.literal('formatted'),
        ]),
      })
    )
  ),
});

export const fullnameFieldValueGuard = s.optional(
  s.object({
    givenName: s.optional(s.string()),
    middleName: s.optional(s.string()),
    familyName: s.optional(s.string()),
  })
);

export const fullnameFieldConfigGuard = s.object({
  parts: s.array(
    s.assign(
      baseConfigPartGuard,
      s.object({
        name: s.union([s.literal('givenName'), s.literal('middleName'), s.literal('familyName')]),
      })
    )
  ),
});
