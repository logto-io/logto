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
import { invalidateWellKnownCache } from '#src/caches/well-known.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

mockEsm('i18next', () => ({
  default: {
    language: 'en',
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

const provider = createMockProvider();
const getLogtoConnectors = jest.fn(async () => {
  return [
    mockAliyunDmConnector,
    mockAliyunSmsConnector,
    mockFacebookConnector,
    mockGithubConnector,
    mockGoogleConnector,
    mockWechatConnector,
    mockWechatNativeConnector,
  ];
});
const tenantContext = new MockTenant(
  provider,
  {
    signInExperiences: sieQueries,
    users: { hasActiveUsers: jest.fn().mockResolvedValue(true) },
  },
  { getLogtoConnectors }
);

describe('GET /.well-known/sign-in-exp', () => {
  afterEach(async () => {
    await invalidateWellKnownCache(tenantContext.id);
    jest.clearAllMocks();
  });

  const sessionRequest = createRequester({
    anonymousRoutes: wellKnownRoutes,
    tenantContext,
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

  it('should use cache for continuous requests', async () => {
    const [response1, response2, response3] = await Promise.all([
      sessionRequest.get('/.well-known/sign-in-exp'),
      sessionRequest.get('/.well-known/sign-in-exp'),
      sessionRequest.get('/.well-known/sign-in-exp'),
    ]);
    expect(findDefaultSignInExperience).toHaveBeenCalledTimes(1);
    expect(getLogtoConnectors).toHaveBeenCalledTimes(1);
    expect(response1.body).toStrictEqual(response2.body);
    expect(response2.body).toStrictEqual(response3.body);
  });
});
