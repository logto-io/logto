import {
  AccountCenterControlValue,
  AccountCenters,
  AdminTenantRole,
  ApplicationType,
  Applications,
  ApplicationsRoles,
  OrganizationRoleUserRelations,
  OrganizationUserRelations,
  Roles,
  SignInExperiences,
  SignInMode,
  TenantRole,
  Users,
  UsersPasswordEncryptionMethod,
  UsersRoles,
  adminTenantId,
  defaultManagementApiAdminName,
  defaultTenantId,
  getTenantOrganizationId,
  getTenantRole,
} from '@logto/schemas';
import type { Role } from '@logto/schemas';
import { generateStandardId, generateStandardShortId } from '@logto/shared';
import type { DatabaseTransactionConnection } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { insertInto } from '../../../database.js';
import { convertToIdentifiers } from '../../../sql.js';
import { encryptPassword } from '../../../utils/password.js';
import { consoleLog } from '../../../utils.js';

import type { AdminConfig, AppConfig, M2mConfig } from './bootstrap-config.js';
import {
  getAdminConfig,
  getAppConfig,
  getM2mConfig,
  getMfaConfig,
  getSignInExperienceConfig,
  getSmtpConfig,
  getSmtpSmsConfig,
} from './bootstrap-config.js';
import { bootstrapSmtpConnector, bootstrapSmtpSmsConnector } from './bootstrap-connectors.js';
import { bootstrapMfa, bootstrapSignInExperience } from './bootstrap-sign-in.js';
import type { SeedUser } from './bootstrap-users.js';
import { buildUserProfile, loadSeedUsers } from './bootstrap-users.js';

/**
 * Creates the initial admin user in the admin tenant and wires up all required role and
 * organisation memberships.
 *
 * Specifically:
 * - Inserts the user row with an Argon2i-hashed password.
 * - Assigns the `User` admin-tenant role and the default management-API admin role.
 * - Adds the user to the default tenant's organisation with the `Admin` organisation role.
 * - Switches the admin tenant's sign-in experience to sign-in-only mode so no further
 *   self-registration is possible via the admin console.
 *
 * @param connection - Active database transaction connection.
 * @param config - Admin user credentials and optional email from {@link getAdminConfig}.
 */
const bootstrapAdminUser = async (
  connection: DatabaseTransactionConnection,
  config: AdminConfig
) => {
  const userId = generateStandardShortId();
  const passwordEncrypted = await encryptPassword(config.password);

  await connection.query(
    insertInto(
      {
        tenantId: adminTenantId,
        id: userId,
        username: config.username,
        primaryEmail: config.email ?? null,
        passwordEncrypted,
        passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i,
        profile: {},
      },
      Users.table
    )
  );

  const roles = convertToIdentifiers(Roles);
  const userRole = await connection.one<Role>(sql`
    select ${roles.fields.id} from ${roles.table}
    where ${roles.fields.tenantId} = ${adminTenantId}
    and ${roles.fields.name} = ${AdminTenantRole.User}
  `);
  const managementRole = await connection.one<Role>(sql`
    select ${roles.fields.id} from ${roles.table}
    where ${roles.fields.tenantId} = ${adminTenantId}
    and ${roles.fields.name} = ${defaultManagementApiAdminName}
  `);

  await Promise.all([
    connection.query(
      insertInto(
        { id: generateStandardId(), userId, roleId: userRole.id, tenantId: adminTenantId },
        UsersRoles.table
      )
    ),
    connection.query(
      insertInto(
        { id: generateStandardId(), userId, roleId: managementRole.id, tenantId: adminTenantId },
        UsersRoles.table
      )
    ),
  ]);

  const organizationId = getTenantOrganizationId(defaultTenantId);
  await connection.query(
    insertInto({ userId, organizationId, tenantId: adminTenantId }, OrganizationUserRelations.table)
  );
  await connection.query(
    insertInto(
      {
        userId,
        organizationRoleId: getTenantRole(TenantRole.Admin).id,
        organizationId,
        tenantId: adminTenantId,
      },
      OrganizationRoleUserRelations.table
    )
  );

  await connection.query(sql`
    update ${sql.identifier([SignInExperiences.table])}
    set ${sql.identifier(['sign_in_mode'])} = ${SignInMode.SignIn}
    where ${sql.identifier(['tenant_id'])} = ${adminTenantId}
  `);

  consoleLog.succeed(
    `Created admin user "${config.username}" with admin roles and organization membership`
  );
};

/**
 * Registers a Traditional (server-side) OIDC application in the default tenant.
 *
 * Creates both the application record and its associated `Default` application secret so the
 * app can immediately authenticate against Logto using the configured client credentials.
 *
 * @param connection - Active database transaction connection.
 * @param config - Application metadata and OAuth settings from {@link getAppConfig}.
 */
const bootstrapApplication = async (
  connection: DatabaseTransactionConnection,
  config: AppConfig
) => {
  await connection.query(
    insertInto(
      {
        tenantId: defaultTenantId,
        id: config.clientId,
        name: config.name,
        secret: config.clientSecret,
        description: `Bootstrapped application: ${config.name}`,
        type: ApplicationType.Traditional,
        oidcClientMetadata: {
          redirectUris: config.redirectUris,
          postLogoutRedirectUris: config.postLogoutRedirectUris,
        },
        customClientMetadata: {},
        isThirdParty: false,
        customData: {},
      },
      Applications.table
    )
  );

  await connection.query(
    insertInto(
      {
        tenantId: defaultTenantId,
        applicationId: config.clientId,
        name: 'Default',
        value: config.clientSecret,
      },
      'application_secrets'
    )
  );

  consoleLog.succeed(
    `Created Traditional application "${config.name}" (client_id: ${config.clientId})`
  );
};

/**
 * Inserts pre-seeded user accounts into the default tenant in sequence.
 *
 * Passwords are hashed with Argon2i individually before each insert. Users are processed
 * sequentially (not in parallel) to avoid overwhelming the database with concurrent hashing and
 * write operations.
 *
 * @param connection - Active database transaction connection.
 * @param users - List of user entries loaded from the seed file.
 */
const bootstrapSeedUsers = async (
  connection: DatabaseTransactionConnection,
  users: readonly SeedUser[]
) => {
  for (const user of users) {
    const userId = generateStandardShortId();
    // eslint-disable-next-line no-await-in-loop
    const passwordEncrypted = await encryptPassword(user.password);

    // eslint-disable-next-line no-await-in-loop
    await connection.query(
      insertInto(
        {
          tenantId: defaultTenantId,
          id: userId,
          username: user.username ?? null,
          primaryEmail: user.email,
          passwordEncrypted,
          passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i,
          name: user.name ?? null,
          profile: buildUserProfile(user),
        },
        Users.table
      )
    );
  }

  consoleLog.succeed(`Seeded ${users.length} user account(s) in the default tenant`);
};

/**
 * Registers a Machine-to-Machine (M2M) application in the default tenant and assigns it the
 * pre-configured "Logto Management API access" role so it can immediately authenticate against
 * the Management API using the client-credentials grant.
 *
 * @param connection - Active database transaction connection.
 * @param config - M2M application credentials from {@link getM2mConfig}.
 */
const bootstrapM2mApplication = async (
  connection: DatabaseTransactionConnection,
  config: M2mConfig
) => {
  await connection.query(
    insertInto(
      {
        tenantId: defaultTenantId,
        id: config.clientId,
        name: config.name,
        secret: config.clientSecret,
        description: `Bootstrapped M2M application: ${config.name}`,
        type: ApplicationType.MachineToMachine,
        oidcClientMetadata: { redirectUris: [], postLogoutRedirectUris: [] },
        customClientMetadata: {},
        isThirdParty: false,
        customData: {},
      },
      Applications.table
    )
  );

  await connection.query(
    insertInto(
      {
        tenantId: defaultTenantId,
        applicationId: config.clientId,
        name: 'Default',
        value: config.clientSecret,
      },
      'application_secrets'
    )
  );

  const roles = convertToIdentifiers(Roles);
  const managementApiRole = await connection.one<Role>(sql`
    select ${roles.fields.id} from ${roles.table}
    where ${roles.fields.tenantId} = ${defaultTenantId}
    and ${roles.fields.name} = ${'Logto Management API access'}
  `);

  await connection.query(
    insertInto(
      {
        tenantId: defaultTenantId,
        id: generateStandardId(),
        applicationId: config.clientId,
        roleId: managementApiRole.id,
      },
      ApplicationsRoles.table
    )
  );

  consoleLog.succeed(
    `Created M2M application "${config.name}" (client_id: ${config.clientId}) with Management API access`
  );
};

const bootstrapAccountCenter = async (
  connection: DatabaseTransactionConnection,
  includePhone: boolean
) => {
  const fields = {
    password: AccountCenterControlValue.Edit,
    email: AccountCenterControlValue.Edit,
    name: AccountCenterControlValue.Edit,
    profile: AccountCenterControlValue.Edit,
    mfa: AccountCenterControlValue.Edit,
    phone: includePhone ? AccountCenterControlValue.Edit : AccountCenterControlValue.Off,
  };

  await connection.query(sql`
    update ${sql.identifier([AccountCenters.table])}
    set
      ${sql.identifier(['enabled'])} = true,
      ${sql.identifier(['fields'])} = ${JSON.stringify(fields)}::jsonb
    where ${sql.identifier(['tenant_id'])} = ${defaultTenantId}
    and ${sql.identifier(['id'])} = ${sql.literalValue('default')}
  `);

  consoleLog.succeed(
    'Enabled Account Centre with password, email, profile, and MFA editing for the default tenant'
  );
};

/**
 * Entry point for environment-driven bootstrap logic, intended to run once immediately after the
 * standard Logto database seed.
 *
 * @param connection - Active database transaction connection supplied by the seed runner.
 */
export const runBootstrap = async (connection: DatabaseTransactionConnection): Promise<void> => {
  const adminConfig = getAdminConfig();
  const appConfig = getAppConfig();
  const m2mConfig = getM2mConfig();
  const smtpConfig = getSmtpConfig();
  const smtpSmsConfig = getSmtpSmsConfig();
  const seedUsers = await loadSeedUsers();
  const signInExpConfig = getSignInExperienceConfig();
  const mfaConfig = getMfaConfig();

  const hasConfig = [adminConfig, appConfig, m2mConfig, smtpConfig, smtpSmsConfig, mfaConfig].some(
    Boolean
  );

  if (!hasConfig) {
    return;
  }

  consoleLog.info('Running environment-based bootstrap...');

  await bootstrapAccountCenter(connection, Boolean(smtpSmsConfig));

  if (adminConfig) {
    await bootstrapAdminUser(connection, adminConfig);
  }

  if (appConfig) {
    await bootstrapApplication(connection, appConfig);
  }

  if (m2mConfig) {
    await bootstrapM2mApplication(connection, m2mConfig);
  }

  if (smtpConfig) {
    await bootstrapSmtpConnector(connection, smtpConfig);
  }

  if (smtpSmsConfig) {
    await bootstrapSmtpSmsConnector(connection, smtpSmsConfig);
  }

  if (signInExpConfig.bootstrapSignInExperience) {
    await bootstrapSignInExperience(connection, signInExpConfig.primaryIdentifier);
  }

  if (mfaConfig) {
    await bootstrapMfa(connection, mfaConfig);
  }

  if (seedUsers.length > 0) {
    await bootstrapSeedUsers(connection, seedUsers);
  }

  consoleLog.succeed('Bootstrap complete');
};
