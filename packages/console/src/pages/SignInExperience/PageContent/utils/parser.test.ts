import {
  AgreeToTermsPolicy,
  AlternativeSignUpIdentifier,
  MfaFactor,
  MfaPolicy,
  SignInIdentifier,
  SignInMode,
  type SignInExperience,
} from '@logto/schemas';

import { sieFormDataParser, signInExperienceToUpdatedDataParser } from './parser';

const mockSignInExperience: SignInExperience = {
  tenantId: 'fake_tenant',
  id: 'foo',
  color: {
    primaryColor: '#000000',
    isDarkModeEnabled: true,
    darkPrimaryColor: '#ffffff',
  },
  branding: {
    logoUrl: 'https://logto.dev/logo.svg',
  },
  hideLogtoBranding: false,
  termsOfUseUrl: null,
  privacyPolicyUrl: null,
  languageInfo: {
    autoDetect: true,
    fallbackLanguage: 'en',
  },
  signUp: {
    identifiers: [SignInIdentifier.Username],
    secondaryIdentifiers: [],
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
  socialSignInConnectorTargets: [],
  signInMode: SignInMode.SignInAndRegister,
  customCss: null,
  customContent: {},
  agreeToTermsPolicy: AgreeToTermsPolicy.Automatic,
  customUiAssets: null,
  passwordPolicy: {},
  mfa: {
    policy: MfaPolicy.Mandatory,
    factors: [MfaFactor.TOTP],
  },
  adaptiveMfa: {
    enabled: true,
  },
  singleSignOnEnabled: false,
  socialSignIn: {},
  supportEmail: null,
  supportWebsiteUrl: null,
  unknownSessionRedirectUrl: null,
  captchaPolicy: {},
  sentinelPolicy: {},
  emailBlocklistPolicy: {},
  forgotPasswordMethods: null,
  passkeySignIn: {
    enabled: false,
    showPasskeyButton: false,
    allowAutofill: false,
  },
};

describe('sign-in experience parser', () => {
  it('should omit adaptive mfa from sign-up and sign-in page data', () => {
    const formData = sieFormDataParser.fromSignInExperience(mockSignInExperience);

    expect(formData).not.toHaveProperty('adaptiveMfa');

    const submitPayload = sieFormDataParser.toSignInExperience(formData);

    expect(submitPayload).not.toHaveProperty('adaptiveMfa');

    const comparePayload = signInExperienceToUpdatedDataParser(mockSignInExperience);

    expect(comparePayload).not.toHaveProperty('adaptiveMfa');
  });

  it('should map createAccountEnabled and customCss when building payload', () => {
    const formData = sieFormDataParser.fromSignInExperience(mockSignInExperience);

    const signInOnlyPayload = sieFormDataParser.toSignInExperience({
      ...formData,
      createAccountEnabled: false,
      customCss: '',
    });

    expect(signInOnlyPayload.signInMode).toBe(SignInMode.SignIn);
    expect(signInOnlyPayload.customCss).toBeNull();

    const registerPayload = sieFormDataParser.toSignInExperience({
      ...formData,
      createAccountEnabled: true,
      customCss: 'body { color: red; }',
    });

    expect(registerPayload.signInMode).toBe(SignInMode.SignInAndRegister);
    expect(registerPayload.customCss).toBe('body { color: red; }');
  });

  it('should convert merged sign-up identifiers back to sign-up schema', () => {
    const formData = sieFormDataParser.fromSignInExperience(mockSignInExperience);

    const payload = sieFormDataParser.toSignInExperience({
      ...formData,
      signUp: {
        ...formData.signUp,
        identifiers: [
          { identifier: AlternativeSignUpIdentifier.EmailOrPhone },
          { identifier: SignInIdentifier.Email },
          { identifier: SignInIdentifier.Username },
        ],
      },
    });

    expect(payload.signUp.identifiers).toEqual([SignInIdentifier.Email, SignInIdentifier.Phone]);
    expect(payload.signUp.secondaryIdentifiers).toEqual([
      { identifier: SignInIdentifier.Email, verify: true },
      { identifier: SignInIdentifier.Username },
    ]);
  });

  it('should backfill missing secondaryIdentifiers in compare payload', () => {
    const comparePayload = signInExperienceToUpdatedDataParser({
      ...mockSignInExperience,
      signUp: {
        identifiers: [SignInIdentifier.Username],
        password: true,
        verify: false,
      },
    });

    expect(comparePayload.signUp.secondaryIdentifiers).toEqual([]);
  });

  it('should support legacy social and passkey data defaults', () => {
    const formData = sieFormDataParser.fromSignInExperience({
      ...mockSignInExperience,
      socialSignIn: undefined as never,
      passkeySignIn: undefined as never,
    });

    expect(formData.socialSignIn).toEqual({
      automaticAccountLinking: false,
      skipRequiredIdentifiers: false,
    });
    expect(formData.passkeySignIn).toEqual({
      enabled: false,
      showPasskeyButton: false,
      allowAutofill: false,
    });
  });

  it('should throw on invalid primary sign-up identifiers', () => {
    expect(() =>
      sieFormDataParser.fromSignInExperience({
        ...mockSignInExperience,
        signUp: {
          identifiers: [SignInIdentifier.Username, SignInIdentifier.Email],
          password: true,
          verify: false,
          secondaryIdentifiers: [],
        },
      })
    ).toThrow('Invalid identifiers in the sign up settings.');
  });
});
