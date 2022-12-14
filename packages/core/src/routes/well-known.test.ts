import { SignInMode } from '@logto/schemas';
import {
  adminConsoleApplicationId,
  adminConsoleSignInExperience,
} from '@logto/schemas/lib/seeds/index.js';
import { mockEsm, mockEsmWithActual, pickDefault } from '@logto/shared/esm';

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
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
await mockEsmWithActual('i18next', () => ({
  default: {
    t: (key: string) => key,
  },
}));

const { findDefaultSignInExperience } = mockEsm('#src/queries/sign-in-experience.js', () => ({
  updateDefaultSignInExperience: jest.fn(),
  findDefaultSignInExperience: jest.fn().mockResolvedValue(mockSignInExperience),
}));

await mockEsmWithActual('#src/queries/user.js', () => ({
  hasActiveUsers: jest.fn().mockResolvedValue(true),
}));

mockEsm('#src/connectors.js', () => ({
  getLogtoConnectors: jest.fn(async () => [
    mockAliyunDmConnector,
    mockAliyunSmsConnector,
    mockFacebookConnector,
    mockGithubConnector,
    mockGoogleConnector,
    mockWechatConnector,
    mockWechatNativeConnector,
  ]),
}));

const wellKnownRoutes = await pickDefault(import('#src/routes/well-known.js'));

describe('GET /.well-known/sign-in-exp', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const provider = createMockProvider();
  const sessionRequest = createRequester({
    anonymousRoutes: wellKnownRoutes,
    provider,
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
      // @ts-expect-error for testing
      .mockResolvedValue({ params: { client_id: adminConsoleApplicationId } });
    const response = await sessionRequest.get('/.well-known/sign-in-exp');
    expect(response.status).toEqual(200);

    expect(response.body).toMatchObject({
      ...adminConsoleSignInExperience,
      branding: {
        ...adminConsoleSignInExperience.branding,
        slogan: 'admin_console.welcome.title',
      },
      termsOfUseUrl: mockSignInExperience.termsOfUseUrl,
      languageInfo: mockSignInExperience.languageInfo,
      socialConnectors: [],
      signInMode: SignInMode.SignIn,
    });
  });
});
