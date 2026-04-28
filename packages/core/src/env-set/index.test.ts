import { LogtoOidcConfigKey, OidcSigningKeyStatus } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

type MockPool = {
  end: jest.Mock;
  transaction: jest.Mock;
};

const createMockPool = (): MockPool => {
  const mockPool: MockPool = {
    end: jest.fn(),
    transaction: jest.fn(),
  };

  mockPool.transaction.mockImplementation(
    async (handler: (connection: MockPool) => Promise<unknown>) => handler(mockPool)
  );

  return mockPool;
};

const mockPool = createMockPool();
const mockCreatePoolByEnv = jest.fn(async () => mockPool);
const mockGetSigningKeyRotationState = jest.fn();
const mockLockPrivateSigningKeys = jest.fn();
const mockGetPrivateSigningKeys = jest.fn();
const mockUpsertPrivateSigningKeys = jest.fn();
const mockGetOidcConfigs = jest.fn();
const mockPromoteScheduledSigningKeyRotation = jest.fn();
const mockLoadOidcValues = jest.fn(async () => ({ issuer: 'https://tenant.example.com/oidc' }));

mockEsm('./create-pool.js', () => ({
  default: mockCreatePoolByEnv,
}));

mockEsm('#src/queries/logto-config.js', () => ({
  createLogtoConfigQueries: jest.fn(() => ({
    getSigningKeyRotationState: mockGetSigningKeyRotationState,
    lockPrivateSigningKeys: mockLockPrivateSigningKeys,
    getPrivateSigningKeys: mockGetPrivateSigningKeys,
    upsertPrivateSigningKeys: mockUpsertPrivateSigningKeys,
  })),
}));

mockEsm('#src/libraries/logto-config.js', () => ({
  createLogtoConfigLibrary: jest.fn(() => ({
    getOidcConfigs: mockGetOidcConfigs,
    promoteScheduledSigningKeyRotation: mockPromoteScheduledSigningKeyRotation,
  })),
}));

mockEsm('./oidc.js', () => ({
  default: mockLoadOidcValues,
}));

const { EnvSet } = await import('./index.js');

const createPrivateKey = (id: string, createdAt: number, status: OidcSigningKeyStatus) => ({
  id,
  value: `private-key-${id}`,
  createdAt,
  status,
});

describe('EnvSet.load()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('promotes a due staged signing key before loading OIDC configs', async () => {
    mockPromoteScheduledSigningKeyRotation.mockImplementationOnce(async () => {
      await Promise.resolve();
    });
    mockGetOidcConfigs.mockImplementationOnce(async () => {
      return {
        [LogtoOidcConfigKey.PrivateKeys]: [
          createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
        ],
        [LogtoOidcConfigKey.CookieKeys]: [],
        [LogtoOidcConfigKey.Session]: {},
      };
    });

    const envSet = new EnvSet('tenant-id', 'postgres://tenant.db');
    await envSet.load('https://tenant.example.com');

    const promoteCallOrder = mockPromoteScheduledSigningKeyRotation.mock.invocationCallOrder[0];
    const getConfigsCallOrder = mockGetOidcConfigs.mock.invocationCallOrder[0];

    expect(promoteCallOrder).toBeDefined();
    expect(getConfigsCallOrder).toBeDefined();
    expect(promoteCallOrder!).toBeLessThan(getConfigsCallOrder!);
    expect(mockPromoteScheduledSigningKeyRotation).toHaveBeenCalledTimes(1);
    expect(mockLoadOidcValues).toHaveBeenCalledTimes(1);
  });

  it('skips promotion when the staged signing key is not due yet', async () => {
    mockPromoteScheduledSigningKeyRotation.mockImplementationOnce(async () => {
      await Promise.resolve();
    });
    mockGetOidcConfigs.mockResolvedValueOnce({
      [LogtoOidcConfigKey.PrivateKeys]: [
        createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
      ],
      [LogtoOidcConfigKey.CookieKeys]: [],
      [LogtoOidcConfigKey.Session]: {},
    });

    const envSet = new EnvSet('tenant-id', 'postgres://tenant.db');
    await envSet.load('https://tenant.example.com');

    expect(mockPromoteScheduledSigningKeyRotation).toHaveBeenCalledTimes(1);
    expect(mockLoadOidcValues).toHaveBeenCalledTimes(1);
  });
});
