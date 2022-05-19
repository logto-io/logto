import { ConnectorType } from '@logto/schemas';

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
import signInSettingsRoutes from '@/routes/sign-in-settings';
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

describe('GET /sign-in-settings', () => {
  const sessionRequest = createRequester({
    anonymousRoutes: signInSettingsRoutes,
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
    const response = await sessionRequest.get('/sign-in-settings');
    expect(signInExperienceQuerySpyOn).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject(
      expect.objectContaining({
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
      })
    );
  });
});
