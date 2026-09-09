/* eslint-disable max-lines */
import { TemplateType } from '@logto/connector-kit';
import {
  AdditionalIdentifier,
  adminConsoleApplicationId,
  adminTenantId,
  AuthenticationContextMode,
  AuthenticationFactor,
  AuthenticationFactorClass,
  AuthenticationMethodReference,
  AuthenticationProofRole,
  type AuthenticationProof,
  ConnectorType,
  type CreateUser,
  InteractionEvent,
  LogtoAcr,
  LogtoActionKey,
  type JwtCustomizerUserContext,
  MfaFactor,
  MfaPolicy,
  type SignInExperience,
  SignInIdentifier,
  SignInMode,
  type User,
  UsersPasswordEncryptionMethod,
  VerificationType,
} from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';
import { conditional } from '@silverhand/essentials';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import { mockUser, mockUserWithMfaVerifications } from '#src/__mocks__/user.js';
import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type InsertUserResult } from '#src/libraries/user.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { type Interaction, type WithHooksAndLogsContext } from '../types.js';

import { EmailCodeVerification } from './verifications/code-verification.js';
import { PasswordVerification } from './verifications/password-verification.js';
import { TotpVerification } from './verifications/totp-verification.js';
import { SignInPasskeyVerification } from './verifications/web-authn-verification.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

mockEsm('#src/utils/tenant.js', () => ({
  getTenantId: () => [adminTenantId],
}));

const mockEmail = 'foo@bar.com';
/** The proof a password records in the given role. */
const passwordProof = (role: AuthenticationProofRole): AuthenticationProof => ({
  id: 'password',
  factor: AuthenticationFactor.Password,
  class: AuthenticationFactorClass.FirstFactor,
  amr: [AuthenticationMethodReference.Password],
  role,
});
const userQueries = {
  hasActiveUsers: jest.fn().mockResolvedValue(false),
  hasUserWithEmail: jest.fn().mockResolvedValue(false),
  hasUserWithNormalizedPhone: jest.fn().mockResolvedValue(false),
  hasUserWithIdentity: jest.fn().mockResolvedValue(false),
  findUserById: jest.fn().mockResolvedValue(mockUser),
  updateUserById: jest.fn().mockResolvedValue(mockUser),
};
const userLibraries = {
  checkIdentifierCollision: jest.fn().mockResolvedValue(null),
  generateUserId: jest.fn().mockResolvedValue('uid'),
  insertUser: jest.fn(async (user: CreateUser): Promise<InsertUserResult> => [user as User]),
  provisionOrganizations: jest.fn().mockResolvedValue([]),
  provisionOrganizationsByEmailDomain: jest.fn().mockResolvedValue([]),
};
const ssoConnectors = {
  getAvailableSsoConnectors: jest.fn().mockResolvedValue([]),
};
const signInExperiences = {
  findDefaultSignInExperience: jest.fn().mockResolvedValue({
    ...mockSignInExperience,
    signUp: {
      identifiers: [SignInIdentifier.Email],
      password: false,
      verify: true,
    },
  }),
  updateDefaultSignInExperience: jest.fn(),
};

const mockProviderInteractionDetails = jest
  .fn()
  .mockResolvedValue({ params: { client_id: adminConsoleApplicationId } });
const mockJwtCustomizerUserContext: JwtCustomizerUserContext = {
  id: mockUser.id,
  username: mockUser.username,
  primaryEmail: mockUser.primaryEmail,
  primaryPhone: mockUser.primaryPhone,
  name: mockUser.name,
  avatar: mockUser.avatar,
  customData: mockUser.customData,
  identities: mockUser.identities,
  lastSignInAt: mockUser.lastSignInAt,
  createdAt: mockUser.createdAt,
  updatedAt: mockUser.updatedAt,
  profile: mockUser.profile,
  applicationId: mockUser.applicationId,
  cimdClientId: mockUser.cimdClientId,
  isSuspended: mockUser.isSuspended,
  hasPassword: true,
  ssoIdentities: [],
  mfaVerificationFactors: [],
  roles: [],
  organizations: [],
  organizationRoles: [],
};

const ExperienceInteraction = await pickDefault(import('./experience-interaction.js'));

const createSignInInteraction = ({
  headers,
  interactionEvent = InteractionEvent.SignIn,
  adaptiveMfaEnabled = false,
  user = mockUser,
  interactionResult = {},
  signInExperienceOverrides = {},
}: {
  headers?: Record<string, string>;
  interactionEvent?: InteractionEvent;
  adaptiveMfaEnabled?: boolean;
  user?: User;
  interactionResult?: Record<string, unknown>;
  signInExperienceOverrides?: Partial<SignInExperience>;
} = {}) => {
  const userGeoLocations = {
    upsertUserGeoLocation: jest.fn().mockResolvedValue(null),
  };
  const userSignInCountries = {
    upsertUserSignInCountry: jest.fn().mockResolvedValue(null),
    pruneUserSignInCountriesByUserId: jest.fn().mockResolvedValue(null),
  };
  const signInExperiencesWithAdaptiveMfa = {
    findDefaultSignInExperience: jest.fn().mockResolvedValue({
      ...mockSignInExperience,
      adaptiveMfa: { enabled: adaptiveMfaEnabled },
      passwordExpiration: {
        enabled: false,
      },
      ...signInExperienceOverrides,
    }),
  };
  const signInUserQueries = {
    ...userQueries,
    findUserById: jest.fn().mockResolvedValue(user),
    findUserByUsername: jest.fn().mockResolvedValue(user),
    findUserByEmail: jest.fn().mockResolvedValue(user),
    updateUserById: jest.fn().mockResolvedValue(user),
  };
  const runActionHandler = jest.fn(
    async (_input: { event: unknown; key: LogtoActionKey }): Promise<unknown> => undefined
  );
  const runAction = jest.fn(
    async <Event>(
      input: { key: LogtoActionKey; auditContext: unknown } & (
        | { event: Event }
        | { getEvent: () => Promise<Event> }
      )
    ): Promise<unknown> => {
      const event = 'getEvent' in input ? await input.getEvent() : input.event;
      return runActionHandler({ key: input.key, event });
    }
  );
  const getUserContext = jest.fn().mockResolvedValue(mockJwtCustomizerUserContext);
  const provider = createMockProvider();
  const signInTenant = new MockTenant(
    provider,
    {
      users: signInUserQueries,
      signInExperiences: signInExperiencesWithAdaptiveMfa,
      userGeoLocations,
      userSignInCountries,
    },
    undefined,
    {
      users: userLibraries,
      ssoConnectors,
      actions: { runAction },
      jwtCustomizers: { getUserContext },
    }
  );
  const logContext = createMockLogContext();
  const baseContext = createContextWithRouteParameters(
    headers
      ? { headers }
      : {
          headers: {
            'x-logto-cf-country': 'US',
            'x-logto-cf-latitude': '37.7749',
            'x-logto-cf-longitude': '-122.4194',
          },
        }
  );
  const interactionDetails = {
    jti: 'session-id',
    params: {
      client_id: adminConsoleApplicationId,
    },
    result: {
      interactionEvent,
      userId: user.id,
      ...interactionResult,
    },
  } as unknown as Interaction;
  const signInContext: WithHooksAndLogsContext = {
    assignReleaseOnSuccessInteractionHookResult: jest.fn(),
    assignReleaseAnywayInteractionHookResult: jest.fn(),
    appendDataHookContext: jest.fn(),
    appendExceptionHookContext: jest.fn(),
    ...baseContext,
    ...logContext,
    interactionDetails,
  };

  const experienceInteraction = new ExperienceInteraction(
    signInContext,
    signInTenant,
    interactionDetails
  );

  return {
    experienceInteraction,
    provider,
    runAction,
    runActionHandler,
    getUserContext,
    signInUserQueries,
    userGeoLocations,
    userSignInCountries,
    createLog: logContext.createLog,
    mockAppend: logContext.mockAppend,
  };
};

describe('ExperienceInteraction class', () => {
  const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;
  const setDevFeaturesEnabled = (enabled: boolean) => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = enabled;
  };

  const tenant = new MockTenant(
    createMockProvider(mockProviderInteractionDetails),
    {
      users: userQueries,
      signInExperiences,
    },
    undefined,
    { users: userLibraries, ssoConnectors }
  );

  // @ts-expect-error --mock test context
  const ctx: WithHooksAndLogsContext = {
    assignReleaseOnSuccessInteractionHookResult: jest.fn(),
    assignReleaseAnywayInteractionHookResult: jest.fn(),
    appendDataHookContext: jest.fn(),
    ...createContextWithRouteParameters(),
    ...createMockLogContext(),
  };
  const { libraries, queries } = tenant;

  const emailVerificationRecord = new EmailCodeVerification(libraries, queries, {
    id: 'mock_email_verification_id',
    type: VerificationType.EmailVerificationCode,
    identifier: {
      type: SignInIdentifier.Email,
      value: mockEmail,
    },
    templateType: TemplateType.Register,
    verified: true,
  });

  beforeAll(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
  });

  describe('new user registration', () => {
    it('First admin user provisioning', async () => {
      const experienceInteraction = new ExperienceInteraction(
        ctx,
        tenant,
        InteractionEvent.Register
      );

      experienceInteraction.setVerificationRecord(emailVerificationRecord);
      await experienceInteraction.createUser(emailVerificationRecord.id);

      // Creating the account from the record is the `create` proof of the new account.
      expect(experienceInteraction.toJson().authenticationProofs).toMatchObject([
        {
          id: emailVerificationRecord.id,
          factor: AuthenticationFactor.Email,
          class: AuthenticationFactorClass.FirstFactor,
          amr: ['otp'],
          role: AuthenticationProofRole.Create,
        },
      ]);

      expect(userLibraries.insertUser).toHaveBeenCalledWith(
        {
          id: 'uid',
          primaryEmail: mockEmail,
          logtoConfig: {
            mfa: { enabled: false },
          },
        },
        { isInteractive: true, roleNames: ['user', 'default:admin'] }
      );

      expect(signInExperiences.updateDefaultSignInExperience).toHaveBeenCalledWith({
        signInMode: SignInMode.SignIn,
      });

      expect(userLibraries.provisionOrganizationsByEmailDomain).toHaveBeenCalledWith(
        'uid',
        mockEmail
      );
    });
  });

  describe('sign-in submission', () => {
    it('runs PostSignIn action before provider interaction result', async () => {
      const { experienceInteraction, provider, runAction, runActionHandler, getUserContext } =
        createSignInInteraction();

      await experienceInteraction.submit();

      expect(getUserContext).toHaveBeenCalledWith(mockUser.id);
      const [runActionInput] = runAction.mock.calls[0]!;
      expect(runActionInput).toMatchObject({
        key: LogtoActionKey.PostSignIn,
        auditContext: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Jest asymmetric matcher is typed as `any`.
          createLog: expect.any(Function),
          sessionId: 'session-id',
          applicationId: adminConsoleApplicationId,
          userId: mockUser.id,
        },
      });
      expect('getEvent' in runActionInput && typeof runActionInput.getEvent).toBe('function');
      expect(runActionHandler).toHaveBeenCalledWith({
        key: LogtoActionKey.PostSignIn,
        event: {
          key: LogtoActionKey.PostSignIn,
          interactionEvent: InteractionEvent.SignIn,
          user: mockJwtCustomizerUserContext,
        },
      });
      expect(runActionHandler.mock.invocationCallOrder[0]).toBeLessThan(
        (provider.interactionResult as jest.Mock).mock.invocationCallOrder[0]!
      );
    });

    it('seeds the aggregated authentication context into the login result when dev features are enabled', async () => {
      setDevFeaturesEnabled(true);
      const { experienceInteraction, provider } = createSignInInteraction({
        interactionResult: {
          authenticationProofs: [passwordProof(AuthenticationProofRole.Identify)],
          verificationRecords: [
            {
              id: 'password',
              type: VerificationType.Password,
              identifier: { type: SignInIdentifier.Username, value: mockUser.username },
              verified: true,
            },
            // A verified record that no touchpoint consumed is not a proof and must not reach
            // the login result.
            {
              id: 'new-password-identity',
              type: VerificationType.NewPasswordIdentity,
              identifier: { type: SignInIdentifier.Username, value: 'unused' },
              passwordEncrypted: 'encrypted',
              passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i,
            },
          ],
        },
      });

      await experienceInteraction.submit();

      expect(provider.interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          login: {
            accountId: mockUser.id,
            acr: 'urn:logto:acr:1fa',
            amr: ['pwd'],
          },
        })
      );
    });

    it('seeds the context a registration established into the login result when dev features are enabled', async () => {
      setDevFeaturesEnabled(true);
      // An email + password registration: `createUser()` consumed the email code and the profile
      // established the password.
      const { experienceInteraction, provider } = createSignInInteraction({
        interactionEvent: InteractionEvent.Register,
        interactionResult: {
          authenticationProofs: [
            {
              id: 'email',
              factor: AuthenticationFactor.Email,
              class: AuthenticationFactorClass.FirstFactor,
              amr: ['otp'],
              role: AuthenticationProofRole.Create,
            },
            passwordProof(AuthenticationProofRole.Bind),
          ],
        },
      });

      await experienceInteraction.submit();

      expect(provider.interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          login: {
            accountId: mockUser.id,
            acr: 'urn:logto:acr:1fa',
            amr: ['otp', 'pwd'],
          },
        })
      );
    });

    it('records an identify proof for every verification record that identified the user', async () => {
      const { experienceInteraction } = createSignInInteraction({
        interactionResult: {
          userId: undefined,
          verificationRecords: [
            {
              id: 'password',
              type: VerificationType.Password,
              identifier: { type: SignInIdentifier.Username, value: mockUser.username },
              verified: true,
            },
            {
              id: 'email',
              type: VerificationType.EmailVerificationCode,
              identifier: { type: SignInIdentifier.Email, value: mockEmail },
              templateType: TemplateType.SignIn,
              verified: true,
            },
          ],
        },
      });

      await experienceInteraction.identifyUser('password');
      expect(experienceInteraction.toJson()).toMatchObject({
        userId: mockUser.id,
        authenticationProofs: [passwordProof(AuthenticationProofRole.Identify)],
      });

      // A second record that identifies the same user is recorded as well.
      await experienceInteraction.identifyUser('email');
      expect(experienceInteraction.toJson().authenticationProofs).toMatchObject([
        { id: 'password', role: AuthenticationProofRole.Identify },
        { id: 'email', role: AuthenticationProofRole.Identify, factor: AuthenticationFactor.Email },
      ]);
    });

    it('records the proof for a password established through the profile once', () => {
      const { experienceInteraction } = createSignInInteraction();
      const digest = {
        passwordEncrypted: 'encrypted',
        passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i,
      };

      experienceInteraction.profile.unsafeSet(digest);
      experienceInteraction.profile.unsafeSet(digest);

      expect(experienceInteraction.toJson().authenticationProofs).toMatchObject([
        {
          id: 'password',
          factor: AuthenticationFactor.Password,
          class: AuthenticationFactorClass.FirstFactor,
          amr: ['pwd'],
          role: AuthenticationProofRole.Bind,
        },
      ]);
    });

    it('clears the proofs when the interaction event changes, like the profile', async () => {
      const { experienceInteraction } = createSignInInteraction({
        interactionResult: {
          authenticationProofs: [passwordProof(AuthenticationProofRole.Identify)],
        },
      });

      await experienceInteraction.setInteractionEvent(InteractionEvent.SignIn);
      expect(experienceInteraction.toJson().authenticationProofs).toHaveLength(1);

      await experienceInteraction.setInteractionEvent(InteractionEvent.Register);
      expect(experienceInteraction.toJson().authenticationProofs).toEqual([]);
    });

    it('does not let the proofs outlive the interaction', async () => {
      const { experienceInteraction, provider } = createSignInInteraction({
        interactionEvent: InteractionEvent.ForgotPassword,
        interactionResult: {
          profile: {
            passwordEncrypted: 'encrypted',
            passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i,
          },
          authenticationProofs: [passwordProof(AuthenticationProofRole.Bind)],
        },
      });

      await experienceInteraction.submit();

      expect(provider.interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        {}
      );
      expect(experienceInteraction.toJson().authenticationProofs).toEqual([]);
    });

    it('keeps the proofs out of the sanitized interaction data', async () => {
      const { experienceInteraction } = createSignInInteraction({
        interactionResult: {
          authenticationProofs: [passwordProof(AuthenticationProofRole.Identify)],
        },
      });

      expect(experienceInteraction.toJson().authenticationProofs).toHaveLength(1);
      await expect(experienceInteraction.toSanitizedJson()).resolves.not.toHaveProperty(
        'authenticationProofs'
      );
    });

    it('finishes with the account id only when dev features are disabled', async () => {
      setDevFeaturesEnabled(false);
      const { experienceInteraction, provider } = createSignInInteraction({
        interactionResult: {
          verificationRecords: [
            {
              id: 'password',
              type: VerificationType.Password,
              identifier: { type: SignInIdentifier.Username, value: mockUser.username },
              verified: true,
            },
          ],
        },
      });

      await experienceInteraction.submit();

      expect(provider.interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ login: { accountId: mockUser.id } })
      );
    });

    it('does not include password in the PostSignIn action event', async () => {
      const { experienceInteraction, runActionHandler } = createSignInInteraction();

      await experienceInteraction.submit();

      const [{ event }] = runActionHandler.mock.calls[0]!;

      expect(event).not.toHaveProperty('password');
      expect(JSON.stringify(event)).not.toContain(mockUser.passwordEncrypted);
    });

    it('does not run PostSignIn action for register interactions', async () => {
      const { experienceInteraction, runAction, getUserContext } = createSignInInteraction({
        interactionEvent: InteractionEvent.Register,
      });

      await experienceInteraction.submit();

      expect(getUserContext).not.toHaveBeenCalled();
      expect(runAction).not.toHaveBeenCalled();
    });

    it('updates user when PostSignIn action returns updateUser', async () => {
      const { experienceInteraction, runActionHandler } = createSignInInteraction();
      const updateUser = jest.spyOn(experienceInteraction.provisionLibrary, 'updateUser');

      runActionHandler.mockResolvedValueOnce({
        action: 'updateUser',
        user: {
          name: 'Jane Doe',
        },
      });

      await experienceInteraction.submit();

      expect(updateUser).toHaveBeenCalledWith(
        mockUser.id,
        { name: 'Jane Doe' },
        { mergeCustomData: true }
      );
    });

    it('preserves existing customData when PostSignIn action writes customData', async () => {
      const user = {
        ...mockUser,
        customData: {
          p1Synced: true,
          source: 'p1',
        },
      };
      const { experienceInteraction, runActionHandler, signInUserQueries } =
        createSignInInteraction({
          user,
        });

      runActionHandler.mockResolvedValueOnce({
        action: 'updateUser',
        user: {
          customData: {
            p2Synced: true,
          },
        },
      });

      await experienceInteraction.submit();

      expect(signInUserQueries.updateUserById).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          customData: {
            p1Synced: true,
            p2Synced: true,
            source: 'p1',
          },
        }),
        'replace'
      );
    });

    it.each([undefined, null, {}, { action: 'updateUser' }])(
      'does not update user and proceeds when PostSignIn action returns no-op result %#',
      async (result) => {
        const { experienceInteraction, provider, runActionHandler } = createSignInInteraction();
        const updateUser = jest.spyOn(experienceInteraction.provisionLibrary, 'updateUser');

        runActionHandler.mockResolvedValueOnce(result);

        await experienceInteraction.submit();

        expect(updateUser).not.toHaveBeenCalled();
        expect(provider.interactionResult).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({
            login: { accountId: mockUser.id },
          })
        );
      }
    );

    it.each([
      { action: 'createUser', user: { name: 'Jane Doe' } },
      { action: 'rejectInvalidCredentials' },
      { action: 'denyAccess', user: { name: 'Jane Doe' } },
      { action: 'continue' },
      { ignored: true },
      { user: { name: 'Jane Doe' } },
    ])('blocks sign-in when PostSignIn action returns invalid result %#', async (result) => {
      const { experienceInteraction, provider, runActionHandler } = createSignInInteraction();

      runActionHandler.mockResolvedValueOnce(result);

      await expect(experienceInteraction.submit()).rejects.toMatchError(
        new RequestError({ code: 'session.verification_failed', status: 400 })
      );

      expect(provider.interactionResult).not.toHaveBeenCalled();
    });

    it('blocks sign-in when PostSignIn action execution fails in block mode', async () => {
      const { experienceInteraction, provider, runActionHandler } = createSignInInteraction();

      runActionHandler.mockRejectedValueOnce(
        new RequestError({ code: 'session.verification_failed', status: 400 })
      );

      await expect(experienceInteraction.submit()).rejects.toMatchError(
        new RequestError({ code: 'session.verification_failed', status: 400 })
      );

      expect(provider.interactionResult).not.toHaveBeenCalled();
    });

    it('should record geo context when dev features are disabled', async () => {
      setDevFeaturesEnabled(false);
      const { experienceInteraction, userGeoLocations, userSignInCountries } =
        createSignInInteraction();

      await experienceInteraction.submit();

      expect(userGeoLocations.upsertUserGeoLocation).toHaveBeenCalledWith(
        mockUser.id,
        37.7749,
        -122.4194
      );
      expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(mockUser.id, 'US');
    });

    it('should record geo location and sign-in country when dev features are enabled', async () => {
      setDevFeaturesEnabled(true);
      const { experienceInteraction, userGeoLocations, userSignInCountries } =
        createSignInInteraction();

      await experienceInteraction.submit();

      expect(userGeoLocations.upsertUserGeoLocation).toHaveBeenCalledWith(
        mockUser.id,
        37.7749,
        -122.4194
      );
      expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(mockUser.id, 'US');
    });

    it('should allow zero coordinates and record them', async () => {
      setDevFeaturesEnabled(true);
      const { experienceInteraction, userGeoLocations } = createSignInInteraction({
        headers: {
          'x-logto-cf-country': 'US',
          'x-logto-cf-latitude': '0',
          'x-logto-cf-longitude': '0',
        },
      });

      await experienceInteraction.submit();

      expect(userGeoLocations.upsertUserGeoLocation).toHaveBeenCalledWith(mockUser.id, 0, 0);
    });

    it('should skip invalid coordinates but still record valid country', async () => {
      setDevFeaturesEnabled(true);
      const { experienceInteraction, userGeoLocations, userSignInCountries } =
        createSignInInteraction({
          headers: {
            'x-logto-cf-country': 'US',
            'x-logto-cf-latitude': 'abc',
            'x-logto-cf-longitude': '181',
          },
        });

      await experienceInteraction.submit();

      expect(userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
      expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(mockUser.id, 'US');
    });

    it('should skip out-of-range latitude but still record valid country', async () => {
      setDevFeaturesEnabled(true);
      const { experienceInteraction, userGeoLocations, userSignInCountries } =
        createSignInInteraction({
          headers: {
            'x-logto-cf-country': 'US',
            'x-logto-cf-latitude': '-91',
            'x-logto-cf-longitude': '10',
          },
        });

      await experienceInteraction.submit();

      expect(userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
      expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(mockUser.id, 'US');
    });

    it('should skip invalid country codes but record coordinates', async () => {
      setDevFeaturesEnabled(true);
      const invalidCountries = ['USA', 'jpn'];

      for (const country of invalidCountries) {
        const { experienceInteraction, userGeoLocations, userSignInCountries } =
          createSignInInteraction({
            headers: {
              'x-logto-cf-country': country,
              'x-logto-cf-latitude': '37.7749',
              'x-logto-cf-longitude': '-122.4194',
            },
          });

        // eslint-disable-next-line no-await-in-loop
        await experienceInteraction.submit();

        expect(userGeoLocations.upsertUserGeoLocation).toHaveBeenCalledWith(
          mockUser.id,
          37.7749,
          -122.4194
        );
        expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(
          mockUser.id,
          undefined
        );
      }
    });

    it('should normalize lowercase country codes', async () => {
      setDevFeaturesEnabled(true);
      const { experienceInteraction, userSignInCountries } = createSignInInteraction({
        headers: {
          'x-logto-cf-country': 'jp',
          'x-logto-cf-latitude': '35.6762',
          'x-logto-cf-longitude': '139.6503',
        },
      });

      await experienceInteraction.submit();

      expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(mockUser.id, 'JP');
    });

    it('should record country when coordinates are missing', async () => {
      setDevFeaturesEnabled(true);
      const { experienceInteraction, userGeoLocations, userSignInCountries } =
        createSignInInteraction({
          headers: {
            'x-logto-cf-country': 'US',
          },
        });

      await experienceInteraction.submit();

      expect(userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
      expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(mockUser.id, 'US');
    });

    it('should skip recording coordinates when only latitude is provided', async () => {
      setDevFeaturesEnabled(true);
      const { experienceInteraction, userGeoLocations, userSignInCountries } =
        createSignInInteraction({
          headers: {
            'x-logto-cf-latitude': '51.5074',
          },
        });

      await experienceInteraction.submit();

      expect(userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
      expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(
        mockUser.id,
        undefined
      );
    });

    it('should record geo context when adaptive MFA is disabled', async () => {
      setDevFeaturesEnabled(true);
      const { experienceInteraction, userGeoLocations, userSignInCountries } =
        createSignInInteraction({ adaptiveMfaEnabled: false });

      await experienceInteraction.submit();

      expect(userGeoLocations.upsertUserGeoLocation).toHaveBeenCalledWith(
        mockUser.id,
        37.7749,
        -122.4194
      );
      expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(mockUser.id, 'US');
    });

    it('should record geo context for register interactions', async () => {
      setDevFeaturesEnabled(true);
      const { experienceInteraction, userGeoLocations, userSignInCountries } =
        createSignInInteraction({ interactionEvent: InteractionEvent.Register });

      await experienceInteraction.submit();

      expect(userGeoLocations.upsertUserGeoLocation).toHaveBeenCalledWith(
        mockUser.id,
        37.7749,
        -122.4194
      );
      expect(userSignInCountries.upsertUserSignInCountry).toHaveBeenCalledWith(mockUser.id, 'US');
    });
  });

  describe('step-up creation', () => {
    const stepUpContext = {
      requestedAcrValues: [LogtoAcr.Mfa],
      selectedAcr: LogtoAcr.Mfa,
      mode: AuthenticationContextMode.StepUp,
    };
    const requestedOnlyContext = { requestedAcrValues: [LogtoAcr.Mfa, LogtoAcr.FirstFactor] };

    const createInteraction = ({
      interactionEvent = InteractionEvent.SignIn,
      details,
      withoutSession = false,
      user = mockUserWithMfaVerifications,
      connectors = [],
    }: {
      interactionEvent?: InteractionEvent;
      details?: Record<string, unknown>;
      /** Create the interaction without an authenticated session. */
      withoutSession?: boolean;
      user?: User;
      connectors?: Array<{ type: ConnectorType }>;
    } = {}) => {
      const interactionDetails = {
        jti: 'session-id',
        params: { client_id: adminConsoleApplicationId },
        prompt: { name: 'login', reasons: ['acr_unmet'], details },
        ...conditional(
          !withoutSession && {
            session: { accountId: user.id, acr: LogtoAcr.FirstFactor, amr: ['pwd'] },
          }
        ),
      } as unknown as Interaction;
      const provider = createMockProvider(jest.fn().mockResolvedValue(interactionDetails));
      const stepUpTenant = new MockTenant(
        provider,
        {
          users: {
            ...userQueries,
            findUserById: jest.fn().mockResolvedValue(user),
            findUserByUsername: jest.fn().mockResolvedValue(user),
          },
          signInExperiences: {
            findDefaultSignInExperience: jest.fn().mockResolvedValue({
              ...mockSignInExperience,
              mfa: { policy: MfaPolicy.UserControlled, factors: [MfaFactor.TOTP] },
            }),
          },
        },
        { getLogtoConnectors: jest.fn().mockResolvedValue(connectors) },
        { users: userLibraries, ssoConnectors }
      );
      const stepUpCtx: WithHooksAndLogsContext = { ...ctx, interactionDetails };

      return {
        provider,
        stepUpTenant,
        stepUpCtx,
        experienceInteraction: new ExperienceInteraction(stepUpCtx, stepUpTenant, interactionEvent),
      };
    };

    it('pins the subject and sets the mode from a step-up prompt', async () => {
      const { experienceInteraction } = createInteraction({
        details: { authenticationContext: stepUpContext },
      });

      expect(experienceInteraction.isStepUp).toBe(true);
      // The subject is readable, but nothing has verified it: `userId` stays unset.
      expect(experienceInteraction.subjectUserId).toBe(mockUserWithMfaVerifications.id);
      expect(experienceInteraction.identifiedUserId).toBeUndefined();
      expect(experienceInteraction.carriedContributions).toEqual([
        {
          factor: AuthenticationFactor.Password,
          class: AuthenticationFactorClass.FirstFactor,
          amr: [AuthenticationMethodReference.Password],
        },
      ]);
      expect(experienceInteraction.toJson()).toMatchObject({
        interactionEvent: InteractionEvent.SignIn,
        authenticationContext: stepUpContext,
      });
      expect(experienceInteraction.toJson().userId).toBeUndefined();
    });

    it('promotes the subject once an MFA challenge is answered for it', async () => {
      const { experienceInteraction, stepUpTenant } = createInteraction({
        details: { authenticationContext: stepUpContext },
      });
      const { libraries, queries } = stepUpTenant;

      experienceInteraction.setVerificationRecord(
        new TotpVerification(libraries, queries, {
          id: 'totp-verification-id',
          type: VerificationType.TOTP,
          userId: mockUserWithMfaVerifications.id,
          verified: true,
        })
      );
      experienceInteraction.consumeForMfa(VerificationType.TOTP, 'totp-verification-id');

      expect(experienceInteraction.identifiedUserId).toBe(mockUserWithMfaVerifications.id);
      expect(experienceInteraction.toJson().authenticationProofs).toHaveLength(1);
    });

    it('forbids an MFA challenge answered for another user than the subject', async () => {
      const { experienceInteraction, stepUpTenant } = createInteraction({
        details: { authenticationContext: stepUpContext },
      });
      const { libraries, queries } = stepUpTenant;

      experienceInteraction.setVerificationRecord(
        new TotpVerification(libraries, queries, {
          id: 'totp-verification-id',
          type: VerificationType.TOTP,
          userId: 'someone-else',
          verified: true,
        })
      );

      expect(() =>
        experienceInteraction.consumeForMfa(VerificationType.TOTP, 'totp-verification-id')
      ).toThrow(new RequestError({ code: 'session.identity_conflict', status: 403 }));
      expect(experienceInteraction.identifiedUserId).toBeUndefined();
    });

    it('forbids identifying another user than the subject', async () => {
      const { experienceInteraction, stepUpTenant } = createInteraction({
        details: { authenticationContext: stepUpContext },
      });
      const { libraries, queries } = stepUpTenant;
      const someoneElse = { ...mockUser, id: 'someone-else', username: 'someone-else' };

      // A password record for another account resolves to that account at identification.
      jest.mocked(queries.users.findUserByUsername).mockResolvedValueOnce(someoneElse);
      experienceInteraction.setVerificationRecord(
        new PasswordVerification(libraries, queries, {
          id: 'password-verification-id',
          type: VerificationType.Password,
          identifier: { type: SignInIdentifier.Username, value: someoneElse.username },
          verified: true,
        })
      );

      await expect(
        experienceInteraction.identifyUser('password-verification-id')
      ).rejects.toMatchError(new RequestError({ code: 'session.identity_conflict', status: 403 }));
      expect(experienceInteraction.identifiedUserId).toBeUndefined();
    });

    it('identifies the subject through a pinned-user password record without a sign-in method', async () => {
      const { experienceInteraction, stepUpTenant } = createInteraction({
        details: { authenticationContext: stepUpContext },
      });
      const { libraries, queries } = stepUpTenant;

      experienceInteraction.setVerificationRecord(
        new PasswordVerification(libraries, queries, {
          id: 'password-verification-id',
          type: VerificationType.Password,
          identifier: { type: AdditionalIdentifier.UserId, value: mockUserWithMfaVerifications.id },
          verified: true,
        })
      );

      await expect(
        experienceInteraction.identifyUser('password-verification-id')
      ).resolves.toBeUndefined();
      expect(experienceInteraction.identifiedUserId).toBe(mockUserWithMfaVerifications.id);
      expect(experienceInteraction.toJson().authenticationProofs).toEqual([
        expect.objectContaining({ factor: AuthenticationFactor.Password }),
      ]);
    });

    it('rejects switching a pure step-up away from sign-in', async () => {
      const { experienceInteraction } = createInteraction({
        details: { authenticationContext: stepUpContext },
      });

      await expect(
        experienceInteraction.setInteractionEvent(InteractionEvent.Register)
      ).rejects.toThrow(
        new RequestError({ code: 'session.step_up.invalid_interaction_event', status: 400 })
      );
      await expect(
        experienceInteraction.setInteractionEvent(InteractionEvent.SignIn)
      ).resolves.toBeUndefined();
    });

    it('stores a requested-only context without pinning', () => {
      const { experienceInteraction } = createInteraction({
        details: { authenticationContext: requestedOnlyContext },
        withoutSession: true,
      });

      expect(experienceInteraction.isStepUp).toBe(false);
      expect(experienceInteraction.identifiedUserId).toBeUndefined();
      expect(experienceInteraction.toJson().authenticationContext).toEqual(requestedOnlyContext);
    });

    it.each([
      { name: 'no context', details: {} },
      { name: 'unparsable context', details: { authenticationContext: { mode: 'stepUp' } } },
      { name: 'no details', details: undefined },
    ])('creates a plain sign-in with $name', ({ details }) => {
      const { experienceInteraction } = createInteraction({ details });
      const plain = new ExperienceInteraction(ctx, tenant, InteractionEvent.SignIn);

      expect(experienceInteraction.isStepUp).toBe(false);
      expect(experienceInteraction.identifiedUserId).toBeUndefined();
      expect(experienceInteraction.toJson()).toEqual(plain.toJson());
      expect(experienceInteraction.toJson()).not.toHaveProperty('authenticationContext');
    });

    it('ignores the prompt details when dev features are disabled', () => {
      setDevFeaturesEnabled(false);

      const { experienceInteraction } = createInteraction({
        details: { authenticationContext: stepUpContext },
      });

      expect(experienceInteraction.isStepUp).toBe(false);
      expect(experienceInteraction.identifiedUserId).toBeUndefined();
    });

    it('rejects a pure step-up with a non-sign-in event', () => {
      expect(() =>
        createInteraction({
          interactionEvent: InteractionEvent.Register,
          details: { authenticationContext: stepUpContext },
        })
      ).toThrow(
        new RequestError({ code: 'session.step_up.invalid_interaction_event', status: 400 })
      );
    });

    it('rejects a pure step-up without a session subject', () => {
      expect(() =>
        createInteraction({
          details: { authenticationContext: stepUpContext },
          withoutSession: true,
        })
      ).toThrow(new RequestError({ code: 'session.step_up.subject_not_found', status: 400 }));
    });

    it('keeps the mode and the pinned subject across the storage round-trip', () => {
      const { experienceInteraction, stepUpCtx, stepUpTenant } = createInteraction({
        details: { authenticationContext: stepUpContext },
      });
      const restored = new ExperienceInteraction(stepUpCtx, stepUpTenant, {
        ...stepUpCtx.interactionDetails,
        result: experienceInteraction.toJson(),
      } as unknown as Interaction);

      expect(restored.isStepUp).toBe(true);
      expect(restored.subjectUserId).toBe(mockUserWithMfaVerifications.id);
      expect(restored.identifiedUserId).toBeUndefined();
      expect(restored.toJson().authenticationContext).toEqual(stepUpContext);
    });

    it('exposes the computed context through the sanitized data', async () => {
      const { experienceInteraction } = createInteraction({
        details: { authenticationContext: stepUpContext },
        connectors: [{ type: ConnectorType.Email }],
      });

      await expect(experienceInteraction.toSanitizedJson()).resolves.toMatchObject({
        authenticationContext: {
          ...stepUpContext,
          availableMethods: [VerificationType.TOTP],
          establishableMethods: [],
          enrollableFactors: [],
          subjectProofConnectors: [],
          maskedIdentifiers: { email: '****@logto.io' },
        },
      });
    });

    it('exposes the requested-only context with nothing computed before identification', async () => {
      const { experienceInteraction } = createInteraction({
        details: { authenticationContext: requestedOnlyContext },
        withoutSession: true,
      });

      await expect(experienceInteraction.toSanitizedJson()).resolves.toMatchObject({
        authenticationContext: {
          ...requestedOnlyContext,
          availableMethods: [],
          maskedIdentifiers: {},
        },
      });
    });

    it('leaves the sanitized data of a plain interaction unchanged', async () => {
      const plain = new ExperienceInteraction(ctx, tenant, InteractionEvent.SignIn);

      await expect(plain.toSanitizedJson()).resolves.not.toHaveProperty('authenticationContext');
    });

    it('finishes an unreachable step-up as unmet and leaves a reachable one alone', async () => {
      const unreachable = createInteraction({
        details: { authenticationContext: stepUpContext },
        user: mockUser,
      });

      await expect(unreachable.experienceInteraction.finishUnreachableStepUp()).resolves.toBe(
        'redirectTo'
      );
      expect(unreachable.provider.interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ error: 'unmet_authentication_requirements' })
      );

      const reachable = createInteraction({ details: { authenticationContext: stepUpContext } });

      await expect(
        reachable.experienceInteraction.finishUnreachableStepUp()
      ).resolves.toBeUndefined();
      expect(reachable.provider.interactionResult).not.toHaveBeenCalled();

      const plain = createInteraction({ details: { authenticationContext: requestedOnlyContext } });

      await expect(plain.experienceInteraction.finishUnreachableStepUp()).resolves.toBeUndefined();
      expect(plain.provider.interactionResult).not.toHaveBeenCalled();
    });
  });

  describe('guardMfaVerificationStatus', () => {
    it('skips MFA verification check when sign-in passkey is already verified', async () => {
      const { libraries, queries } = tenant;
      const interactionDetails = {
        result: {
          interactionEvent: InteractionEvent.SignIn,
          userId: mockUserWithMfaVerifications.id,
        },
      } as unknown as Interaction;
      const experienceInteraction = new ExperienceInteraction(ctx, tenant, interactionDetails);

      experienceInteraction.setVerificationRecord(
        new SignInPasskeyVerification(libraries, queries, {
          id: 'mock-sign-in-passkey-verification-id',
          type: VerificationType.SignInPasskey,
          verified: true,
          userId: mockUserWithMfaVerifications.id,
        })
      );

      await expect(experienceInteraction.guardMfaVerificationStatus()).resolves.not.toThrow();
    });
  });
});

/* eslint-enable max-lines */
