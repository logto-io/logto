import { SlonikError } from '@silverhand/slonik';

import { DeletionError } from './index.js';

describe('SlonikError', () => {
  it('DeletionError', () => {
    const error = new DeletionError('user', 'foo');
    expect(error instanceof SlonikError).toEqual(true);
    expect(error.table).toEqual('user');
    expect(error.id).toEqual('foo');
  });
});
