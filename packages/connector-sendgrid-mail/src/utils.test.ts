import got from 'got';

import { mockedApiKey, mockedParameters } from './mock';
import { Content, Personalization } from './types';
import { request } from './utils';

jest.mock('got');

describe('request', () => {
  it('should call axios.post with extended params', async () => {
    await request(mockedParameters, mockedApiKey);
    const calledData = (got.post as jest.MockedFunction<typeof got.post>).mock.calls[0];
    expect(calledData).not.toBeUndefined();
    const payload = calledData?.[0].json as Record<string, unknown>;
    expect(payload.personalizations).toHaveLength(1);
    const personalization = payload.personalizations as Personalization[];
    expect(personalization[0]).toMatchObject(
      expect.objectContaining({ to: { email: 'foo@logto.io' } })
    );
    expect(payload.from).toMatchObject(
      expect.objectContaining({ email: 'noreply@logto.test.io', name: 'Logto Test' })
    );
    expect(payload.content).toHaveLength(1);
    const content = payload.content as Content[];
    expect(content[0]).toMatchObject(
      expect.objectContaining({ type: 'text/plain', value: 'This is a test template.' })
    );
    expect(payload.subject).toEqual('Test SendGrid Mail');
  });
});
