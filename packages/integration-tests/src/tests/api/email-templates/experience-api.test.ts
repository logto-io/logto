import { TemplateType } from '@logto/connector-kit';
import { demoAppApplicationId, InteractionEvent, SignInIdentifier } from '@logto/schemas';

import { mockEmailConnectorConfig } from '#src/__mocks__/connectors-mock.js';
import { type MockEmailTemplatePayload } from '#src/__mocks__/email-templates.js';
import { isDevFeaturesEnabled } from '#src/constants.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { setEmailConnector } from '#src/helpers/connector.js';
import { EmailTemplatesApiTest } from '#src/helpers/email-templates.js';
import { successfullySendVerificationCode } from '#src/helpers/experience/verification-code.js';
import { expectRejects, readConnectorMessage, removeConnectorMessage } from '#src/helpers/index.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
} from '#src/helpers/profile.js';
import { devFeatureDisabledTest, devFeatureTest, generateEmail } from '#src/utils.js';

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

  afterEach(async () => {
    await removeConnectorMessage('Email');
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
    const existingEmail = generateEmail();
    const { user } = await createDefaultTenantUserWithPassword({
      primaryEmail: existingEmail,
    });

    try {
      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.ForgotPassword,
      });
      const { code } = await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.ForgotPassword,
        identifier: {
          type: SignInIdentifier.Email,
          value: existingEmail,
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
    } finally {
      await deleteDefaultTenantUser(user.id);
    }
  });

  devFeatureTest.it(
    'should not deliver forgot-password verification code for a non-existing user when dev features are enabled',
    async () => {
      const nonExistingEmail = generateEmail();
      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.ForgotPassword,
      });

      const { verificationId } = await client.sendVerificationCode({
        interactionEvent: InteractionEvent.ForgotPassword,
        identifier: {
          type: SignInIdentifier.Email,
          value: nonExistingEmail,
        },
      });

      expect(verificationId).toBeTruthy();
      await expect(readConnectorMessage('Email')).rejects.toThrow();
      await expectRejects(
        client.verifyVerificationCode({
          identifier: {
            type: SignInIdentifier.Email,
            value: nonExistingEmail,
          },
          verificationId,
          code: '111111',
        }),
        {
          code: 'verification_code.code_mismatch',
          status: 400,
        }
      );
    }
  );

  devFeatureDisabledTest.it(
    'should keep delivering forgot-password verification code for a non-existing user when dev features are disabled',
    async () => {
      const defaultForgotPasswordTemplate = mockEmailConnectorConfig.templates.find(
        ({ usageType }) => usageType === 'ForgotPassword'
      )!;
      const nonExistingEmail = generateEmail();
      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.ForgotPassword,
      });

      const { verificationId } = await client.sendVerificationCode({
        interactionEvent: InteractionEvent.ForgotPassword,
        identifier: {
          type: SignInIdentifier.Email,
          value: nonExistingEmail,
        },
      });

      const { code, address, type, template, content, subject } =
        await readConnectorMessage('Email');

      expect(isDevFeaturesEnabled).toBe(false);
      expect(verificationId).toBeTruthy();
      expect(code).toBeTruthy();
      expect(address).toBe(nonExistingEmail);
      expect(type).toBe(TemplateType.ForgotPassword);
      expect(template).toMatchObject(defaultForgotPasswordTemplate);
      expect(content).toBe(defaultForgotPasswordTemplate.content.replace('{{code}}', code));
      expect(subject).toBe(defaultForgotPasswordTemplate.subject);
    }
  );
});
