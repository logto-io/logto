import { TtlCache } from '@logto/shared';
import { createMockUtils } from '@logto/shared/esm';
import Sinon from 'sinon';

import { EnvSet } from '#src/env-set/index.js';
import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';

const { jest } = import.meta;

const { mockEsm, mockEsmWithActual } = createMockUtils(jest);

const mockFindSystemByKey = jest.fn();
const mockIsRequestInTestGroup = jest.fn().mockReturnValue(true);
const mockTtlCache = new TtlCache(60 * 60 * 1000); // 1 hour

mockEsm('#src/queries/system.js', () => ({
  createSystemsQuery: jest.fn(() => ({
    findSystemByKey: mockFindSystemByKey,
  })),
}));

mockEsm('#src/utils/feature-flag.js', () => ({
  isFeatureEnabledForEntity: mockIsRequestInTestGroup,
}));

await mockEsmWithActual('@logto/shared', () => ({
  TtlCache: jest.fn().mockImplementation(() => mockTtlCache),
}));

const { getExperiencePackageWithFeatureFlagDetection } = await import('./experience-proxy.js');

describe('experience proxy with feature flag detection test', () => {
  const envBackup = process.env;
  const _interaction = '12345678';

  beforeEach(() => {
    process.env = { ...envBackup };
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    mockTtlCache.clear();
  });

  const mockContext = createMockContext({
    url: '/sign-in',
    cookies: {
      _interaction,
    },
  });

  it('should return the new experience package if dev features are enabled', async () => {
    const stub = Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isDevFeaturesEnabled: true,
    });

    const result = await getExperiencePackageWithFeatureFlagDetection(mockContext);

    expect(result).toBe('experience');
    expect(mockFindSystemByKey).not.toBeCalled();
    expect(mockIsRequestInTestGroup).not.toBeCalled();

    stub.restore();
  });

  it('should return the legacy experience package if not in the cloud', async () => {
    const stub = Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isDevFeaturesEnabled: false,
      isCloud: false,
    });

    const result = await getExperiencePackageWithFeatureFlagDetection(mockContext);

    expect(result).toBe('experience-legacy');
    expect(mockFindSystemByKey).not.toBeCalled();
    expect(mockIsRequestInTestGroup).not.toBeCalled();

    stub.restore();
  });

  it('should return the legacy experience package if the session ID is not found', async () => {
    const stub = Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isDevFeaturesEnabled: false,
      isCloud: true,
    });

    const mockContextWithEmptyCookie = createMockContext({
      url: '/sign-in',
      cookies: {
        foo: 'bar',
      },
    });

    const result = await getExperiencePackageWithFeatureFlagDetection(mockContextWithEmptyCookie);
    expect(result).toBe('experience-legacy');
    expect(mockFindSystemByKey).not.toBeCalled();
    expect(mockIsRequestInTestGroup).not.toBeCalled();

    stub.restore();
  });

  it('should return 0% if no settings is found in the systems db', async () => {
    const stub = Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isDevFeaturesEnabled: false,
      isCloud: true,
    });

    mockFindSystemByKey.mockResolvedValueOnce(null);
    mockIsRequestInTestGroup.mockReturnValueOnce(false);

    const result = await getExperiencePackageWithFeatureFlagDetection(mockContext);
    expect(result).toBe('experience-legacy');
    expect(mockFindSystemByKey).toBeCalled();
    expect(mockIsRequestInTestGroup).toBeCalledWith({
      entityId: _interaction,
      rollOutPercentage: 0,
    });

    stub.restore();
  });

  it.each([{ foo: 'bar' }, { percentage: 90 }, { percentage: 1.5 }])(
    'should return 0% if the system settings is invalid: %p',
    async (percentage) => {
      const stub = Sinon.stub(EnvSet, 'values').value({
        ...EnvSet.values,
        isDevFeaturesEnabled: false,
        isCloud: true,
      });

      mockFindSystemByKey.mockResolvedValueOnce({ value: percentage });
      mockIsRequestInTestGroup.mockReturnValueOnce(false);

      const result = await getExperiencePackageWithFeatureFlagDetection(mockContext);
      expect(result).toBe('experience-legacy');
      expect(mockFindSystemByKey).toBeCalled();
      expect(mockIsRequestInTestGroup).toBeCalledWith({
        entityId: _interaction,
        rollOutPercentage: 0,
      });

      stub.restore();
    }
  );

  it('should get the package path based on the feature flag settings in the systems db', async () => {
    const stub = Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isDevFeaturesEnabled: false,
      isCloud: true,
    });

    mockFindSystemByKey.mockResolvedValueOnce({ value: { percentage: 0.5 } });
    mockIsRequestInTestGroup.mockReturnValueOnce(true);

    const result = await getExperiencePackageWithFeatureFlagDetection(mockContext);
    expect(result).toBe('experience');
    expect(mockFindSystemByKey).toBeCalled();
    expect(mockIsRequestInTestGroup).toBeCalledWith({
      entityId: _interaction,
      rollOutPercentage: 0.5,
    });

    stub.restore();
  });

  it('should get the package path based on the cached feature flag settings', async () => {
    const stub = Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isDevFeaturesEnabled: false,
      isCloud: true,
    });

    mockFindSystemByKey.mockResolvedValueOnce({ value: { percentage: 0.5 } });

    await getExperiencePackageWithFeatureFlagDetection(mockContext);
    await getExperiencePackageWithFeatureFlagDetection(mockContext);

    expect(mockFindSystemByKey).toBeCalledTimes(1);
    expect(mockIsRequestInTestGroup).toBeCalledTimes(2);
    expect(mockIsRequestInTestGroup).toBeCalledWith({
      entityId: _interaction,
      rollOutPercentage: 0.5,
    });

    stub.restore();
  });
});
