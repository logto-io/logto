import nock from 'nock';

import { TemplateType } from '@logto/connector-kit';

import createMailgunConnector from './index.js';
import { type MailgunConfig } from './types.js';

const getConfig = vi.fn();

const domain = 'example.com';
const apiKey = 'apiKey';
const connector = await createMailgunConnector({
  getConfig,
});
const baseConfig: Partial<MailgunConfig> = {
  domain: 'example.com',
  apiKey: 'apiKey',
  from: 'foo@example.com',
};

/**
 * Nock helper to assert request auth and body.
 *
 * @param expectation - The expected request body.
 */
const nockMessages = (
  expectation: Record<string, string | string[] | undefined>,
  endpoint = 'https://api.mailgun.net'
) =>
  nock(endpoint)
    .post(`/v3/${domain}/messages`)
    .basicAuth({ user: 'api', pass: apiKey })
    .reply((_, body, callback) => {
      const params = new URLSearchParams(body);

      for (const [key, value] of Object.entries(expectation)) {
        if (Array.isArray(value)) {
          expect(value).toEqual(params.getAll(key));
        } else {
          expect(params.get(key)).toBe(value);
        }
      }

      callback(null, [200, 'OK']);
    });

describe('Maligun connector', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  it('should send email with raw data', async () => {
    nockMessages({
      from: baseConfig.from,
      to: 'bar@example.com',
      subject: 'Verification code is 123456',
      html: '<p>Your verification code is 123456</p>',
      'h:Reply-To': 'baz@example.com',
    });

    getConfig.mockResolvedValue({
      ...baseConfig,
      deliveries: {
        [TemplateType.Generic]: {
          subject: 'Verification code is {{code}}',
          html: '<p>Your verification code is {{code}}</p>',
          replyTo: 'baz@example.com',
        },
      },
    });

    await connector.sendMessage({
      to: 'bar@example.com',
      type: TemplateType.Generic,
      payload: { code: '123456' },
    });
  });

  it('should send email with raw data (2)', async () => {
    nockMessages({
      from: baseConfig.from,
      to: 'bar@example.com',
      subject: 'Organization invitation',
      html: '<p>Your link is https://example.com</p>',
      'h:Reply-To': 'baz@example.com',
    });

    getConfig.mockResolvedValue({
      ...baseConfig,
      deliveries: {
        [TemplateType.OrganizationInvitation]: {
          subject: 'Organization invitation',
          html: '<p>Your link is {{link}}</p>',
          replyTo: 'baz@example.com',
        },
      },
    });

    await connector.sendMessage({
      to: 'bar@example.com',
      type: TemplateType.OrganizationInvitation,
      payload: { link: 'https://example.com', code: '123456' },
    });
  });

  it('should send email with template', async () => {
    nockMessages({
      from: 'foo@example.com',
      to: 'bar@example.com',
      subject: 'Verification code is 123456',
      template: 'template',
      'h:X-Mailgun-Variables': JSON.stringify({ foo: 'bar', code: '123456' }),
    });

    getConfig.mockResolvedValue({
      ...baseConfig,
      deliveries: {
        [TemplateType.Generic]: {
          template: 'template',
          variables: { foo: 'bar' },
          subject: 'Verification code is {{code}}',
        },
      },
    });

    await connector.sendMessage({
      to: 'bar@example.com',
      type: TemplateType.Generic,
      payload: {
        code: '123456',
      },
    });
  });

  it('should send email with template and EU endpoint', async () => {
    nockMessages(
      {
        from: 'foo@example.com',
        to: 'bar@example.com',
        subject: 'Verification code is 123456',
        template: 'template',
        'h:X-Mailgun-Variables': JSON.stringify({ foo: 'bar', code: '123456' }),
      },
      'https://api.eu.mailgun.net'
    );

    getConfig.mockResolvedValue({
      ...baseConfig,
      endpoint: 'https://api.eu.mailgun.net',
      deliveries: {
        [TemplateType.Generic]: {
          template: 'template',
          variables: { foo: 'bar' },
          subject: 'Verification code is {{code}}',
        },
      },
    });

    await connector.sendMessage({
      to: 'bar@example.com',
      type: TemplateType.Generic,
      payload: {
        code: '123456',
      },
    });
  });

  it('should fall back to generic template if type not found', async () => {
    nockMessages({
      from: 'foo@example.com',
      to: 'bar@example.com',
      subject: 'Verification code is 123456',
      template: 'template',
      'h:X-Mailgun-Variables': JSON.stringify({ foo: 'bar', code: '123456' }),
    });

    getConfig.mockResolvedValue({
      ...baseConfig,
      deliveries: {
        [TemplateType.Generic]: {
          template: 'template',
          variables: { foo: 'bar' },
          subject: 'Verification code is {{code}}',
        },
      },
    });

    await connector.sendMessage({
      to: 'bar@example.com',
      type: TemplateType.ForgotPassword,
      payload: {
        code: '123456',
      },
    });
  });

  it('should throw error if template not found or type not supported', async () => {
    getConfig.mockResolvedValue({
      ...baseConfig,
      deliveries: {},
    });

    await expect(
      connector.sendMessage({
        to: '',
        type: TemplateType.Generic,
        payload: {
          code: '123456',
        },
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot('[Error: ConnectorError: template_not_found]');

    await expect(
      connector.sendMessage({
        to: '',
        // @ts-expect-error Invalid type
        type: 'foo',
        payload: {
          code: '123456',
        },
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot('[Error: ConnectorError: template_not_found]');
  });

  it('should throw error if mailgun returns error', async () => {
    getConfig.mockResolvedValue({
      ...baseConfig,
      deliveries: {
        [TemplateType.Generic]: {
          template: 'template',
          variables: { foo: 'bar' },
          subject: 'Verification code is {{code}}',
        },
      },
    });

    nock('https://api.mailgun.net').post(`/v3/${domain}/messages`).reply(400, { message: 'error' });

    await expect(
      connector.sendMessage({
        to: '',
        type: TemplateType.Generic,
        payload: {
          code: '123456',
        },
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      '[Error: ConnectorError: {"statusCode":400,"body":"{\\"message\\":\\"error\\"}"}]'
    );
  });
});
