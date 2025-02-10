import { TemplateType } from '@logto/connector-kit';

import { mockEmailTemplates } from '#src/__mocks__/email-templates.js';
import { EmailTemplatesApiTest } from '#src/helpers/email-templates.js';
import { expectRejects } from '#src/helpers/index.js';
import { devFeatureTest } from '#src/utils.js';

devFeatureTest.describe('email templates', () => {
  const emailTemplatesApi = new EmailTemplatesApiTest();

  afterEach(async () => {
    await emailTemplatesApi.cleanUp();
  });

  it('should create email templates successfully', async () => {
    const created = await emailTemplatesApi.create(mockEmailTemplates);
    expect(created).toHaveLength(mockEmailTemplates.length);
  });

  it('should update existing email template details for specified language and type', async () => {
    const updatedTemplates: typeof mockEmailTemplates = mockEmailTemplates.map(
      ({ details, ...rest }) => ({
        ...rest,
        details: {
          subject: `${details.subject} updated`,
          content: `${details.content} updated`,
        },
      })
    );

    await emailTemplatesApi.create(mockEmailTemplates);
    const created = await emailTemplatesApi.create(updatedTemplates);

    expect(created).toHaveLength(3);

    for (const [index, template] of created.entries()) {
      expect(template.details.subject).toBe(updatedTemplates[index]!.details.subject);
      expect(template.details.content).toBe(updatedTemplates[index]!.details.content);
    }
  });

  it('should get email templates with query search successfully', async () => {
    await emailTemplatesApi.create(mockEmailTemplates);

    const templates = await emailTemplatesApi.findAll();
    expect(templates).toHaveLength(3);

    for (const mockTemplate of mockEmailTemplates) {
      const template = templates.find(
        ({ languageTag, templateType }) =>
          languageTag === mockTemplate.languageTag && templateType === mockTemplate.templateType
      );

      expect(template).toBeDefined();
      expect(template!.details).toEqual(mockTemplate.details);
    }

    // Search by language tag
    const enTemplates = await emailTemplatesApi.findAll({ languageTag: 'en' });
    expect(enTemplates).toHaveLength(
      mockEmailTemplates.filter(({ languageTag }) => languageTag === 'en').length
    );

    // Search by template type
    const signInTemplates = await emailTemplatesApi.findAll({ templateType: TemplateType.SignIn });
    expect(signInTemplates).toHaveLength(
      mockEmailTemplates.filter(({ templateType }) => templateType === TemplateType.SignIn).length
    );
  });

  it('should get email template by ID successfully', async () => {
    const [template] = await emailTemplatesApi.create(mockEmailTemplates);
    const found = await emailTemplatesApi.findById(template!.id);
    expect(found).toEqual(template);
  });

  it('should throw 404 error when email template not found by ID', async () => {
    await expectRejects(emailTemplatesApi.findById('invalid-id'), {
      code: 'entity.not_exists_with_id',
      status: 404,
    });
  });
});
