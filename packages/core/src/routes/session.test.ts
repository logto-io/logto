import { Provider } from 'oidc-provider';

import { createRequester } from '@/utils/test-utils';

import sessionRoutes from './session';
import { AnonymousRouter } from './types';

const mockedProvider = Provider as jest.MockedClass<typeof Provider>;

describe('sessionRoutes', () => {
  const sessionRequest = createRequester<AnonymousRouter>(sessionRoutes);

  it('POST /session with consent prompt name', async () => {
    (
      mockedProvider.mock.instances[0]?.interactionDetails as unknown as jest.MockedFunction<
        () => Promise<{ prompt: { name: string } }>
      >
    ).mockResolvedValue({
      prompt: { name: 'consent' },
    });
    const response = await sessionRequest.post('/session');

    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('redirectTo', expect.stringContaining('/session/consent'));
  });

  it('POST /session with invalid prompt name', async () => {
    (
      mockedProvider.mock.instances[0]?.interactionDetails as unknown as jest.MockedFunction<
        () => Promise<{ prompt: { name: string } }>
      >
    ).mockResolvedValue({
      prompt: { name: 'invalid' },
    });
    await expect(sessionRequest.post('/session').send({})).resolves.toHaveProperty('status', 400);
  });
});
