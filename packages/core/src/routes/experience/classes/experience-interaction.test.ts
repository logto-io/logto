/* eslint-disable max-lines */
import { TemplateType } from '@logto/connector-kit';
import {
  adminConsoleApplicationId,
  adminTenantId,
  type CreateUser,
  InteractionEvent,
  LogtoActionKey,
  type JwtCustomizerUserContext,
  type SignInExperience,
  SignInIdentifier,
  SignInMode,
  type User,
  VerificationType,
} from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';

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
import { SignInPasskeyVerification } from './verifications/web-authn-verification.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

mockEsm('#src/utils/tenant.js', () => ({
  getTenantId: () => [adminTenantId],
}));

const mockEmail = 'foo@bar.com';
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
    updateUserById: jest.fn().mockResolvedValue(user),
  };
  const runActionHandler = jest.fn(
    async (_input: { event: unknown; key: LogtoActionKey }): Promise<unknown> => undefined
  );
  const runAction = jest.fn(
    async <Event>(
      input: { key: LogtoActionKey } & ({ event: Event } | { getEvent: () => Promise<Event> })
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
  // @ts-expect-error --mock test context
  const signInContext: WithHooksAndLogsContext = {
    assignReleaseOnSuccessInteractionHookResult: jest.fn(),
    assignReleaseAnywayInteractionHookResult: jest.fn(),
    appendDataHookContext: jest.fn(),
    appendExceptionHookContext: jest.fn(),
    ...baseContext,
    ...logContext,
  };
  const interactionDetails = {
    result: {
      interactionEvent,
      userId: user.id,
      ...interactionResult,
    },
  } as unknown as Interaction;

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

      expect(userLibraries.provisionOrganizations).toHaveBeenCalledWith({
        userId: 'uid',
        email: mockEmail,
      });
    });
  });

  describe('sign-in submission', () => {
    it('runs PostSignIn action before provider interaction result', async () => {
      const { experienceInteraction, provider, runAction, runActionHandler, getUserContext } =
        createSignInInteraction();

      await experienceInteraction.submit();

      expect(getUserContext).toHaveBeenCalledWith(mockUser.id);
      const [runActionInput] = runAction.mock.calls[0]!;
      expect(runActionInput).toMatchObject({ key: LogtoActionKey.PostSignIn });
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

    it('does not run PostSignIn action when dev features are disabled', async () => {
      setDevFeaturesEnabled(false);
      const { experienceInteraction, runAction, getUserContext } = createSignInInteraction();

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
