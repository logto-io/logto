import {
  type CreateSamlSsoConnectorSigningKey,
  type SamlSsoConnectorSigningKey,
} from '@logto/schemas';

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

const insertInactiveSigningKey = jest.fn(async (data: SigningKeyInsert) => buildKey(data, false));
const insertActiveSigningKey = jest.fn(async (data: SigningKeyInsert) => buildKey(data, true));

const createLibrary = () =>
  createSamlSsoConnectorSigningKeyLibrary(
    new MockQueries({
      samlSsoConnectorSigningKeys: {
        insertInactiveSigningKey,
        insertActiveSigningKey,
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
});
