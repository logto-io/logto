import { TemplateType } from '@logto/connector-kit';

import { mockEmailConnectorId, mockEmailConnectorConfig } from '#src/__mocks__/connectors-mock.js';
import { type MockEmailTemplatePayload } from '#src/__mocks__/email-templates.js';
import { sendEmailTestMessage } from '#src/api/connector.js';
import { EmailTemplatesApiTest } from '#src/helpers/email-templates.js';
import { readConnectorMessage } from '#src/helpers/index.js';
import { generateEmail } from '#src/utils.js';

describe('connector test message API with i18n email templates', () => {
  const emailTemplatesApi = new EmailTemplatesApiTest();
  const mockEmail = generateEmail();
  const mockEnTemplate: MockEmailTemplatePayload = {
    languageTag: 'en',
    templateType: TemplateType.Generic,
    details: {
      subject: 'Test template',
      content: 'Test value: {{code}}',
      contentType: 'text/html',
    },
  };
  const mockDeTemplate: MockEmailTemplatePayload = {
    ...mockEnTemplate,
    languageTag: 'de',
  };

  beforeAll(async () => {
    await emailTemplatesApi.create([mockEnTemplate, mockDeTemplate]);
  });

  afterAll(async () => {
    await emailTemplatesApi.cleanUp();
  });

  it('should read and use the i18n email template for test message', async () => {
    await expect(
      sendEmailTestMessage(mockEmailConnectorId, mockEmail, mockEmailConnectorConfig, 'de')
    ).resolves.not.toThrow();

    const { template } = await readConnectorMessage('Email');
    expect(template).toEqual(mockDeTemplate.details);
  });

  it('should fallback to the default language template if the i18n template is not found for the given language', async () => {
    await expect(
      sendEmailTestMessage(mockEmailConnectorId, mockEmail, mockEmailConnectorConfig, 'fr')
    ).resolves.not.toThrow();

    const { template } = await readConnectorMessage('Email');
    expect(template).toEqual(mockEnTemplate.details);
  });

  it('should fallback to the default template in connector configs if not i18n template is found', async () => {
    // Delete default language templates
    await emailTemplatesApi.deleteMany({
      languageTag: 'en',
      templateType: TemplateType.Generic,
    });

    await expect(
      sendEmailTestMessage(mockEmailConnectorId, mockEmail, mockEmailConnectorConfig, 'br')
    ).resolves.not.toThrow();

    const { template } = await readConnectorMessage('Email');
    expect(template).toEqual(
      mockEmailConnectorConfig.templates.find(({ usageType }) => usageType === TemplateType.Generic)
    );
  });
});
