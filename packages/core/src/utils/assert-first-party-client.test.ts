import { accountCenterApplicationId } from '@logto/schemas';

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

  it('should pass for a built-in application without looking up anything', async () => {
    await expect(
      assertFirstPartyClient(queries, accountCenterApplicationId)
    ).resolves.toBeUndefined();
    expect(findApplicationById).not.toHaveBeenCalled();
  });

  it('should reject an application that cannot be resolved', async () => {
    findApplicationById.mockRejectedValue(new Error('not found'));

    await expect(assertFirstPartyClient(queries, 'unknown_app')).rejects.toMatchObject(
      new RequestError({ code: 'auth.third_party_application_forbidden', status: 403 })
    );
  });

  it('should reject a CIMD client identifier', async () => {
    await expect(
      assertFirstPartyClient(queries, 'https://client.example.com/metadata.json')
    ).rejects.toMatchObject(
      new RequestError({ code: 'auth.third_party_application_forbidden', status: 403 })
    );
    expect(findApplicationById).not.toHaveBeenCalled();
  });

  it('should pass without looking up anything when the client ID is absent', async () => {
    await expect(assertFirstPartyClient(queries)).resolves.toBeUndefined();
    expect(findApplicationById).not.toHaveBeenCalled();
  });
});
