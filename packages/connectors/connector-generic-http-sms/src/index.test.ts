import nock from 'nock';

import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { vi } from 'vitest';

import createHttpSmsConnector from './index.js';
import { type HttpSmsConfig } from './types.js';

const mockTemplates = [
  { usageType: 'Register', content: 'Register: {{message}}' },
  { usageType: 'SignIn', content: 'Sign in: {{message}}' },
  { usageType: 'ForgotPassword', content: 'Forgot: {{message}}' },
  { usageType: 'Generic', content: 'Msg: {{message}}' },
];

const baseConfig: HttpSmsConfig = {
  endpoint: 'https://sms.example.com/send',
  method: 'POST',
  authorization: 'Bearer token',
  queryParams: { to: '{{recipient}}', message: '{{message}}' },
  bodyParams: { to: '{{recipient}}', text: '{{message}}' },
  headers: { 'X-Custom-Header': 'value' },
  templates: mockTemplates, // ✅ ensures Zod passes
};

describe('HTTP SMS Connector', () => {
  afterEach(() => {
    nock.cleanAll();
    vi.clearAllMocks();
  });

  const getConfig = vi.fn().mockResolvedValue(baseConfig);

  it('should init without throwing errors', async () => {
    await expect(createHttpSmsConnector({ getConfig })).resolves.not.toThrow();
  });

  it('should send GET request with correct params', async () => {
    const getConfigWithGet = vi.fn().mockResolvedValue({
      ...baseConfig,
      method: 'GET',
    });

    const url = new URL(baseConfig.endpoint);

    const mockGet = nock(url.origin)
      .get(url.pathname)
      .query({
        to: '+1234567890',
        message: 'Sign in: 123456',
      })
      .reply(200, { status: 'ok' });

    const connector = await createHttpSmsConnector({ getConfig: getConfigWithGet });

    await connector.sendMessage({
      to: '+1234567890',
      type: 'SignIn',
      payload: { message: '123456' },
    });

    expect(mockGet.isDone()).toBe(true);
  });

  it('should send POST request with correct body', async () => {
    const url = new URL(baseConfig.endpoint);

    const mockPost = nock(url.origin)
      .post(url.pathname, {
        to: '+1234567890',
        text: 'Sign in: 654321',
      })
      .reply(200, { status: 'ok' });

    const connector = await createHttpSmsConnector({ getConfig });

    await connector.sendMessage({
      to: '+1234567890',
      type: 'SignIn',
      payload: { message: '654321' },
    });

    expect(mockPost.isDone()).toBe(true);
  });

  it('should throw ConnectorError if template not found', async () => {
    const connector = await createHttpSmsConnector({ getConfig });

    await expect(
      connector.sendMessage({
        to: '+1234567890',
        type: 'SignUp',
        payload: { message: 'hi' },
      })
    ).rejects.toThrowError(
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        'Cannot find template for type: SignUp'
      )
    );
  });

  it('should throw ZodError if required templates missing', async () => {
    const badConfig = {
      ...baseConfig,
      templates: [{ usageType: 'SignIn', content: 'Sign in: {{message}}' }],
    };

    const getConfigBad = vi.fn().mockResolvedValue(badConfig);

    const connector = await createHttpSmsConnector({ getConfig: getConfigBad });

    await expect(
      connector.sendMessage({
        to: '+1234567890',
        type: 'SignIn',
        payload: { message: 'hi' },
      })
    ).rejects.toThrowError('ConnectorError: {"issues":[{"code":"custom","message":"Template(s) missing for usage type(s): Register, ForgotPassword, Generic","path":["templates","templates"]}],"name":"ZodError"}');
  });
});
