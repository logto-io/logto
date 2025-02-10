import { type CreateEmailTemplate, type EmailTemplate } from '@logto/schemas';

import { authedAdminApi } from './index.js';

const path = 'email-templates';

export class EmailTemplatesApi {
  async create(templates: Array<Omit<CreateEmailTemplate, 'id'>>): Promise<EmailTemplate[]> {
    return authedAdminApi.put(path, { json: { templates } }).json<EmailTemplate[]>();
  }

  async delete(id: string): Promise<void> {
    await authedAdminApi.delete(`${path}/${id}`);
  }

  async findById(id: string): Promise<EmailTemplate> {
    return authedAdminApi.get(`${path}/${id}`).json<EmailTemplate>();
  }

  async findAll(
    where?: Partial<Pick<EmailTemplate, 'languageTag' | 'templateType'>>
  ): Promise<EmailTemplate[]> {
    return authedAdminApi.get(path, { searchParams: where }).json<EmailTemplate[]>();
  }
}
