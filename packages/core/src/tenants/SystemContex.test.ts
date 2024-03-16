import { CloudflareKey, StorageProviderKey } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';
import { createMockPool } from '@silverhand/slonik';

import { mockHostnameProviderData, mockStorageProviderData } from '#src/__mocks__/system.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const pool = createMockPool({
  query: jest.fn(),
});

const findSystemByKey = jest.fn(async (key: string): Promise<unknown> => {
  if (key === StorageProviderKey.StorageProvider) {
    return { value: mockStorageProviderData };
  }

  if (key === CloudflareKey.HostnameProvider) {
    return { value: mockHostnameProviderData };
  }
});
mockEsm('#src/queries/system.js', () => ({
  createSystemsQuery: () => ({
    findSystemByKey,
  }),
}));

const SystemContext = await pickDefault(import('./SystemContext.js'));

describe('SystemContext', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should load loadProviderConfigs', async () => {
    await SystemContext.shared.loadProviderConfigs(pool);
    expect(SystemContext.shared.storageProviderConfig).toEqual(mockStorageProviderData);
    expect(SystemContext.shared.hostnameProviderConfig).toEqual(mockHostnameProviderData);
  });

  it('should ignore invalid value', async () => {
    findSystemByKey.mockResolvedValueOnce({ value: 'invalid' });
    await SystemContext.shared.loadProviderConfigs(pool);
    expect(SystemContext.shared.storageProviderConfig).toBeUndefined();
  });
});
