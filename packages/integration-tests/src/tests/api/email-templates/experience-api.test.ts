import { TemplateType } from '@logto/connector-kit';
import { demoAppApplicationId, InteractionEvent, SignInIdentifier } from '@logto/schemas';

import { mockEmailConnectorConfig } from '#src/__mocks__/connectors-mock.js';
import { type MockEmailTemplatePayload } from '#src/__mocks__/email-templates.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { setEmailConnector } from '#src/helpers/connector.js';
import { EmailTemplatesApiTest } from '#src/helpers/email-templates.js';
import { successfullySendVerificationCode } from '#src/helpers/experience/verification-code.js';
import { readConnectorMessage } from '#src/helpers/index.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
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

describe('experience API with i18n email templates', () => {
  const emailTemplatesApi = new EmailTemplatesApiTest();
  const organizationApi = new OrganizationApiTest();
  const mockEmail = generateEmail();

  beforeAll(async () => {
    await Promise.all([setEmailConnector(), emailTemplatesApi.create([mockSignInTemplate])]);
  });

  afterAll(async () => {
    await Promise.all([emailTemplatesApi.cleanUp(), organizationApi.cleanUp()]);
  });

  it('should send verification code using custom i18n template', async () => {
    const organization = await organizationApi.create({
      name: 'test org',
    });

    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.SignIn,
      options: {
        extraParams: {
          organization_id: organization.id,
        },
      },
    });

    const { code } = await successfullySendVerificationCode(client, {
      interactionEvent: InteractionEvent.SignIn,
      identifier: {
        type: SignInIdentifier.Email,
        value: mockEmail,
      },
    });

    expect(await readConnectorMessage('Email')).toMatchObject({
      type: TemplateType.SignIn,
      payload: {
        code,
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
      content: `Your verification code is: ${code}`,
    });
  });

  it('should send verification code using callback email template if custom i18n template is not found', async () => {
    const defaultForgotPasswordTemplate = mockEmailConnectorConfig.templates.find(
      ({ usageType }) => usageType === 'ForgotPassword'
    )!;

    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.ForgotPassword,
    });
    const { code } = await successfullySendVerificationCode(client, {
      interactionEvent: InteractionEvent.ForgotPassword,
      identifier: {
        type: SignInIdentifier.Email,
        value: mockEmail,
      },
    });

    expect(await readConnectorMessage('Email')).toMatchObject({
      type: TemplateType.ForgotPassword,
      payload: {
        code,
        application: {
          id: demoAppApplicationId,
          name: 'Live Preview',
        },
      },
      template: defaultForgotPasswordTemplate,
      content: defaultForgotPasswordTemplate.content.replace('{{code}}', code),
      subject: defaultForgotPasswordTemplate.subject,
    });
  });
});
