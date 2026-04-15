import nock from 'nock';

import { ConnectorError, TemplateType } from '@logto/connector-kit';

import createConnector from './index.js';
import { mockedConfig, mockedGenericEmailParameters, toEmail } from './mock.js';

const getConfig = vi.fn();
const getI18nEmailTemplate = vi.fn().mockResolvedValue(null);

const connector = await createConnector({ getConfig, getI18nEmailTemplate });

const apiOrigin = 'https://mailjunky.ai';

const parseBody = (body: unknown): Record<string, unknown> => {
  if (typeof body === 'string') {
    return JSON.parse(body) as Record<string, unknown>;
  }

  if (Buffer.isBuffer(body)) {
    return JSON.parse(body.toString()) as Record<string, unknown>;
  }

  return body as Record<string, unknown>;
};

const nockSend = (expected: Record<string, unknown>) =>
  nock(apiOrigin)
    .post('/api/v1/emails/send')
    .matchHeader('authorization', `Bearer ${mockedConfig.apiKey}`)
    .reply((_, body, callback) => {
      expect(parseBody(body)).toMatchObject(expected);
      callback(null, [200, 'OK']);
    });

describe('MailJunky connector', () => {
  beforeEach(() => {
    nock.cleanAll();
    getI18nEmailTemplate.mockResolvedValue(null);
  });

  it('should send generic email with default config', async () => {
    nockSend(mockedGenericEmailParameters);

    getConfig.mockResolvedValue(mockedConfig);

    await connector.sendMessage({
      to: toEmail,
      type: TemplateType.Generic,
      payload: { code: '123456' },
    });
  });

  it('should fall back to generic template if usage-specific template not found', async () => {
    nockSend(mockedGenericEmailParameters);
    getConfig.mockResolvedValue(mockedConfig);

    await connector.sendMessage({
      to: toEmail,
      type: TemplateType.BindMfa,
      payload: { code: '123456' },
    });
  });

  it('should throw error if required template (generic) is not found', async () => {
    getConfig.mockResolvedValue({
      ...mockedConfig,
      templates: mockedConfig.templates.filter(
        (template) => template.usageType !== TemplateType.Generic
      ),
    });

    await expect(
      connector.sendMessage({
        to: toEmail,
        type: TemplateType.OrganizationInvitation,
        payload: { link: 'https://example.com' },
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      '[Error: ConnectorError: {"issues":[{"code":"custom","message":"Template with UsageType (Generic) should be provided!","path":["templates"]}],"name":"ZodError"}]'
    );
  });

  it('should send organization invitation email with default config', async () => {
    nockSend({
      from: mockedGenericEmailParameters.from,
      to: mockedGenericEmailParameters.to,
      subject: 'Organization invitation',
      text: 'Your link is https://example.com',
    });

    getConfig.mockResolvedValue({
      ...mockedConfig,
      templates: [
        ...mockedConfig.templates,
        {
          usageType: 'OrganizationInvitation',
          type: 'text/plain',
          subject: 'Organization invitation',
          content: 'Your link is {{link}}',
        },
      ],
    });

    await connector.sendMessage({
      to: toEmail,
      type: TemplateType.OrganizationInvitation,
      payload: { link: 'https://example.com' },
    });
  });

  it('should send email with custom i18n template', async () => {
    getI18nEmailTemplate.mockResolvedValue({
      subject: 'Passcode {{code}}',
      content: '<p>Your passcode is {{code}}</p>',
      contentType: 'text/html',
      sendFrom: '{{application.name}}',
    });

    nockSend({
      from: `Test app <${mockedConfig.fromEmail}>`,
      to: toEmail,
      subject: 'Passcode 123456',
      html: '<p>Your passcode is 123456</p>',
      text: 'Your passcode is 123456',
    });

    getConfig.mockResolvedValue(mockedConfig);

    await connector.sendMessage({
      to: toEmail,
      type: TemplateType.Generic,
      payload: {
        code: '123456',
        application: { name: 'Test app' },
      },
    });
  });

  it('should send plain-text email when custom template contentType is text/plain', async () => {
    getI18nEmailTemplate.mockResolvedValue({
      subject: 'Plain {{code}}',
      content: 'Your code is {{code}}',
      contentType: 'text/plain',
      sendFrom: 'Plain Sender',
    });

    nockSend({
      from: `Plain Sender <${mockedConfig.fromEmail}>`,
      to: toEmail,
      subject: 'Plain 123456',
      text: 'Your code is 123456',
    });

    getConfig.mockResolvedValue(mockedConfig);

    await connector.sendMessage({
      to: toEmail,
      type: TemplateType.Generic,
      payload: { code: '123456' },
    });
  });

  it('should derive safe plain-text from malformed HTML', async () => {
    getI18nEmailTemplate.mockResolvedValue({
      subject: 'Malformed',
      content: 'Hello <script',
      contentType: 'text/html',
      sendFrom: 'Sender',
    });

    nockSend({
      from: `Sender <${mockedConfig.fromEmail}>`,
      to: toEmail,
      subject: 'Malformed',
      html: 'Hello <script',
      text: 'Hello script',
    });

    getConfig.mockResolvedValue(mockedConfig);

    await connector.sendMessage({
      to: toEmail,
      type: TemplateType.Generic,
      payload: {},
    });
  });

  it('should throw when MailJunky returns HTTP error', async () => {
    nock(apiOrigin).post('/api/v1/emails/send').reply(400, { message: 'bad request' });

    getConfig.mockResolvedValue(mockedConfig);

    await expect(
      connector.sendMessage({
        to: toEmail,
        type: TemplateType.Generic,
        payload: { code: '123456' },
      })
    ).rejects.toThrow(ConnectorError);
  });
});
