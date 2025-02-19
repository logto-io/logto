import {
  type EmailTemplate,
  type EmailTemplateKeys,
  EmailTemplates,
  type CreateEmailTemplate,
  type TemplateType,
} from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import SchemaQueries from '#src/utils/SchemaQueries.js';

import { type WellKnownCache } from '../caches/well-known.js';
import { buildInsertIntoWithPool } from '../database/insert-into.js';
import { expandFields } from '../database/utils.js';
import {
  conditionalSql,
  convertToIdentifiers,
  manyRows,
  type OmitAutoSetFields,
} from '../utils/sql.js';

export default class EmailTemplatesQueries extends SchemaQueries<
  EmailTemplateKeys,
  CreateEmailTemplate,
  EmailTemplate
> {
  public readonly findByLanguageTagAndTemplateType = this.wellKnownCache.memoize(
    this.#findByLanguageTagAndTemplateType,
    [
      'email-templates',
      (templateType: TemplateType, languageTag: string) => `${languageTag}:${templateType}`,
    ]
  );

  constructor(
    pool: CommonQueryMethods,
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

    const results = await this.pool.transaction(async (transaction) => {
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

    // Make sure to invalidate the cache after updating email templates
    void Promise.all(
      results.map(async ({ languageTag, templateType }) =>
        trySafe(this.wellKnownCache.delete('email-templates', `${languageTag}:${templateType}`))
      )
    );

    return results;
  }

  override async updateById(
    id: string,
    data: Partial<EmailTemplate>,
    jsonbMode: 'replace' | 'merge' = 'replace'
  ) {
    const result = await super.updateById(id, data, jsonbMode);

    // Make sure to invalidate the cache after updating email templates
    void trySafe(
      this.wellKnownCache.delete('email-templates', `${result.languageTag}:${result.templateType}`)
    );

    return result;
  }

  override async deleteById(id: string) {
    const emailTemplate = await this.findById(id);
    await super.deleteById(id);

    // Make sure to invalidate the cache after deleting email templates
    void trySafe(
      this.wellKnownCache.delete(
        'email-templates',
        `${emailTemplate.languageTag}:${emailTemplate.templateType}`
      )
    );
  }

  /**
   * Find all email templates
   *
   * @param where - Optional where clause to filter email templates by language tag and template type
   * @param where.languageTag - The language tag of the email template
   * @param where.templateType - The type of the email template
   */
  async findAllWhere(
    where?: Partial<Pick<EmailTemplate, 'languageTag' | 'templateType'>>
  ): Promise<readonly EmailTemplate[]> {
    const { fields, table } = convertToIdentifiers(EmailTemplates);

    return manyRows(
      this.pool.query<EmailTemplate>(sql`
      select ${expandFields(EmailTemplates)}
      from ${table}
      ${conditionalSql(where && Object.keys(where).length > 0 && where, (where) => {
        return sql`where ${sql.join(
          Object.entries(where).map(
            // eslint-disable-next-line no-restricted-syntax -- Object.entries can not infer the key type properly.
            ([key, value]) => sql`${fields[key as keyof EmailTemplate]} = ${value}`
          ),
          sql` and `
        )}`;
      })}
      order by ${fields.languageTag}, ${fields.templateType}
    `)
    );
  }

  /**
   * Delete multiple email templates by language tag and template type
   *
   * @param where - Where clause to filter email templates by language tag and template type
   * @param where.languageTag - The language tag of the email template
   * @param where.templateType - The type of the email template
   */
  async deleteMany(
    where: Partial<Pick<EmailTemplate, 'languageTag' | 'templateType'>>
  ): Promise<{ rowCount: number }> {
    const { fields, table } = convertToIdentifiers(EmailTemplates);

    const { rows, rowCount } = await this.pool.query<EmailTemplate>(sql`
      delete from ${table}
      where ${sql.join(
        Object.entries(where).map(
          // eslint-disable-next-line no-restricted-syntax -- Object.entries can not infer the key type properly.
          ([key, value]) => sql`${fields[key as keyof EmailTemplate]} = ${value}`
        ),
        sql` and `
      )}
      returning *
    `);

    // Make sure to invalidate the cache after deleting email templates
    void Promise.all(
      rows.map(async ({ languageTag, templateType }) =>
        trySafe(this.wellKnownCache.delete('email-templates', `${languageTag}:${templateType}`))
      )
    );

    return { rowCount };
  }

  async #findByLanguageTagAndTemplateType(templateType: TemplateType, languageTag: string) {
    const { fields, table } = convertToIdentifiers(EmailTemplates);

    return this.pool.maybeOne<EmailTemplate>(
      sql`
        select ${expandFields(EmailTemplates)}
        from ${table}
        where ${fields.templateType} = ${templateType}
        and ${fields.languageTag} = ${languageTag}
      `
    );
  }
}
