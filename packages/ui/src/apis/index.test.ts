import ky from 'ky';

import { consent } from './consent';

jest.mock('ky', () => ({
  extend: () => ky,
  post: jest.fn(() => ({
    json: jest.fn(),
  })),
}));

describe('api', () => {
  const mockKyPost = ky.post as jest.Mock;

  afterEach(() => {
    mockKyPost.mockClear();
  });

  it('consent', async () => {
    await consent();
    expect(ky.post).toBeCalledWith('/api/interaction/consent');
  });
});
