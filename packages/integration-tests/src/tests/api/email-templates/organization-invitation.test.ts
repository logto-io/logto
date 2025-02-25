import { type EmailTemplateDetails, TemplateType } from '@logto/connector-kit';

import { mockEmailConnectorConfig } from '#src/__mocks__/connectors-mock.js';
import { type MockEmailTemplatePayload } from '#src/__mocks__/email-templates.js';
import { setEmailConnector } from '#src/helpers/connector.js';
import { EmailTemplatesApiTest } from '#src/helpers/email-templates.js';
import { readConnectorMessage } from '#src/helpers/index.js';
import { OrganizationApiTest, OrganizationInvitationApiTest } from '#src/helpers/organization.js';
import { UserApiTest } from '#src/helpers/user.js';
import { generateEmail } from '#src/utils.js';

const mockEnTemplate: MockEmailTemplatePayload = {
  languageTag: 'en',
  templateType: TemplateType.OrganizationInvitation,
  details: {
    subject: 'Organization invitation',
    content: 'Click {{link}} to join the organization.',
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

describe('organization invitation API with i18n email templates', () => {
  const emailTemplatesApi = new EmailTemplatesApiTest();
  const invitationApi = new OrganizationInvitationApiTest();
  const organizationApi = new OrganizationApiTest();
  const useApi = new UserApiTest();

  const mockEmail = generateEmail();

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
    await Promise.all([organizationApi.cleanUp(), invitationApi.cleanUp(), useApi.cleanUp()]);
  });

  it('should read and use the i18n email template for organization invitation', async () => {
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

    await invitationApi.create({
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

  it('should render the template with the extra organization invitation context information', async () => {
    const organizationInvitationTemplate: EmailTemplateDetails = {
      subject: '{{inviter.name}} invite you to join {{organization.name}}',
      content:
        '<p>Click {{link}} to join the organization {{organization.name}}.<p><img src="{{organization.branding.logoUrl}}" />{{organization.invalid_field.foo}}',
      contentType: 'text/html',
    };

    const [organization, inviter] = await Promise.all([
      organizationApi.create({
        name: 'test org',
        branding: {
          logoUrl: 'https://example.com/logo.png',
        },
      }),
      useApi.create({ name: 'John Joe' }),
      emailTemplatesApi.create([
        {
          languageTag: 'en',
          templateType: TemplateType.OrganizationInvitation,
          details: organizationInvitationTemplate,
        },
      ]),
    ]);

    await invitationApi.create({
      organizationId: organization.id,
      invitee: mockEmail,
      inviterId: inviter.id,
      expiresAt: Date.now() + 1_000_000,
      messagePayload: {
        link: 'https://example.com',
      },
    });

    await expect(readConnectorMessage('Email')).resolves.toMatchObject({
      type: 'OrganizationInvitation',
      payload: {
        link: 'https://example.com',
        organization: {
          id: organization.id,
          name: 'test org',
          branding: {
            logoUrl: 'https://example.com/logo.png',
          },
        },
        inviter: {
          id: inviter.id,
          name: 'John Joe',
        },
      },
      template: organizationInvitationTemplate,
      subject: `John Joe invite you to join test org`,
      content: `<p>Click https://example.com to join the organization test org.<p><img src="https://example.com/logo.png" />`,
    });
  });
});
