import {
  type EmailTemplateDetails,
  type CreateEmailTemplate,
  type EmailTemplate,
  type TemplateType,
} from '@logto/schemas';

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

  async updateTemplateDetailsById(
    id: string,
    details: Partial<EmailTemplateDetails>
  ): Promise<EmailTemplate> {
    return authedAdminApi.patch(`${path}/${id}/details`, { json: details }).json<EmailTemplate>();
  }

  async deleteAllByLanguageTag(languageTag: string): Promise<{ rowCount: number }> {
    return authedAdminApi
      .delete(`${path}/language-tag/${languageTag}`)
      .json<{ rowCount: number }>();
  }

  async deleteAllByTemplateType(templateType: TemplateType): Promise<{ rowCount: number }> {
    return authedAdminApi
      .delete(`${path}/template-type/${templateType}`)
      .json<{ rowCount: number }>();
  }
}
