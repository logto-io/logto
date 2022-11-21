import { SignInMode } from '@logto/schemas';
import {
  adminConsoleApplicationId,
  adminConsoleSignInExperience,
} from '@logto/schemas/lib/seeds/index.js';
import { Provider } from 'oidc-provider';

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
import * as signInExperienceQueries from '#src/queries/sign-in-experience.js';
import wellKnownRoutes from '#src/routes/well-known.js';
import { createRequester } from '#src/utils/test-utils.js';

const getLogtoConnectors = jest.fn(async () => [
  mockAliyunDmConnector,
  mockAliyunSmsConnector,
  mockFacebookConnector,
  mockGithubConnector,
  mockGoogleConnector,
  mockWechatConnector,
  mockWechatNativeConnector,
]);

jest.mock('#src/connectors.js', () => ({
  getLogtoConnectors: async () => getLogtoConnectors(),
}));

jest.mock('#src/queries/user.js', () => ({
  hasActiveUsers: jest.fn().mockResolvedValue(true),
}));

const interactionDetails: jest.MockedFunction<() => Promise<unknown>> = jest.fn(async () => ({
  params: {},
}));

jest.mock('oidc-provider', () => ({
  Provider: jest.fn(() => ({
    interactionDetails,
  })),
}));

jest.mock('i18next', () => ({
  t: (key: string) => key,
}));

describe('GET /.well-known/sign-in-exp', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const sessionRequest = createRequester({
    anonymousRoutes: wellKnownRoutes,
    provider: new Provider(''),
    middlewares: [
      async (ctx, next) => {
        ctx.addLogContext = jest.fn();
        ctx.log = jest.fn();

        return next();
      },
    ],
  });

  const signInExperienceQuerySpyOn = jest
    .spyOn(signInExperienceQueries, 'findDefaultSignInExperience')
    .mockResolvedValue(mockSignInExperience);

  it('should return github and facebook connector instances', async () => {
    const response = await sessionRequest.get('/.well-known/sign-in-exp');
    expect(signInExperienceQuerySpyOn).toHaveBeenCalledTimes(1);
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
    interactionDetails.mockResolvedValue({ params: { client_id: adminConsoleApplicationId } });
    const response = await sessionRequest.get('/.well-known/sign-in-exp');
    expect(response.status).toEqual(200);

    expect(response.body).toMatchObject({
      ...adminConsoleSignInExperience,
      branding: {
        ...adminConsoleSignInExperience.branding,
        slogan: 'admin_console.welcome.title',
      },
      languageInfo: mockSignInExperience.languageInfo,
      socialConnectors: [],
      signInMode: SignInMode.SignIn,
    });
  });
});
