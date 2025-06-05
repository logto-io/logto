import { type Session } from 'oidc-provider';

import { MockQueries } from '#src/test-utils/tenant.js';

import { deleteSessionExtensions } from './session.js';

const { jest } = import.meta;
const deleteBySessionUid = jest.fn();
const queries = new MockQueries({
  oidcSessionExtensions: { deleteBySessionUid },
});

describe('deleteSessionExtensions()', () => {
  afterEach(() => {
    deleteBySessionUid.mockClear();
  });

  it('should call deleteBySessionUid with session uid', async () => {
    const session = { uid: 'sessionUid' } as unknown as Session;
    await deleteSessionExtensions(queries, session);
    expect(deleteBySessionUid).toHaveBeenCalledWith('sessionUid');
  });
});
