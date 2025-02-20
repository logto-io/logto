import { TemplateType } from '@logto/connector-kit';

import { mockEmailConnectorConfig } from '#src/__mocks__/connectors-mock.js';
import { type MockEmailTemplatePayload } from '#src/__mocks__/email-templates.js';
import { setEmailConnector } from '#src/helpers/connector.js';
import { EmailTemplatesApiTest } from '#src/helpers/email-templates.js';
import { readConnectorMessage } from '#src/helpers/index.js';
import { OrganizationApiTest, OrganizationInvitationApiTest } from '#src/helpers/organization.js';
import { devFeatureTest, generateEmail } from '#src/utils.js';

devFeatureTest.describe('organization invitation API with i18n email templates', () => {
  const emailTemplatesApi = new EmailTemplatesApiTest();
  const invitationApi = new OrganizationInvitationApiTest();
  const organizationApi = new OrganizationApiTest();

  const mockEmail = generateEmail();
  const mockEnTemplate: MockEmailTemplatePayload = {
    languageTag: 'en',
    templateType: TemplateType.OrganizationInvitation,
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
  const mockFrSignInTemplate: MockEmailTemplatePayload = {
    ...mockEnTemplate,
    languageTag: 'fr',
    templateType: TemplateType.SignIn,
  };

  beforeAll(async () => {
    await Promise.all([
      emailTemplatesApi.create([mockEnTemplate, mockDeTemplate, mockFrSignInTemplate]),
      setEmailConnector(),
    ]);
  });

  afterAll(async () => {
    await emailTemplatesApi.cleanUp();
  });

  afterEach(async () => {
    await Promise.all([organizationApi.cleanUp(), invitationApi.cleanUp()]);
  });

  it('should read and use the i18n email template for organization invitation', async () => {
    await setEmailConnector();

    const organization = await organizationApi.create({ name: 'test' });

    await invitationApi.create({
      organizationId: organization.id,
      invitee: mockEmail,
      expiresAt: Date.now() + 1_000_000,
      messagePayload: {
        locale: 'de',
        link: 'https://example.com',
      },
    });

    expect(await readConnectorMessage('Email')).toMatchObject({
      type: 'OrganizationInvitation',
      payload: {
        locale: 'de',
        link: 'https://example.com',
      },
      template: mockDeTemplate.details,
    });
  });

  it('should fallback to the default language template if the i18n template is not found for the given language', async () => {
    await setEmailConnector();

    const organization = await organizationApi.create({ name: 'test' });

    await invitationApi.create({
      organizationId: organization.id,
      invitee: mockEmail,
      expiresAt: Date.now() + 1_000_000,
      messagePayload: {
        locale: 'fr',
        link: 'https://example.com',
      },
    });

    expect(await readConnectorMessage('Email')).toMatchObject({
      type: 'OrganizationInvitation',
      payload: {
        locale: 'fr',
        link: 'https://example.com',
      },
      template: mockEnTemplate.details,
    });
  });

  it('should be able to resend the email after creating an invitation with a different language', async () => {
    await setEmailConnector();
    const organization = await organizationApi.create({ name: 'test' });

    const invitation = await invitationApi.create({
      organizationId: organization.id,
      invitee: mockEmail,
      expiresAt: Date.now() + 1_000_000,
      messagePayload: {
        locale: 'en',
        link: 'https://example.com',
      },
    });
    expect(await readConnectorMessage('Email')).toMatchObject({
      type: 'OrganizationInvitation',
      payload: {
        locale: 'en',
        link: 'https://example.com',
      },
      template: mockEnTemplate.details,
    });

    await invitationApi.resendMessage(invitation.id, {
      locale: 'de',
      link: 'https://example.com',
    });

    expect(await readConnectorMessage('Email')).toMatchObject({
      type: 'OrganizationInvitation',
      payload: {
        locale: 'de',
        link: 'https://example.com',
      },
      template: mockDeTemplate.details,
    });
  });

  it('should be able to fallback to the default template in connector configs if no i18n template is found', async () => {
    // Delete default language templates
    await emailTemplatesApi.deleteMany({
      languageTag: 'en',
    });

    const organization = await organizationApi.create({ name: 'test' });

    const invitation = await invitationApi.create({
      organizationId: organization.id,
      invitee: mockEmail,
      expiresAt: Date.now() + 1_000_000,
      messagePayload: {
        link: 'https://example.com',
      },
    });

    expect(await readConnectorMessage('Email')).toMatchObject({
      type: 'OrganizationInvitation',
      payload: {
        link: 'https://example.com',
      },
      template: mockEmailConnectorConfig.templates.find(
        ({ usageType }) => usageType === TemplateType.OrganizationInvitation
      ),
    });
  });
});
