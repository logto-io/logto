import { type CreateEmailTemplate, type EmailTemplate } from '@logto/schemas';

import { EmailTemplatesApi } from '#src/api/email-templates.js';

export class EmailTemplatesApiTest extends EmailTemplatesApi {
  #emailTemplates: EmailTemplate[] = [];

  override async create(
    templates: Array<Omit<CreateEmailTemplate, 'id'>>
  ): Promise<EmailTemplate[]> {
    const created = await super.create(templates);
    this.#emailTemplates.concat(created);
    return created;
  }

  async cleanUp(): Promise<void> {
    await Promise.all(this.#emailTemplates.map(async (template) => this.delete(template.id)));
    this.#emailTemplates = [];
  }
}
