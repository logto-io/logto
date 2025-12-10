import nock from 'nock';

import { TemplateType } from '@logto/connector-kit';

import createConnector from './index.js';
import { fromEmail, mockedConfig, mockedGenericEmailParameters, toEmail } from './mock.js';

const getConfig = vi.fn();
// eslint-disable-next-line unicorn/no-useless-undefined
const getI18nEmailTemplate = vi.fn().mockResolvedValue(undefined);

const connector = await createConnector({ getConfig, getI18nEmailTemplate });

const nockMessages = (
  expectation: Record<string, unknown>,
  endpoint = 'https://api.sendgrid.com'
) =>
  nock(endpoint)
    .post('/v3/mail/send')
    .matchHeader('authorization', `Bearer ${mockedConfig.apiKey}`)
    .reply((_, body, callback) => {
      expect(body).toMatchObject(expectation);
      callback(null, [200, 'OK']);
    });

describe('SendGrid connector', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  it('should send generic email with default config', async () => {
    nockMessages(mockedGenericEmailParameters);

    getConfig.mockResolvedValue(mockedConfig);

    await connector.sendMessage({
      to: toEmail,
      type: TemplateType.Generic,
      payload: { code: '123456' },
    });
  });

  it('should fall back to generic template if usage-specific template not found', async () => {
    nockMessages(mockedGenericEmailParameters);
    getConfig.mockResolvedValue(mockedConfig);

    await connector.sendMessage({
      to: toEmail,
      type: TemplateType.BindMfa,
      payload: { code: '123456' },
    });
  });

  it('should throw error if required template (generic) is not found', async () => {
    // Remove generic template to force template not found error
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
    nockMessages({
      ...mockedGenericEmailParameters,
      subject: 'Organization invitation',
      content: [
        {
          type: 'text/plain',
          value: 'Your link is https://example.com',
        },
      ],
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

    nockMessages({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: fromEmail, name: 'Test app' },
      subject: 'Passcode 123456',
      content: [
        {
          type: 'text/html',
          value: '<p>Your passcode is 123456</p>',
        },
      ],
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
});
