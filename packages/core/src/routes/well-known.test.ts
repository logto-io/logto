import { ConnectorType, SignInMode } from '@logto/schemas';
import { adminConsoleApplicationId, adminConsoleSignInExperience } from '@logto/schemas/lib/seeds';
import { Provider } from 'oidc-provider';

import {
  mockAliyunDmConnectorInstance,
  mockAliyunSmsConnectorInstance,
  mockFacebookConnectorInstance,
  mockGithubConnectorInstance,
  mockGoogleConnectorInstance,
  mockSignInExperience,
  mockWechatConnectorInstance,
  mockWechatNativeConnectorInstance,
} from '@/__mocks__';
import { getConnectorInstanceById } from '@/connectors';
import RequestError from '@/errors/RequestError';
import * as signInExperienceQueries from '@/queries/sign-in-experience';
import wellKnownRoutes from '@/routes/well-known';
import { createRequester } from '@/utils/test-utils';

const getConnectorInstances = jest.fn(async () => [
  mockAliyunDmConnectorInstance,
  mockAliyunSmsConnectorInstance,
  mockFacebookConnectorInstance,
  mockGithubConnectorInstance,
  mockGoogleConnectorInstance,
  mockWechatConnectorInstance,
  mockWechatNativeConnectorInstance,
]);

jest.mock('@/connectors', () => ({
  getSocialConnectorInstanceById: async (connectorId: string) => {
    const connectorInstance = await getConnectorInstanceById(connectorId);

    if (connectorInstance.metadata.type !== ConnectorType.Social) {
      throw new RequestError({
        code: 'entity.not_found',
        status: 404,
      });
    }

    return connectorInstance;
  },
  getConnectorInstances: async () => getConnectorInstances(),
}));

jest.mock('@/queries/user', () => ({
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
          ...mockGithubConnectorInstance.metadata,
          id: mockGithubConnectorInstance.connector.id,
        },
        {
          ...mockFacebookConnectorInstance.metadata,
          id: mockFacebookConnectorInstance.connector.id,
        },
        {
          ...mockWechatConnectorInstance.metadata,
          id: mockWechatConnectorInstance.connector.id,
        },
        {
          ...mockWechatNativeConnectorInstance.metadata,
          id: mockWechatNativeConnectorInstance.connector.id,
        },
      ],
    });
  });

  it('should return admin console settings', async () => {
    interactionDetails.mockResolvedValue({ params: { client_id: adminConsoleApplicationId } });
    const response = await sessionRequest.get('/.well-known/sign-in-exp');
    expect(signInExperienceQuerySpyOn).not.toBeCalled();
    expect(response.status).toEqual(200);

    expect(response.body).toMatchObject({
      ...adminConsoleSignInExperience,
      branding: {
        ...adminConsoleSignInExperience.branding,
        slogan: 'admin_console.welcome.title',
      },
      socialConnectors: [],
      signInMode: SignInMode.SignIn,
    });
  });
});
