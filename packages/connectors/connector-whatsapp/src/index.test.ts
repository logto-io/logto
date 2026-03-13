import nock from 'nock';

import { TemplateType, ConnectorErrorCodes } from '@logto/connector-kit';

import createConnector from './index.js';
import { mockedConfig } from './mock.js';

const getConfig = vi.fn().mockResolvedValue(mockedConfig);

const apiBase = 'https://graph.facebook.com';
const apiPath = `/v19.0/${mockedConfig.phoneNumberId}/messages`;

const mockSuccessResponse = () => {
  nock(apiBase)
    .post(apiPath)
    .reply(200, {
      messaging_product: 'whatsapp',
      contacts: [{ input: '+5491112345678', wa_id: '5491112345678' }],
      messages: [{ id: 'wamid.test123' }],
    });
};

afterEach(() => {
  nock.cleanAll();
});

describe('WhatsApp SMS connector', () => {
  it('init without throwing errors', async () => {
    await expect(createConnector({ getConfig })).resolves.not.toThrow();
  });

  describe('sendMessage', () => {
    it('sends a Generic message successfully', async () => {
      mockSuccessResponse();
      const connector = await createConnector({ getConfig });
      await expect(
        connector.sendMessage(
          { to: '+5491112345678', type: TemplateType.Generic, payload: { code: '123456' } },
          mockedConfig
        )
      ).resolves.not.toThrow();
    });

    it('sends a SignIn message successfully', async () => {
      mockSuccessResponse();
      const connector = await createConnector({ getConfig });
      await expect(
        connector.sendMessage(
          { to: '+5491112345678', type: TemplateType.SignIn, payload: { code: '654321' } },
          mockedConfig
        )
      ).resolves.not.toThrow();
    });

    it('sends a Register message successfully', async () => {
      mockSuccessResponse();
      const connector = await createConnector({ getConfig });
      await expect(
        connector.sendMessage(
          { to: '+5491112345678', type: TemplateType.Register, payload: { code: '111222' } },
          mockedConfig
        )
      ).resolves.not.toThrow();
    });

    it('sends a ForgotPassword message successfully', async () => {
      mockSuccessResponse();
      const connector = await createConnector({ getConfig });
      await expect(
        connector.sendMessage(
          { to: '+5491112345678', type: TemplateType.ForgotPassword, payload: { code: '333444' } },
          mockedConfig
        )
      ).resolves.not.toThrow();
    });

    it('falls back to Generic template when usage type not found', async () => {
      mockSuccessResponse();
      const connector = await createConnector({ getConfig });
      // Use a valid config but request a type that has no matching template name
      const configWithCustomTemplates = {
        ...mockedConfig,
        templates: [
          { usageType: 'Register', templateName: 'logto_register', language: 'en' },
          { usageType: 'SignIn', templateName: 'logto_sign_in', language: 'en' },
          { usageType: 'ForgotPassword', templateName: 'logto_forgot_password', language: 'en' },
          { usageType: 'Generic', templateName: 'logto_generic', language: 'en' },
        ],
      };
      // Pass an unknown type directly to bypass Zod validation; should fallback to Generic
      await expect(
        connector.sendMessage(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
          { to: '+5491112345678', type: 'UnknownType' as any, payload: { code: '123456' } },
          configWithCustomTemplates
        )
      ).resolves.not.toThrow();
    });

    it('throws ConnectorError with Meta error message on 401', async () => {
      nock(apiBase)
        .post(apiPath)
        .reply(401, {
          error: {
            message: 'Invalid OAuth access token',
            type: 'OAuthException',
            code: 190,
          },
        });

      const connector = await createConnector({ getConfig });
      await expect(
        connector.sendMessage(
          { to: '+5491112345678', type: TemplateType.Generic, payload: { code: '123456' } },
          mockedConfig
        )
      ).rejects.toMatchObject({ code: ConnectorErrorCodes.General });
    });

    it('throws ConnectorError on 500 server error', async () => {
      nock(apiBase).post(apiPath).reply(500, 'Internal Server Error');

      const connector = await createConnector({ getConfig });
      await expect(
        connector.sendMessage(
          { to: '+5491112345678', type: TemplateType.Generic, payload: { code: '123456' } },
          mockedConfig
        )
      ).rejects.toThrow();
    });
  });
});
