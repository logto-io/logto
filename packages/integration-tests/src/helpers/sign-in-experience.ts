import type { SignInExperience } from '@logto/schemas';
import {
  SignInMode,
  SignInIdentifier,
  MfaFactor,
  MfaPolicy,
  ConnectorType,
  defaultUsernamePolicy,
} from '@logto/schemas';

import { updateSignInExperience } from '#src/api/index.js';

import { clearConnectorsByTypes } from './connector.js';

export const defaultSignInSignUpConfigs = {
  signInMode: SignInMode.SignInAndRegister,
  signUp: {
    identifiers: [SignInIdentifier.Username],
    password: true,
    verify: false,
  },
  signIn: {
    methods: [
      {
        identifier: SignInIdentifier.Username,
        isPasswordPrimary: true,
        password: true,
        verificationCode: false,
      },
    ],
  },
};

/**
 * The sign-in experience settings every API test suite starts from, matching a freshly bootstrapped
 * tenant. `jest.setup.api.js` applies them before each suite file runs, since suites change the
 * sign-in experience freely and most of them do not restore it.
 *
 * Listed here are the settings a suite can leave changed; the ones whose only mutators capture and
 * restore them (`languageInfo`, `ssoBrandingBeforeEmailMatch`, the custom UI assets and CSP) and the
 * presentational ones are left out. Add a setting as soon as a suite leaves it changed, otherwise it
 * decides whether the next suite passes.
 *
 * JSONB policies are reset to `{}`, their database default. `passwordExpiration` is the exception,
 * because the API merges a partial policy into the stored one instead of replacing it, so it has to
 * disable the policy explicitly.
 */
export const defaultSignInExperienceSettings = {
  ...defaultSignInSignUpConfigs,
  socialSignIn: {},
  socialSignInConnectorTargets: [],
  singleSignOnEnabled: false,
  // `PromptAtSignInAndSignUp` replaces the deprecated `UserControlled` the seed still writes.
  mfa: { factors: [], policy: MfaPolicy.PromptAtSignInAndSignUp },
  adaptiveMfa: {},
  passkeySignIn: {},
  trustedDevice: {},
  passwordPolicy: {},
  passwordExpiration: { enabled: false },
  usernamePolicy: defaultUsernamePolicy,
  forgotPasswordMethods: [],
  sentinelPolicy: {},
  captchaPolicy: {},
  emailBlocklistPolicy: {},
} satisfies Partial<SignInExperience>;

/** Restore the sign-in experience to {@link defaultSignInExperienceSettings}. */
export const resetSignInExperience = async () =>
  updateSignInExperience(defaultSignInExperienceSettings);

export const defaultSignUpMethod = {
  identifiers: [],
  password: false,
  verify: false,
};

export const defaultPasswordSignInMethods = [
  {
    identifier: SignInIdentifier.Username,
    password: true,
    verificationCode: false,
    isPasswordPrimary: false,
  },
  {
    identifier: SignInIdentifier.Email,
    password: true,
    verificationCode: false,
    isPasswordPrimary: false,
  },
  {
    identifier: SignInIdentifier.Phone,
    password: true,
    verificationCode: false,
    isPasswordPrimary: false,
  },
];

const defaultVerificationCodeSignInMethods = [
  {
    identifier: SignInIdentifier.Username,
    password: true,
    verificationCode: false,
    isPasswordPrimary: true,
  },
  {
    identifier: SignInIdentifier.Email,
    password: true,
    verificationCode: true,
    isPasswordPrimary: false,
  },
  {
    identifier: SignInIdentifier.Phone,
    password: true,
    verificationCode: true,
    isPasswordPrimary: false,
  },
];

export const enableAllPasswordSignInMethods = async (
  signUp: SignInExperience['signUp'] = defaultSignUpMethod
) =>
  updateSignInExperience({
    signInMode: SignInMode.SignInAndRegister,
    signUp,
    signIn: {
      methods: defaultPasswordSignInMethods,
    },
    mfa: { factors: [], policy: MfaPolicy.PromptAtSignInAndSignUp },
  });

export const resetPasswordPolicy = async () =>
  updateSignInExperience({
    passwordPolicy: {
      length: { min: 8, max: 256 },
      characterTypes: { min: 1 },
      rejects: { pwned: true, repetitionAndSequence: true, userInfo: true },
    },
  });

export const enableAllVerificationCodeSignInMethods = async (
  signUp: SignInExperience['signUp'] = defaultSignUpMethod
) =>
  updateSignInExperience({
    signInMode: SignInMode.SignInAndRegister,
    signUp,
    signIn: {
      methods: defaultVerificationCodeSignInMethods,
    },
    mfa: { factors: [], policy: MfaPolicy.PromptAtSignInAndSignUp },
  });

export const enableUserControlledMfaWithTotp = async () =>
  updateSignInExperience({
    mfa: {
      factors: [MfaFactor.TOTP],
      policy: MfaPolicy.PromptAtSignInAndSignUp,
    },
  });

export const enableUserControlledMfaWithTotpAndWebAuthn = async () =>
  updateSignInExperience({
    mfa: {
      factors: [MfaFactor.TOTP, MfaFactor.WebAuthn],
      policy: MfaPolicy.NoPrompt,
    },
  });

export const enableAllUserControlledMfaFactors = async () =>
  updateSignInExperience({
    mfa: {
      factors: [MfaFactor.TOTP, MfaFactor.WebAuthn, MfaFactor.BackupCode],
      policy: MfaPolicy.NoPrompt,
    },
  });

export const enableUserControlledMfaWithTotpOnlyAtSignIn = async () =>
  updateSignInExperience({
    mfa: {
      factors: [MfaFactor.TOTP],
      policy: MfaPolicy.PromptOnlyAtSignIn,
    },
  });

export const enableUserControlledMfaWithNoPrompt = async () =>
  updateSignInExperience({
    mfa: {
      factors: [MfaFactor.TOTP],
      policy: MfaPolicy.NoPrompt,
    },
  });

export const enableMandatoryMfaWithTotp = async () =>
  updateSignInExperience({
    mfa: {
      factors: [MfaFactor.TOTP],
      policy: MfaPolicy.Mandatory,
    },
  });

export const enableMandatoryMfaWithWebAuthn = async () =>
  updateSignInExperience({
    mfa: {
      factors: [MfaFactor.WebAuthn],
      policy: MfaPolicy.Mandatory,
    },
  });

export const enableMandatoryMfaWithTotpAndBackupCode = async () =>
  updateSignInExperience({
    mfa: {
      factors: [MfaFactor.TOTP, MfaFactor.BackupCode],
      policy: MfaPolicy.Mandatory,
    },
  });

export const enableMandatoryMfaWithEmail = async () =>
  updateSignInExperience({
    mfa: {
      factors: [MfaFactor.EmailVerificationCode],
      policy: MfaPolicy.Mandatory,
    },
  });

export const enableMandatoryMfaWithEmailAndBackupCode = async () =>
  updateSignInExperience({
    mfa: {
      factors: [MfaFactor.EmailVerificationCode, MfaFactor.BackupCode],
      policy: MfaPolicy.Mandatory,
    },
  });

export const enableMandatoryMfaWithPhone = async () =>
  updateSignInExperience({
    mfa: {
      factors: [MfaFactor.PhoneVerificationCode],
      policy: MfaPolicy.Mandatory,
    },
  });

export const enableMandatoryMfaWithPhoneAndBackupCode = async () =>
  updateSignInExperience({
    mfa: {
      factors: [MfaFactor.PhoneVerificationCode, MfaFactor.BackupCode],
      policy: MfaPolicy.Mandatory,
    },
  });

export const enableMandatoryMfaWithWebAuthnAndBackupCode = async () =>
  updateSignInExperience({
    mfa: {
      factors: [MfaFactor.WebAuthn, MfaFactor.BackupCode],
      policy: MfaPolicy.Mandatory,
    },
  });

export const resetMfaSettings = async () =>
  updateSignInExperience({ mfa: { policy: MfaPolicy.PromptAtSignInAndSignUp, factors: [] } });

export const resetPasskeySignInSettings = async () =>
  updateSignInExperience({
    passkeySignIn: { enabled: false, showPasskeyButton: false, allowAutofill: false },
  });

/** Enable only username and password sign-in and sign-up. */
export const setUsernamePasswordOnly = async () => {
  await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
  await updateSignInExperience({
    signInMode: SignInMode.SignInAndRegister,
    signUp: {
      identifiers: [SignInIdentifier.Username],
      password: true,
      verify: false,
    },
    signIn: {
      methods: [
        {
          identifier: SignInIdentifier.Username,
          password: true,
          verificationCode: false,
          isPasswordPrimary: true,
        },
      ],
    },
    passwordPolicy: {},
  });
};

export const setLanguage = async (
  language: SignInExperience['languageInfo']['fallbackLanguage'],
  autoDetect = false
) =>
  updateSignInExperience({
    languageInfo: {
      fallbackLanguage: language,
      autoDetect,
    },
  });

export const enableCaptcha = async () =>
  updateSignInExperience({
    captchaPolicy: {
      enabled: true,
    },
  });

export const disableCaptcha = async () =>
  updateSignInExperience({
    captchaPolicy: {
      enabled: false,
    },
  });

export const enablePasswordExpiration = async ({
  validPeriodDays = 30,
}: {
  validPeriodDays?: number;
}) =>
  updateSignInExperience({
    passwordExpiration: {
      enabled: true,
      validPeriodDays,
    },
  });

export const disablePasswordExpiration = async () =>
  updateSignInExperience({
    passwordExpiration: {
      enabled: false,
    },
  });
