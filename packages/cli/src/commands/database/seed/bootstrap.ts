import {
  AccountCenterControlValue,
  AccountCenters,
  AdminTenantRole,
  ApplicationType,
  Applications,
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

import type { AdminConfig, AppConfig, SmtpConfig } from './bootstrap-config.js';
import {
  getAdminConfig,
  getAppConfig,
  getMfaConfig,
  getSignInExperienceConfig,
  getSmtpConfig,
} from './bootstrap-config.js';
import { bootstrapMfa, bootstrapSignInExperience } from './bootstrap-sign-in.js';
import type { SeedUser } from './bootstrap-users.js';
import { loadSeedUsers } from './bootstrap-users.js';

/**
 * Default HTML email templates registered with the SMTP connector for every standard usage type
 * (Register, SignIn, ForgotPassword, Generic). Each template renders a `{{code}}` placeholder
 * that Logto replaces with the one-time verification code at send time.
 */
const defaultEmailTemplates = [
  {
    usageType: 'Register',
    contentType: 'text/html',
    subject: 'Your verification code',
    content:
      '<p>Your verification code is <strong>{{code}}</strong>. It expires in 10 minutes.</p>',
  },
  {
    usageType: 'SignIn',
    contentType: 'text/html',
    subject: 'Your sign-in verification code',
    content:
      '<p>Your sign-in verification code is <strong>{{code}}</strong>. It expires in 10 minutes.</p>',
  },
  {
    usageType: 'ForgotPassword',
    contentType: 'text/html',
    subject: 'Reset your password',
    content:
      '<p>Your password reset code is <strong>{{code}}</strong>. It expires in 10 minutes.</p>',
  },
  {
    usageType: 'Generic',
    contentType: 'text/html',
    subject: 'Your verification code',
    content:
      '<p>Your verification code is <strong>{{code}}</strong>. It expires in 10 minutes.</p>',
  },
];

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
 * Registers an SMTP email connector in the default tenant using the built-in
 * `simple-mail-transfer-protocol` connector type.
 *
 * The connector is pre-loaded with {@link defaultEmailTemplates} covering all standard usage
 * types so it is immediately ready to send verification and password-reset emails.
 *
 * @param connection - Active database transaction connection.
 * @param config - SMTP server details and credentials from {@link getSmtpConfig}.
 */
const bootstrapSmtpConnector = async (
  connection: DatabaseTransactionConnection,
  config: SmtpConfig
) => {
  await connection.query(
    insertInto(
      {
        tenantId: defaultTenantId,
        id: generateStandardShortId(),
        connectorId: 'simple-mail-transfer-protocol',
        config: {
          host: config.host,
          port: config.port,
          auth: config.auth,
          fromEmail: config.fromEmail,
          ...(config.replyTo ? { replyTo: config.replyTo } : {}),
          secure: config.secure,
          templates: defaultEmailTemplates,
        },
        metadata: {},
      },
      'connectors'
    )
  );

  consoleLog.succeed(`Configured SMTP email connector (${config.host}:${config.port})`);
};

/**
 * Extracts the optional name profile fields from a seed user into the flat object expected by the
 * `profile` column.
 *
 * @param user - Source seed user entry.
 * @returns A partial profile record containing only the fields that are present on the user.
 */
const buildUserProfile = (user: SeedUser): Record<string, string> => ({
  ...(user.familyName ? { familyName: user.familyName } : {}),
  ...(user.givenName ? { givenName: user.givenName } : {}),
});

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

const bootstrapAccountCenter = async (connection: DatabaseTransactionConnection) => {
  const fields = {
    password: AccountCenterControlValue.Edit,
    email: AccountCenterControlValue.Edit,
    profile: AccountCenterControlValue.Edit,
    mfa: AccountCenterControlValue.Edit,
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
  const smtpConfig = getSmtpConfig();
  const seedUsers = await loadSeedUsers();
  const signInExpConfig = getSignInExperienceConfig();
  const mfaConfig = getMfaConfig();

  const hasConfig = [adminConfig, appConfig, smtpConfig, mfaConfig].some(Boolean);

  if (!hasConfig) {
    return;
  }

  consoleLog.info('Running environment-based bootstrap...');

  await bootstrapAccountCenter(connection);

  if (adminConfig) {
    await bootstrapAdminUser(connection, adminConfig);
  }

  if (appConfig) {
    await bootstrapApplication(connection, appConfig);
  }

  if (smtpConfig) {
    await bootstrapSmtpConnector(connection, smtpConfig);
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
