import nock from 'nock';

import { TemplateType } from '@logto/connector-kit';

import createConnector, { signRequest } from './index.js';

const getConfig = vi.fn();
// eslint-disable-next-line unicorn/no-useless-undefined
const getI18nEmailTemplate = vi.fn().mockResolvedValue(undefined);

const connector = await createConnector({ getConfig, getI18nEmailTemplate });

// A base64 key, as ACS issues it.
const accessKey = Buffer.from('test-access-key').toString('base64');
const endpoint = 'https://logto-test.communication.azure.com';
const toEmail = 'foo@logto.io';

const mockedConfig = {
  endpoint,
  accessKey,
  fromEmail: 'DoNotReply@logto.test.io',
  templates: ['SignIn', 'Register', 'ForgotPassword', 'Generic'].map((usageType) => ({
    usageType,
    type: 'text/plain' as const,
    subject: `Logto ${usageType} Template`,
    content: 'Your Logto verification code is {{code}}.',
  })),
};

const nockSend = (expectation: Record<string, unknown>) =>
  nock(endpoint)
    .post('/emails:send')
    .query({ 'api-version': '2023-03-31' })
    .matchHeader(
      'authorization',
      /^HMAC-SHA256 SignedHeaders=x-ms-date;host;x-ms-content-sha256&Signature=.+$/
    )
    .matchHeader('x-ms-content-sha256', /.+/)
    .reply((_, body, callback) => {
      expect(body).toMatchObject(expectation);
      callback(null, [202, '']);
    });

describe('ACS Email connector', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  it('sends the generic template with the code and sender address', async () => {
    getConfig.mockResolvedValue(mockedConfig);
    nockSend({
      senderAddress: mockedConfig.fromEmail,
      recipients: { to: [{ address: toEmail }] },
      content: {
        subject: 'Logto Generic Template',
        plainText: 'Your Logto verification code is 123456.',
      },
    });

    await connector.sendMessage({
      to: toEmail,
      type: TemplateType.Generic,
      payload: { code: '123456' },
    });
  });

  it('falls back to the generic template when the usage-specific template is missing', async () => {
    getConfig.mockResolvedValue(mockedConfig);
    nockSend({ content: { subject: 'Logto Generic Template' } });

    await connector.sendMessage({
      to: toEmail,
      type: TemplateType.BindMfa,
      payload: { code: '123456' },
    });
  });

  it('throws when the required generic template is missing', async () => {
    getConfig.mockResolvedValue({
      ...mockedConfig,
      templates: mockedConfig.templates.filter((template) => template.usageType !== 'Generic'),
    });

    await expect(
      connector.sendMessage({ to: toEmail, type: TemplateType.Generic, payload: { code: '1' } })
    ).rejects.toThrow();
  });

  it('surfaces the ACS error body when the request is refused', async () => {
    getConfig.mockResolvedValue(mockedConfig);
    nock(endpoint).post('/emails:send').query(true).reply(400, '{"error":{"code":"BadRequest"}}');

    await expect(
      connector.sendMessage({ to: toEmail, type: TemplateType.Generic, payload: { code: '1' } })
    ).rejects.toThrow('BadRequest');
  });

  it('signs requests with the expected string to sign', () => {
    const url = new URL('/emails:send?api-version=2023-03-31', endpoint);
    const headers = signRequest({
      url,
      body: '{"a":1}',
      accessKey,
      date: new Date('2026-01-02T03:04:05Z'),
    });

    expect(headers['x-ms-date']).toBe('Fri, 02 Jan 2026 03:04:05 GMT');
    expect(headers['x-ms-content-sha256']).toBe('AVq9f1zFei3ZS3WQ8ErYCEJzkF7jPsXOvq5iJ2qX+GI=');
    expect(headers.Authorization).toMatch(
      /^HMAC-SHA256 SignedHeaders=x-ms-date;host;x-ms-content-sha256&Signature=/
    );
  });
});
