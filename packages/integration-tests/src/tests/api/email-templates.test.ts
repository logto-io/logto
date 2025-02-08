import { mockEmailTemplates } from '#src/__mocks__/email-templates.js';
import { EmailTemplatesApiTest } from '#src/helpers/email-templates.js';
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
});
