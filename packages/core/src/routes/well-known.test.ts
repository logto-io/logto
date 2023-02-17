import {
  SignInMode,
  adminConsoleApplicationId,
  adminConsoleSignInExperience,
} from '@logto/schemas';
import { pickDefault, createMockUtils } from '@logto/shared/esm';

import {
  mockAliyunDmConnector,
  mockAliyunSmsConnector,
  mockFacebookConnector,
  mockGithubConnector,
  mockGoogleConnector,
  mockSignInExperience,
  mockWechatConnector,
  mockWechatNativeConnector,
} from '#src/__mocks__/index.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

await mockEsmWithActual('i18next', () => ({
  default: {
    t: (key: string) => key,
  },
}));

const sieQueries = {
  updateDefaultSignInExperience: jest.fn(),
  findDefaultSignInExperience: jest.fn().mockResolvedValue(mockSignInExperience),
};
const { findDefaultSignInExperience } = sieQueries;

const wellKnownRoutes = await pickDefault(import('#src/routes/well-known.js'));
const { createMockProvider } = await import('#src/test-utils/oidc-provider.js');
const { MockTenant } = await import('#src/test-utils/tenant.js');
const { createRequester } = await import('#src/utils/test-utils.js');

describe('GET /.well-known/sign-in-exp', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const provider = createMockProvider();
  const sessionRequest = createRequester({
    anonymousRoutes: wellKnownRoutes,
    tenantContext: new MockTenant(
      provider,
      {
        signInExperiences: sieQueries,
        users: { hasActiveUsers: jest.fn().mockResolvedValue(true) },
      },
      {
        connectors: {
          getLogtoConnectors: jest.fn(async () => [
            mockAliyunDmConnector,
            mockAliyunSmsConnector,
            mockFacebookConnector,
            mockGithubConnector,
            mockGoogleConnector,
            mockWechatConnector,
            mockWechatNativeConnector,
          ]),
        },
      }
    ),
    middlewares: [
      async (ctx, next) => {
        ctx.addLogContext = jest.fn();
        ctx.log = jest.fn();

        return next();
      },
    ],
  });

  it('should return github and facebook connector instances', async () => {
    const response = await sessionRequest.get('/.well-known/sign-in-exp');
    expect(findDefaultSignInExperience).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      ...mockSignInExperience,
      socialConnectors: [
        {
          ...mockGithubConnector.metadata,
          id: mockGithubConnector.dbEntry.id,
        },
        {
          ...mockFacebookConnector.metadata,
          id: mockFacebookConnector.dbEntry.id,
        },
        {
          ...mockWechatConnector.metadata,
          id: mockWechatConnector.dbEntry.id,
        },
        {
          ...mockWechatNativeConnector.metadata,
          id: mockWechatNativeConnector.dbEntry.id,
        },
      ],
    });
  });

  it('should return admin console settings', async () => {
    jest
      .spyOn(provider, 'interactionDetails')
      // @ts-expect-error
      .mockResolvedValue({ params: { client_id: adminConsoleApplicationId } });
    const response = await sessionRequest.get('/.well-known/sign-in-exp');
    expect(response.status).toEqual(200);

    expect(response.body).toMatchObject({
      ...adminConsoleSignInExperience,
      tenantId: 'admin',
      branding: {
        ...adminConsoleSignInExperience.branding,
        slogan: 'admin_console.welcome.title',
      },
      termsOfUseUrl: null,
      languageInfo: mockSignInExperience.languageInfo,
      socialConnectors: [],
      signInMode: SignInMode.SignIn,
    });
  });
});
