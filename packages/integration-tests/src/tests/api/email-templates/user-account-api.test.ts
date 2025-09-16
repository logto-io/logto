import { TemplateType } from '@logto/connector-kit';
import { UserScope } from '@logto/core-kit';
import { SignInIdentifier } from '@logto/schemas';

import { mockEmailConnectorConfig } from '#src/__mocks__/connectors-mock.js';
import { type MockEmailTemplatePayload } from '#src/__mocks__/email-templates.js';
import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { createAndVerifyVerificationCode } from '#src/api/verification-record.js';
import { setEmailConnector } from '#src/helpers/connector.js';
import { EmailTemplatesApiTest } from '#src/helpers/email-templates.js';
import { readConnectorMessage } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  signInAndGetUserApi,
} from '#src/helpers/profile.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateEmail } from '#src/utils.js';

describe('user account email verification API with i18n email templates', () => {
  const emailTemplatesApi = new EmailTemplatesApiTest();

  const mockEnTemplate: MockEmailTemplatePayload = {
    languageTag: 'en',
    templateType: TemplateType.UserPermissionValidation,
    details: {
      subject:
        '{{user.username}} verify your account {{ user.primaryEmail }} in {{ application.name }}',
      content: 'Your verification code is: {{code}}',
      contentType: 'text/html',
    },
  };

  const mockDeTemplate: MockEmailTemplatePayload = {
    ...mockEnTemplate,
    languageTag: 'de',
    templateType: TemplateType.BindNewIdentifier,
  };

  beforeAll(async () => {
    await Promise.all([
      setEmailConnector(),
      enableAllPasswordSignInMethods(),
      enableAllAccountCenterFields(),
      emailTemplatesApi.create([mockEnTemplate, mockDeTemplate]),
    ]);
  });

  afterAll(async () => {
    await emailTemplatesApi.cleanUp();
  });

  it('update primary email by verifying existing email with empty local', async () => {
    const primaryEmail = generateEmail();
    const { user, username, password } = await createDefaultTenantUserWithPassword({
      primaryEmail,
    });
    const api = await signInAndGetUserApi(username, password, {
      scopes: [UserScope.Profile, UserScope.Email],
    });

    await createAndVerifyVerificationCode(api, {
      type: SignInIdentifier.Email,
      value: primaryEmail,
    });

    // TemplateType.UserPermissionValidation
    expect(await readConnectorMessage('Email')).toMatchObject({
      type: TemplateType.UserPermissionValidation,
      payload: {
        locale: 'en',
      },
      template: mockEnTemplate.details,
      subject: `${username} verify your account ${primaryEmail} in Live Preview`,
    });

    const newEmail = generateEmail();
    await createAndVerifyVerificationCode(api, {
      type: SignInIdentifier.Email,
      value: newEmail,
    });

    // TemplateType.BindNewIdentifier
    expect(await readConnectorMessage('Email')).toMatchObject({
      type: TemplateType.BindNewIdentifier,
      payload: {
        locale: 'en',
      },
      template: mockEmailConnectorConfig.templates.find(
        ({ usageType }) => usageType === TemplateType.BindNewIdentifier
      ),
    });

    await deleteDefaultTenantUser(user.id);
  });

  it('update primary email by verifying existing email with de local', async () => {
    const primaryEmail = generateEmail();
    const { user, username, password } = await createDefaultTenantUserWithPassword({
      primaryEmail,
    });
    const api = await signInAndGetUserApi(
      username,
      password,
      {
        scopes: [UserScope.Profile, UserScope.Email],
      },
      'de'
    );

    await createAndVerifyVerificationCode(api, {
      type: SignInIdentifier.Email,
      value: primaryEmail,
    });

    // TemplateType.UserPermissionValidation
    expect(await readConnectorMessage('Email')).toMatchObject({
      type: TemplateType.UserPermissionValidation,
      payload: {
        locale: 'de',
      },
      // No de custom template found, fallback to en custom template
      template: mockEnTemplate.details,
    });

    const newEmail = generateEmail();
    await createAndVerifyVerificationCode(api, {
      type: SignInIdentifier.Email,
      value: newEmail,
    });

    // TemplateType.BindNewIdentifier
    expect(await readConnectorMessage('Email')).toMatchObject({
      type: TemplateType.BindNewIdentifier,
      payload: {
        locale: 'de',
      },
      template: mockDeTemplate.details,
    });

    await deleteDefaultTenantUser(user.id);
  });

  it('uses provided templateType BindMfa with existing email', async () => {
    const primaryEmail = generateEmail();
    const { user, username, password } = await createDefaultTenantUserWithPassword({
      primaryEmail,
    });

    const api = await signInAndGetUserApi(username, password, {
      scopes: [UserScope.Profile, UserScope.Email],
    });

    // Trigger sending verification code with explicit BindMfa template for existing identifier
    const response = await api
      .post('api/verifications/verification-code', {
        json: {
          identifier: { type: SignInIdentifier.Email, value: primaryEmail },
          templateType: TemplateType.BindMfa,
        },
      })
      .json<{ verificationRecordId: string; expiresAt: string }>();

    expect(response.verificationRecordId).toBeTruthy();

    // Expect BindMfa template selected
    expect(await readConnectorMessage('Email')).toMatchObject({
      type: TemplateType.BindMfa,
    });

    await deleteDefaultTenantUser(user.id);
  });
});
