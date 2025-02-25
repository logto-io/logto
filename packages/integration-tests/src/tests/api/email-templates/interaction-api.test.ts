import { TemplateType } from '@logto/connector-kit';
import { demoAppApplicationId, InteractionEvent } from '@logto/schemas';

import { mockEmailConnectorConfig } from '#src/__mocks__/connectors-mock.js';
import { type MockEmailTemplatePayload } from '#src/__mocks__/email-templates.js';
import { putInteraction, sendVerificationCode } from '#src/api/interaction.js';
import { initClient } from '#src/helpers/client.js';
import { setEmailConnector, setSmsConnector } from '#src/helpers/connector.js';
import { EmailTemplatesApiTest } from '#src/helpers/email-templates.js';
import { readConnectorMessage } from '#src/helpers/index.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import { enableAllVerificationCodeSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateEmail } from '#src/utils.js';

const mockSignInTemplate: MockEmailTemplatePayload = {
  languageTag: 'en',
  templateType: TemplateType.SignIn,
  details: {
    subject: 'Sign in to {{ application.name }}, {{ organization.name }}',
    content: 'Your verification code is: {{code}}',
    contentType: 'text/html',
  },
};

describe('interaction API with i18n email templates', () => {
  const emailTemplatesApi = new EmailTemplatesApiTest();
  const organizationApi = new OrganizationApiTest();
  const mockEmail = generateEmail();

  beforeAll(async () => {
    await Promise.all([setEmailConnector(), setSmsConnector()]);
    await Promise.all([
      emailTemplatesApi.create([mockSignInTemplate]),
      enableAllVerificationCodeSignInMethods(),
    ]);
  });

  afterAll(async () => {
    await Promise.all([emailTemplatesApi.cleanUp(), organizationApi.cleanUp()]);
  });

  it('should send verification code using custom i18n template', async () => {
    const organization = await organizationApi.create({
      name: 'test org',
    });

    const client = await initClient(undefined, undefined, {
      extraParams: {
        organization_id: organization.id,
      },
    });

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(sendVerificationCode, {
      email: mockEmail,
    });

    expect(await readConnectorMessage('Email')).toMatchObject({
      type: TemplateType.SignIn,
      payload: {
        application: {
          id: demoAppApplicationId,
          name: 'Live Preview',
        },
        organization: {
          id: organization.id,
          name: 'test org',
        },
      },
      template: mockSignInTemplate.details,
      subject: `Sign in to Live Preview, test org`,
    });
  });

  it('should send verification code using callback email template if custom i18n template is not found', async () => {
    const defaultForgotPasswordTemplate = mockEmailConnectorConfig.templates.find(
      ({ usageType }) => usageType === 'Register'
    )!;

    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.Register,
    });

    await client.successSend(sendVerificationCode, {
      email: mockEmail,
    });

    expect(await readConnectorMessage('Email')).toMatchObject({
      type: TemplateType.Register,
      payload: {
        application: {
          id: demoAppApplicationId,
          name: 'Live Preview',
        },
      },
      template: defaultForgotPasswordTemplate,
    });
  });
});
