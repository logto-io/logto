import { got } from 'got';
import nock from 'nock';

import { TemplateType } from '@logto/connector-kit';

import { emailEndpoint, usageEndpoint } from './constant.js';
import createConnector from './index.js';

const endpoint = 'http://localhost:3003';

const api = got.extend({ prefixUrl: endpoint });
const dropLeadingSlash = (path: string) => path.replace(/^\//, '');
const buildUrl = (path: string, endpoint: string) => new URL(`${endpoint}/api${path}`);

const getConfig = vi.fn().mockResolvedValue({});
const getCloudServiceClient = vi.fn().mockResolvedValue({
  post: async (path: string, payload: { body: unknown }) => {
    return api(dropLeadingSlash(path), {
      method: 'POST',
      json: payload.body,
    });
  },
  get: async (path: string, payload: { search: Record<string, string> }) => {
    return api(dropLeadingSlash(path), {
      method: 'GET',
      searchParams: payload.search,
    }).json<{ count: number }>();
  },
});

describe('sendMessage()', () => {
  it('should send message successfully', async () => {
    const url = buildUrl(emailEndpoint, endpoint);
    nock(url.origin).post(url.pathname).reply(204);
    const { sendMessage } = await createConnector({ getConfig, getCloudServiceClient });
    await expect(
      sendMessage({
        to: 'wangsijie94@gmail.com',
        type: TemplateType.SignIn,
        payload: { code: '1234' },
      })
    ).resolves.not.toThrow();
  });

  it('should get usage successfully', async () => {
    const date = new Date();
    const url = buildUrl(usageEndpoint, endpoint);
    nock(url.origin).get(url.pathname).query({ from: date.toISOString() }).reply(200, { count: 1 });
    const connector = await createConnector({ getConfig, getCloudServiceClient });
    expect(connector.getUsage).toBeDefined();
    const usage = await connector.getUsage!(date);
    expect(usage).toEqual(1);
  });
});
