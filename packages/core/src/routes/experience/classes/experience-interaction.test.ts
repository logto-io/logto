import { TemplateType } from '@logto/connector-kit';
import {
  adminConsoleApplicationId,
  adminTenantId,
  type CreateUser,
  InteractionEvent,
  SignInIdentifier,
  SignInMode,
  type User,
  VerificationType,
} from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import { mockUser } from '#src/__mocks__/user.js';
import { EnvSet } from '#src/env-set/index.js';
import { type InsertUserResult } from '#src/libraries/user.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { type Interaction, type WithHooksAndLogsContext } from '../types.js';

import { EmailCodeVerification } from './verifications/code-verification.js';

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

const ExperienceInteraction = await pickDefault(import('./experience-interaction.js'));

const createSignInInteraction = ({
  headers,
  interactionEvent = InteractionEvent.SignIn,
  adaptiveMfaEnabled = true,
}: {
  headers?: Record<string, string>;
  interactionEvent?: InteractionEvent;
  adaptiveMfaEnabled?: boolean;
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
    }),
  };
  const signInUserQueries = {
    ...userQueries,
    findUserById: jest.fn().mockResolvedValue(mockUser),
    updateUserById: jest.fn().mockResolvedValue(mockUser),
  };
  const signInTenant = new MockTenant(
    createMockProvider(),
    {
      users: signInUserQueries,
      signInExperiences: signInExperiencesWithAdaptiveMfa,
      userGeoLocations,
      userSignInCountries,
    },
    undefined,
    { users: userLibraries, ssoConnectors }
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
    assignInteractionHookResult: jest.fn(),
    appendDataHookContext: jest.fn(),
    appendExceptionHookContext: jest.fn(),
    ...baseContext,
    ...logContext,
  };
  const interactionDetails = {
    result: {
      interactionEvent,
      userId: mockUser.id,
    },
  } as unknown as Interaction;

  const experienceInteraction = new ExperienceInteraction(
    signInContext,
    signInTenant,
    interactionDetails
  );

  return { experienceInteraction, userGeoLocations, userSignInCountries };
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
    assignInteractionHookResult: jest.fn(),
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
    it('should skip geo context recording when dev features are disabled', async () => {
      setDevFeaturesEnabled(false);
      const { experienceInteraction, userGeoLocations, userSignInCountries } =
        createSignInInteraction();

      await experienceInteraction.submit();

      expect(userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
      expect(userSignInCountries.upsertUserSignInCountry).not.toHaveBeenCalled();
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

    it('should skip invalid country codes but record coordinates', async () => {
      setDevFeaturesEnabled(true);
      const { experienceInteraction, userGeoLocations, userSignInCountries } =
        createSignInInteraction({
          headers: {
            'x-logto-cf-country': 'USA',
            'x-logto-cf-latitude': '37.7749',
            'x-logto-cf-longitude': '-122.4194',
          },
        });

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

    it('should skip recording when adaptive MFA is disabled', async () => {
      setDevFeaturesEnabled(true);
      const { experienceInteraction, userGeoLocations, userSignInCountries } =
        createSignInInteraction({ adaptiveMfaEnabled: false });

      await experienceInteraction.submit();

      expect(userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
      expect(userSignInCountries.upsertUserSignInCountry).not.toHaveBeenCalled();
    });

    it('should skip recording for non-sign-in interactions', async () => {
      setDevFeaturesEnabled(true);
      const { experienceInteraction, userGeoLocations, userSignInCountries } =
        createSignInInteraction({ interactionEvent: InteractionEvent.Register });

      await experienceInteraction.submit();

      expect(userGeoLocations.upsertUserGeoLocation).not.toHaveBeenCalled();
      expect(userSignInCountries.upsertUserSignInCountry).not.toHaveBeenCalled();
    });
  });
});
