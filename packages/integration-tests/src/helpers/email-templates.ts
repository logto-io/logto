import { type CreateEmailTemplate, type EmailTemplate } from '@logto/schemas';

import { EmailTemplatesApi } from '#src/api/email-templates.js';

export class EmailTemplatesApiTest extends EmailTemplatesApi {
  readonly #emailTemplates = new Map<string, EmailTemplate>();

  override async create(
    templates: Array<Omit<CreateEmailTemplate, 'id'>>
  ): Promise<EmailTemplate[]> {
    const created = await super.create(templates);

    for (const template of created) {
      this.#emailTemplates.set(template.id, template);
    }

    return created;
  }

  override async delete(id: string): Promise<void> {
    await super.delete(id);
    this.#emailTemplates.delete(id);
  }

  override async deleteMany(
    where: Partial<Pick<EmailTemplate, 'languageTag' | 'templateType'>>
  ): Promise<{ rowCount: number }> {
    // Find all templates that match the where clause
    const templates = await this.findAll(where);
    const result = await super.deleteMany(where);

    // Remove the templates from the local cache
    for (const template of templates) {
      this.#emailTemplates.delete(template.id);
    }

    return result;
  }

  async cleanUp(): Promise<void> {
    await Promise.all(Array.from(this.#emailTemplates.keys()).map(async (id) => this.delete(id)));
  }
}
