import RequestError from '#src/errors/RequestError/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import { assertFirstPartyClient } from './assert-first-party-client.js';

const { jest } = import.meta;

describe('assertFirstPartyClient', () => {
  const findApplicationById = jest.fn();
  const { queries } = new MockTenant(undefined, {
    applications: { findApplicationById },
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should pass for a first-party application', async () => {
    findApplicationById.mockResolvedValue({ id: 'app_id', isThirdParty: false });

    await expect(assertFirstPartyClient(queries, 'app_id')).resolves.toBeUndefined();
  });

  it('should reject a third-party application', async () => {
    findApplicationById.mockResolvedValue({ id: 'app_id', isThirdParty: true });

    await expect(assertFirstPartyClient(queries, 'app_id')).rejects.toMatchObject(
      new RequestError({ code: 'auth.third_party_application_forbidden', status: 403 })
    );
  });

  it('should pass for an application that is not in the database', async () => {
    findApplicationById.mockRejectedValue(new Error('not found'));

    await expect(assertFirstPartyClient(queries, 'demo_app')).resolves.toBeUndefined();
  });

  it('should pass without looking up anything when the client ID is absent', async () => {
    await expect(assertFirstPartyClient(queries)).resolves.toBeUndefined();
    expect(findApplicationById).not.toHaveBeenCalled();
  });
});
