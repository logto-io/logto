import nock from 'nock';

import { TemplateType } from '@logto/connector-kit';

import createConnector from './index.js';
import { mockedConfig } from './mock.js';

const getConfig = vi.fn().mockResolvedValue(mockedConfig);

describe('HTTP SMS connector', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('should init without throwing errors', async () => {
    await expect(createConnector({ getConfig })).resolves.not.toThrow();
  });

  it('should call endpoint with correct parameters', async () => {
    const url = new URL(mockedConfig.endpoint);
    const mockPost = nock(url.origin)
      .post(url.pathname, (body) => {
        expect(body).toMatchObject({
          to: '+1234567890',
          type: TemplateType.SignIn,
          payload: {
            code: '123456',
          },
        });
        return true;
      })
      .reply(200, {
        message: 'SMS sent successfully',
      });

    const connector = await createConnector({ getConfig });
    await connector.sendMessage({
      to: '+1234567890',
      type: TemplateType.SignIn,
      payload: {
        code: '123456',
      },
    });

    expect(mockPost.isDone()).toBe(true);
  });

  it('should include IP address in request when provided', async () => {
    const url = new URL(mockedConfig.endpoint);
    const mockPost = nock(url.origin)
      .post(url.pathname, (body) => {
        expect(body).toMatchObject({
          to: '+1234567890',
          type: TemplateType.SignIn,
          payload: {
            code: '123456',
          },
          ip: '192.168.1.100',
        });
        return true;
      })
      .reply(200, {
        message: 'SMS sent successfully',
      });

    const connector = await createConnector({ getConfig });
    await connector.sendMessage({
      to: '+1234567890',
      type: TemplateType.SignIn,
      payload: {
        code: '123456',
      },
      ip: '192.168.1.100',
    });

    expect(mockPost.isDone()).toBe(true);
  });

  it('should not include IP field when IP is not provided', async () => {
    const url = new URL(mockedConfig.endpoint);
    const mockPost = nock(url.origin)
      .post(url.pathname, (body) => {
        expect(body).not.toHaveProperty('ip');
        return true;
      })
      .reply(200, {
        message: 'SMS sent successfully',
      });

    const connector = await createConnector({ getConfig });
    await connector.sendMessage({
      to: '+1234567890',
      type: TemplateType.SignIn,
      payload: {
        code: '123456',
      },
    });

    expect(mockPost.isDone()).toBe(true);
  });
});
