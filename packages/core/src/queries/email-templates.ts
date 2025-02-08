import {
  type EmailTemplate,
  type EmailTemplateKeys,
  EmailTemplates,
  type CreateEmailTemplate,
} from '@logto/schemas';
import { type CommonQueryMethods } from '@silverhand/slonik';

import SchemaQueries from '#src/utils/SchemaQueries.js';

import { type WellKnownCache } from '../caches/well-known.js';
import { buildInsertIntoWithPool } from '../database/insert-into.js';
import { convertToIdentifiers, type OmitAutoSetFields } from '../utils/sql.js';

export default class EmailTemplatesQueries extends SchemaQueries<
  EmailTemplateKeys,
  CreateEmailTemplate,
  EmailTemplate
> {
  constructor(
    pool: CommonQueryMethods,
    // TODO: Implement redis cache for email templates
    private readonly wellKnownCache: WellKnownCache
  ) {
    super(pool, EmailTemplates);
  }

  /**
   * Upsert multiple email templates
   *
   * If the email template already exists with the same language tag, tenant ID, and template type,
   * template details will be updated.
   */
  async upsertMany(
    emailTemplates: ReadonlyArray<OmitAutoSetFields<CreateEmailTemplate>>
  ): Promise<readonly EmailTemplate[]> {
    const { fields } = convertToIdentifiers(EmailTemplates);

    return this.pool.transaction(async (transaction) => {
      const insertIntoTransaction = buildInsertIntoWithPool(transaction)(EmailTemplates, {
        returning: true,
        onConflict: {
          fields: [fields.tenantId, fields.languageTag, fields.templateType],
          setExcludedFields: [fields.details],
        },
      });

      return Promise.all(
        emailTemplates.map(async (emailTemplate) => insertIntoTransaction(emailTemplate))
      );
    });
  }
}
