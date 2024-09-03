import {
  InteractionEvent,
  type SignInExperience,
  SignInIdentifier,
  SignInMode,
  VerificationType,
} from '@logto/schemas';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import RequestError from '#src/errors/RequestError/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import { createNewCodeVerificationRecord } from '../verifications/code-verification.js';
import { EnterpriseSsoVerification } from '../verifications/enterprise-sso-verification.js';
import { type VerificationRecord } from '../verifications/index.js';
import { NewPasswordIdentityVerification } from '../verifications/new-password-identity-verification.js';
import { PasswordVerification } from '../verifications/password-verification.js';
import { SocialVerification } from '../verifications/social-verification.js';

import { SignInExperienceValidator } from './sign-in-experience-validator.js';

const { jest } = import.meta;

const emailDomain = 'logto.io';

const signInExperiences = {
  findDefaultSignInExperience: jest.fn().mockResolvedValue(mockSignInExperience),
};
const ssoConnectors = {
  getAvailableSsoConnectors: jest.fn().mockResolvedValue([]),
};

const mockTenant = new MockTenant(undefined, { signInExperiences }, undefined, { ssoConnectors });

const newPasswordIdentityVerificationRecord = NewPasswordIdentityVerification.create(
  mockTenant.libraries,
  mockTenant.queries,
  {
    type: SignInIdentifier.Username,
    value: 'username',
  }
);

const emailNewPasswordIdentityVerificationRecord = NewPasswordIdentityVerification.create(
  mockTenant.libraries,
  mockTenant.queries,
  {
    type: SignInIdentifier.Email,
    value: `foo@${emailDomain}`,
  }
);

const passwordVerificationRecords = Object.fromEntries(
  Object.values(SignInIdentifier).map((identifier) => [
    identifier,
    PasswordVerification.create(mockTenant.libraries, mockTenant.queries, {
      type: identifier,
      value: identifier === SignInIdentifier.Email ? `foo@${emailDomain}` : 'value',
    }),
  ])
) as Record<SignInIdentifier, PasswordVerification>;

const verificationCodeVerificationRecords = Object.freeze({
  [SignInIdentifier.Email]: createNewCodeVerificationRecord(
    mockTenant.libraries,
    mockTenant.queries,
    {
      type: SignInIdentifier.Email,
      value: `foo@${emailDomain}`,
    },
    InteractionEvent.SignIn
  ),
  [SignInIdentifier.Phone]: createNewCodeVerificationRecord(
    mockTenant.libraries,
    mockTenant.queries,
    {
      type: SignInIdentifier.Phone,
      value: 'value',
    },
    InteractionEvent.SignIn
  ),
});

const enterpriseSsoVerificationRecords = EnterpriseSsoVerification.create(
  mockTenant.libraries,
  mockTenant.queries,
  'mock_connector_id'
);

const socialVerificationRecord = new SocialVerification(mockTenant.libraries, mockTenant.queries, {
  id: 'social_verification_id',
  type: VerificationType.Social,
  connectorId: 'mock_connector_id',
  socialUserInfo: {
    id: 'user_id',
    email: `foo@${emailDomain}`,
  },
});

describe('SignInExperienceValidator', () => {
  describe('guardInteractionEvent', () => {
    it('SignInMode.Register', async () => {
      const signInExperience = {
        signInMode: SignInMode.Register,
      };
      signInExperiences.findDefaultSignInExperience.mockResolvedValueOnce(signInExperience);

      const signInExperienceSettings = new SignInExperienceValidator(
        mockTenant.libraries,
        mockTenant.queries
      );

      await expect(
        signInExperienceSettings.guardInteractionEvent(InteractionEvent.SignIn)
      ).rejects.toMatchError(new RequestError({ code: 'auth.forbidden', status: 403 }));

      await expect(
        signInExperienceSettings.guardInteractionEvent(InteractionEvent.Register)
      ).resolves.not.toThrow();

      await expect(
        signInExperienceSettings.guardInteractionEvent(InteractionEvent.ForgotPassword)
      ).resolves.not.toThrow();
    });

    it('SignInMode.SignIn', async () => {
      const signInExperience = {
        signInMode: SignInMode.SignIn,
      };
      signInExperiences.findDefaultSignInExperience.mockResolvedValueOnce(signInExperience);

      const signInExperienceSettings = new SignInExperienceValidator(
        mockTenant.libraries,
        mockTenant.queries
      );
      await expect(
        signInExperienceSettings.guardInteractionEvent(InteractionEvent.Register)
      ).rejects.toMatchError(new RequestError({ code: 'auth.forbidden', status: 403 }));

      await expect(
        signInExperienceSettings.guardInteractionEvent(InteractionEvent.SignIn)
      ).resolves.not.toThrow();

      await expect(
        signInExperienceSettings.guardInteractionEvent(InteractionEvent.ForgotPassword)
      ).resolves.not.toThrow();
    });

    it('SignInMode.SignInAndRegister', async () => {
      const signInExperience = {
        signInMode: SignInMode.SignInAndRegister,
      };
      signInExperiences.findDefaultSignInExperience.mockResolvedValueOnce(signInExperience);

      const signInExperienceSettings = new SignInExperienceValidator(
        mockTenant.libraries,
        mockTenant.queries
      );

      await expect(
        signInExperienceSettings.guardInteractionEvent(InteractionEvent.Register)
      ).resolves.not.toThrow();
      await expect(
        signInExperienceSettings.guardInteractionEvent(InteractionEvent.SignIn)
      ).resolves.not.toThrow();
      await expect(
        signInExperienceSettings.guardInteractionEvent(InteractionEvent.ForgotPassword)
      ).resolves.not.toThrow();
    });
  });

  describe('verifyIdentificationMethod (SignIn)', () => {
    const signInVerificationTestCases: Record<
      string,
      {
        signInExperience: SignInExperience;
        cases: Array<{ verificationRecord: VerificationRecord; accepted: boolean }>;
      }
    > = Object.freeze({
      'password enabled for all identifiers': {
        signInExperience: mockSignInExperience,
        cases: [
          {
            verificationRecord: passwordVerificationRecords[SignInIdentifier.Username],
            accepted: true,
          },
          {
            verificationRecord: passwordVerificationRecords[SignInIdentifier.Email],
            accepted: true,
          },
          {
            verificationRecord: passwordVerificationRecords[SignInIdentifier.Phone],
            accepted: true,
          },
        ],
      },
      'password disabled for email and phone': {
        signInExperience: {
          ...mockSignInExperience,
          signIn: {
            methods: mockSignInExperience.signIn.methods.map((method) =>
              method.identifier === SignInIdentifier.Username
                ? method
                : { ...method, password: false }
            ),
          },
        },
        cases: [
          {
            verificationRecord: passwordVerificationRecords[SignInIdentifier.Username],
            accepted: true,
          },
          {
            verificationRecord: passwordVerificationRecords[SignInIdentifier.Email],
            accepted: false,
          },
          {
            verificationRecord: passwordVerificationRecords[SignInIdentifier.Phone],
            accepted: false,
          },
        ],
      },
      'verification code enabled for email and phone': {
        signInExperience: mockSignInExperience,
        cases: [
          {
            verificationRecord: verificationCodeVerificationRecords[SignInIdentifier.Email],
            accepted: true,
          },
          {
            verificationRecord: verificationCodeVerificationRecords[SignInIdentifier.Phone],
            accepted: true,
          },
        ],
      },
      'verification code disabled for email and phone': {
        signInExperience: {
          ...mockSignInExperience,
          signIn: {
            methods: mockSignInExperience.signIn.methods.map((method) =>
              method.identifier === SignInIdentifier.Username
                ? method
                : { ...method, verificationCode: false }
            ),
          },
        },
        cases: [
          {
            verificationRecord: verificationCodeVerificationRecords[SignInIdentifier.Email],
            accepted: false,
          },
          {
            verificationRecord: verificationCodeVerificationRecords[SignInIdentifier.Phone],
            accepted: false,
          },
        ],
      },
      'no sign-in methods is enabled': {
        signInExperience: {
          ...mockSignInExperience,
          signIn: {
            methods: [],
          },
        },
        cases: [
          {
            verificationRecord: passwordVerificationRecords[SignInIdentifier.Username],
            accepted: false,
          },
          {
            verificationRecord: verificationCodeVerificationRecords[SignInIdentifier.Email],
            accepted: false,
          },
          {
            verificationRecord: verificationCodeVerificationRecords[SignInIdentifier.Phone],
            accepted: false,
          },
        ],
      },
      'single sign-on enabled': {
        signInExperience: {
          ...mockSignInExperience,
          singleSignOnEnabled: true,
        },
        cases: [
          {
            verificationRecord: enterpriseSsoVerificationRecords,
            accepted: true,
          },
        ],
      },
      'single sign-on disabled': {
        signInExperience: {
          ...mockSignInExperience,
          singleSignOnEnabled: false,
        },
        cases: [
          {
            verificationRecord: enterpriseSsoVerificationRecords,
            accepted: false,
          },
        ],
      },
    });

    describe.each(Object.keys(signInVerificationTestCases))(`%s`, (testCase) => {
      const { signInExperience, cases } = signInVerificationTestCases[testCase]!;

      it.each(cases)('guard verification record %p', async ({ verificationRecord, accepted }) => {
        signInExperiences.findDefaultSignInExperience.mockResolvedValueOnce(signInExperience);

        const signInExperienceSettings = new SignInExperienceValidator(
          mockTenant.libraries,
          mockTenant.queries
        );

        await (accepted
          ? expect(
              signInExperienceSettings.guardIdentificationMethod(
                InteractionEvent.SignIn,
                verificationRecord
              )
            ).resolves.not.toThrow()
          : expect(
              signInExperienceSettings.guardIdentificationMethod(
                InteractionEvent.SignIn,
                verificationRecord
              )
            ).rejects.toMatchError(
              new RequestError({ code: 'user.sign_in_method_not_enabled', status: 422 })
            ));
      });
    });
  });

  describe('guardSsoOnlyEmailIdentifier: identifier with SSO enabled domain should throw', () => {
    const mockSsoConnector = {
      domains: [emailDomain],
    };

    const expectError = new RequestError(
      {
        code: 'session.sso_enabled',
        status: 422,
      },
      {
        ssoConnectors: [mockSsoConnector],
      }
    );

    it('email password verification record', async () => {
      ssoConnectors.getAvailableSsoConnectors.mockResolvedValueOnce([mockSsoConnector]);

      const signInExperienceSettings = new SignInExperienceValidator(
        mockTenant.libraries,
        mockTenant.queries
      );

      await expect(
        signInExperienceSettings.guardIdentificationMethod(
          InteractionEvent.SignIn,
          passwordVerificationRecords[SignInIdentifier.Email]
        )
      ).rejects.toMatchError(expectError);
    });

    it('email verification code verification record', async () => {
      ssoConnectors.getAvailableSsoConnectors.mockResolvedValueOnce([mockSsoConnector]);

      const signInExperienceSettings = new SignInExperienceValidator(
        mockTenant.libraries,
        mockTenant.queries
      );

      await expect(
        signInExperienceSettings.guardIdentificationMethod(
          InteractionEvent.SignIn,
          verificationCodeVerificationRecords[SignInIdentifier.Email]
        )
      ).rejects.toMatchError(expectError);
    });

    it('social verification record', async () => {
      ssoConnectors.getAvailableSsoConnectors.mockResolvedValueOnce([mockSsoConnector]);

      const signInExperienceSettings = new SignInExperienceValidator(
        mockTenant.libraries,
        mockTenant.queries
      );

      await expect(
        signInExperienceSettings.guardIdentificationMethod(
          InteractionEvent.SignIn,
          socialVerificationRecord
        )
      ).rejects.toMatchError(expectError);
    });
  });
});
