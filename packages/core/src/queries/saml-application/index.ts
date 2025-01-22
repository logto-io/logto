import { type ToZodObject } from '@logto/connector-kit';
import {
  SamlApplicationConfigs,
  SamlApplicationSecrets,
  Applications,
  ApplicationType,
  type Application,
  type SamlApplicationConfig,
  type SamlApplicationSecret,
} from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(Applications, true);
const { table: samlApplicationConfigsTable, fields: samlApplicationConfigsFields } =
  convertToIdentifiers(SamlApplicationConfigs, true);
const { table: samlApplicationSecretsTable, fields: samlApplicationSecretsFields } =
  convertToIdentifiers(SamlApplicationSecrets, true);

type NullableObject<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof T]: T[P] | null;
};

type SamlApplicationSecretDetails = Pick<
  SamlApplicationSecret,
  'privateKey' | 'certificate' | 'active' | 'expiresAt'
>;

export type SamlApplicationDetails = Pick<
  Application,
  'id' | 'secret' | 'name' | 'description' | 'customData' | 'oidcClientMetadata'
> &
  Pick<
    SamlApplicationConfig,
    'attributeMapping' | 'entityId' | 'acsUrl' | 'encryption' | 'nameIdFormat'
  > &
  NullableObject<SamlApplicationSecretDetails>;

const samlApplicationDetailsGuard = Applications.guard
  .pick({
    id: true,
    secret: true,
    name: true,
    description: true,
    customData: true,
    oidcClientMetadata: true,
  })
  .merge(
    SamlApplicationConfigs.guard.pick({
      attributeMapping: true,
      entityId: true,
      acsUrl: true,
      nameIdFormat: true,
      encryption: true,
    })
  )
  .merge(
    // Zod does not provide a way to convert all fields to nullable, so we need to do it manually. Other implementations seems can not make TypeScript happy.
    z.object({
      privateKey: SamlApplicationSecrets.guard.shape.privateKey.nullable(),
      certificate: SamlApplicationSecrets.guard.shape.certificate.nullable(),
      active: SamlApplicationSecrets.guard.shape.active.nullable(),
      expiresAt: SamlApplicationSecrets.guard.shape.expiresAt.nullable(),
    })
  ) satisfies ToZodObject<SamlApplicationDetails>;

export const createSamlApplicationQueries = (pool: CommonQueryMethods) => {
  const getSamlApplicationDetailsById = async (id: string): Promise<SamlApplicationDetails> => {
    const result = await pool.maybeOne(sql`
      select ${fields.id} as id, ${fields.secret} as secret, ${fields.name} as name, ${fields.description} as description, ${fields.customData} as custom_data, ${fields.oidcClientMetadata} as oidc_client_metadata, ${samlApplicationConfigsFields.attributeMapping} as attribute_mapping, ${samlApplicationConfigsFields.entityId} as entity_id, ${samlApplicationConfigsFields.acsUrl} as acs_url, ${samlApplicationConfigsFields.encryption} as encryption, ${samlApplicationConfigsFields.nameIdFormat} as name_id_format, ${samlApplicationSecretsFields.privateKey} as private_key, ${samlApplicationSecretsFields.certificate} as certificate, ${samlApplicationSecretsFields.active} as active, ${samlApplicationSecretsFields.expiresAt} as expires_at
      from ${table}
      left join ${samlApplicationConfigsTable} on ${fields.id}=${samlApplicationConfigsFields.applicationId}
      left join ${samlApplicationSecretsTable} on ${fields.id}=${samlApplicationSecretsFields.applicationId}
      where ${fields.id}=${id} and ${fields.type}=${ApplicationType.SAML} and ${samlApplicationSecretsFields.active}=true
    `);

    assertThat(
      result,
      new RequestError(
        { code: 'entity.not_found', status: 404 },
        {
          message: `Can not find SAML application by ID (${id}) with active certificate.`,
        }
      )
    );

    return samlApplicationDetailsGuard.parse(result);
  };

  return {
    getSamlApplicationDetailsById,
  };
};
