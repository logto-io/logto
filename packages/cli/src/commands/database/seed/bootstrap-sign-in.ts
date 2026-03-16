import {
  CustomProfileFields,
  LogtoConfigs,
  SignInExperiences,
  type SignInIdentifier,
  defaultTenantId,
} from '@logto/schemas';
import { createDefaultCustomProfileFields } from '@logto/schemas/lib/seeds/custom-profile-fields.js';
import type { DatabaseTransactionConnection } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { insertInto } from '../../../database.js';
import { consoleLog } from '../../../utils.js';

/**
 * Configures the sign-in experience for the default tenant to use email as the primary identifier.
 *
 * - Sets email + password + verification-code sign-in and email-only sign-up on the default SIE.
 * - Inserts the default custom profile fields (given name, family name).
 * - Marks the admin console's `signInExperienceCustomized` flag so the setup wizard is skipped.
 *
 * @param connection - Active database transaction connection.
 * @param signInIdentifier - What to use as the primary identifier for signing a user up (email or username)
 */
export const bootstrapSignInExperience = async (
  connection: DatabaseTransactionConnection,
  signInIdentifier: SignInIdentifier
) => {
  const signIn = {
    methods: [
      {
        identifier: signInIdentifier,
        password: true,
        verificationCode: true,
        isPasswordPrimary: true,
      },
    ],
  };

  const signUp = {
    identifiers: [signInIdentifier],
    password: true,
    verify: true,
  };

  await connection.query(sql`
    update ${sql.identifier([SignInExperiences.table])}
    set
      ${sql.identifier(['sign_in'])} = ${JSON.stringify(signIn)}::jsonb,
      ${sql.identifier(['sign_up'])} = ${JSON.stringify(signUp)}::jsonb
    where ${sql.identifier(['tenant_id'])} = ${defaultTenantId}
    and ${sql.identifier(['id'])} = 'default'
  `);

  consoleLog.succeed('Updated sign-in experience: email-primary sign-in enabled');

  await connection.query(
    insertInto(createDefaultCustomProfileFields(defaultTenantId), CustomProfileFields.table)
  );

  consoleLog.succeed(
    'Updated sign-in experience: Added required profile givenName, lastName fields to managed console'
  );

  await connection.query(sql`
    update ${sql.identifier([LogtoConfigs.table])}
    set
      ${sql.identifier(['value'])} = ${JSON.stringify({ organizationCreated: false, signInExperienceCustomized: true })}::jsonb,
    where ${sql.identifier(['tenant_id'])} = ${defaultTenantId}
    and ${sql.identifier(['key'])} = 'adminConsole'
  `);

  consoleLog.succeed('Enabled sign-in experience');
};
