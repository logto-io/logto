import {
  type CreateSamlSsoConnectorSigningKey,
  type SamlSsoConnectorSigningKey,
} from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';

import { MockQueries } from '#src/test-utils/tenant.js';
import { type OmitAutoSetFields } from '#src/utils/sql.js';

import { createSamlSsoConnectorSigningKeyLibrary } from './saml-sso-connector-signing-key.js';

const { jest } = import.meta;

const ssoConnectorId = 'sso-connector-id';

type SigningKeyInsert = Omit<OmitAutoSetFields<CreateSamlSsoConnectorSigningKey>, 'active'>;

const buildKey = (data: SigningKeyInsert, active: boolean): SamlSsoConnectorSigningKey => ({
  tenantId: 'tenant-id',
  createdAt: 1_700_000_000_000,
  active,
  ...data,
});

const mockActiveKey: SamlSsoConnectorSigningKey = {
  id: 'key-id',
  tenantId: 'tenant-id',
  ssoConnectorId,
  privateKey: 'private-key',
  certificate: 'certificate',
  createdAt: 1_700_000_000_000,
  expiresAt: 1_800_000_000_000,
  active: true,
};

const insertInactiveSigningKey = jest.fn(async (data: SigningKeyInsert) => buildKey(data, false));
const insertActiveSigningKey = jest.fn(async (data: SigningKeyInsert) => buildKey(data, true));
const findActiveSigningKeyBySsoConnectorId = jest.fn(
  async (): Promise<Nullable<SamlSsoConnectorSigningKey>> => null
);
const deleteSigningKeysBySsoConnectorId = jest.fn();

const createLibrary = () =>
  createSamlSsoConnectorSigningKeyLibrary(
    new MockQueries({
      samlSsoConnectorSigningKeys: {
        insertInactiveSigningKey,
        insertActiveSigningKey,
        findActiveSigningKeyBySsoConnectorId,
        deleteSigningKeysBySsoConnectorId,
      },
    })
  );

describe('createSamlSsoConnectorSigningKeyLibrary()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSigningKey()', () => {
    it('should generate a key pair and insert it as active', async () => {
      await createLibrary().createSigningKey({ ssoConnectorId, isActive: true });

      expect(insertActiveSigningKey).toHaveBeenCalledTimes(1);
      expect(insertInactiveSigningKey).not.toHaveBeenCalled();

      const [data] = insertActiveSigningKey.mock.calls[0]!;
      expect(data.ssoConnectorId).toBe(ssoConnectorId);
      expect(data.privateKey).toContain('PRIVATE KEY');
      expect(data.certificate).toContain('CERTIFICATE');
      expect(typeof data.id).toBe('string');
      // Certificate validity should be the default 3 years out (allow a wide tolerance for leap years / runtime).
      const threeYearsInMs = 3 * 365 * 24 * 60 * 60 * 1000;
      expect(data.expiresAt).toBeGreaterThan(Date.now() + threeYearsInMs - 2 * 24 * 60 * 60 * 1000);
      expect(data.expiresAt).toBeLessThan(Date.now() + threeYearsInMs + 2 * 24 * 60 * 60 * 1000);
    });

    it('should generate a key pair and insert it as inactive', async () => {
      await createLibrary().createSigningKey({ ssoConnectorId });

      expect(insertInactiveSigningKey).toHaveBeenCalledTimes(1);
      expect(insertActiveSigningKey).not.toHaveBeenCalled();
    });
  });

  describe('ensureActiveSigningKey()', () => {
    it('should reuse the existing active key', async () => {
      findActiveSigningKeyBySsoConnectorId.mockResolvedValueOnce(mockActiveKey);

      const result = await createLibrary().ensureActiveSigningKey(ssoConnectorId);

      expect(findActiveSigningKeyBySsoConnectorId).toHaveBeenCalledWith(ssoConnectorId);
      expect(result).toStrictEqual(mockActiveKey);
      expect(insertActiveSigningKey).not.toHaveBeenCalled();
      expect(insertInactiveSigningKey).not.toHaveBeenCalled();
    });

    it('should generate and insert an active key when none is active', async () => {
      const result = await createLibrary().ensureActiveSigningKey(ssoConnectorId);

      expect(findActiveSigningKeyBySsoConnectorId).toHaveBeenCalledWith(ssoConnectorId);
      expect(insertActiveSigningKey).toHaveBeenCalledTimes(1);
      expect(result.active).toBe(true);
      expect(result.ssoConnectorId).toBe(ssoConnectorId);
    });
  });

  describe('deleteSigningKeys()', () => {
    it('should delete all keys for the connector', async () => {
      await createLibrary().deleteSigningKeys(ssoConnectorId);

      expect(deleteSigningKeysBySsoConnectorId).toHaveBeenCalledWith(ssoConnectorId);
    });
  });
});
