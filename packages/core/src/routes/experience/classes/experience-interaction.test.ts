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
import { type InsertUserResult } from '#src/libraries/user.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { type WithHooksAndLogsContext } from '../types.js';

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
  hasUserWithPhone: jest.fn().mockResolvedValue(false),
  hasUserWithIdentity: jest.fn().mockResolvedValue(false),
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

describe('ExperienceInteraction class', () => {
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
    interactionEvent: InteractionEvent.Register,
    verified: true,
  });

  beforeAll(() => {
    jest.clearAllMocks();
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
        ['user', 'default:admin']
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
});
