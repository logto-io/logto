import { TemplateType } from '@logto/connector-kit';
import { type EmailTemplateDetails } from '@logto/schemas';

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

  it('should partially update email template details by ID successfully', async () => {
    const [template] = await emailTemplatesApi.create(mockEmailTemplates);

    const updatedDetails: Partial<EmailTemplateDetails> = {
      subject: `${template!.details.subject} updated`,
      replyTo: 'logto test',
    };

    const updated = await emailTemplatesApi.updateTemplateDetailsById(template!.id, updatedDetails);
    expect(updated.details).toEqual({ ...template!.details, ...updatedDetails });
  });

  it('should throw 404 when trying to partially update email template details by invalid ID', async () => {
    await expectRejects(emailTemplatesApi.updateTemplateDetailsById('invalid-id', {}), {
      code: 'entity.not_exists_with_id',
      status: 404,
    });
  });

  it('should delete email templates by languageTag successfully', async () => {
    const templates = await emailTemplatesApi.create(mockEmailTemplates);
    const { rowCount } = await emailTemplatesApi.deleteMany({
      languageTag: 'en',
    });
    expect(rowCount).toBe(templates.filter(({ languageTag }) => languageTag === 'en').length);
    const remaining = await emailTemplatesApi.findAll({
      languageTag: 'en',
    });
    expect(remaining).toHaveLength(0);
  });

  it('should delete email templates by templateType successfully', async () => {
    const templates = await emailTemplatesApi.create(mockEmailTemplates);
    const { rowCount } = await emailTemplatesApi.deleteMany({
      templateType: TemplateType.SignIn,
    });
    expect(rowCount).toBe(
      templates.filter(({ templateType }) => templateType === TemplateType.SignIn).length
    );
    const remaining = await emailTemplatesApi.findAll({
      templateType: TemplateType.SignIn,
    });
    expect(remaining).toHaveLength(0);
  });

  it('should delete email template by languageTag and templateType', async () => {
    const templates = await emailTemplatesApi.create(mockEmailTemplates);
    const { rowCount } = await emailTemplatesApi.deleteMany({
      languageTag: 'en',
      templateType: TemplateType.SignIn,
    });

    expect(rowCount).toBe(
      templates.filter(
        ({ languageTag, templateType }) =>
          languageTag === 'en' && templateType === TemplateType.SignIn
      ).length
    );
  });

  it('should throw 422 when trying to delete email templates without filter', async () => {
    await expectRejects(emailTemplatesApi.deleteMany({}), {
      code: 'connector.email_connector.bulk_deletion_no_filter',
      status: 422,
    });
  });
});
