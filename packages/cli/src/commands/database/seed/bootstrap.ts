import {
  AdminTenantRole,
  ApplicationType,
  Applications,
  OrganizationRoleUserRelations,
  OrganizationUserRelations,
  Roles,
  SignInExperiences,
  SignInIdentifier,
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
  getSignInIdentifier,
  getSmtpConfig,
} from './bootstrap-config.js';
import type { SeedUser } from './bootstrap-users.js';
import { loadSeedUsers } from './bootstrap-users.js';

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

const buildUserProfile = (user: SeedUser): Record<string, string> => ({
  ...(user.familyName ? { familyName: user.familyName } : {}),
  ...(user.givenName ? { givenName: user.givenName } : {}),
});

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

const updateSignInExperience = async (
  connection: DatabaseTransactionConnection,
  useEmailIdentifier: boolean,
  hasSeededUsers: boolean
) => {
  if (!useEmailIdentifier) {
    return;
  }

  const signIn = {
    methods: [
      {
        identifier: SignInIdentifier.Email,
        password: true,
        verificationCode: true,
        isPasswordPrimary: true,
      },
    ],
  };
  const signUp = {
    identifiers: [SignInIdentifier.Email],
    password: true,
    verify: true,
  };

  // When users are pre-seeded, restrict to sign-in only (no self-registration)
  const signInModeClause = hasSeededUsers
    ? sql`, ${sql.identifier(['sign_in_mode'])} = ${SignInMode.SignIn}`
    : sql``;

  await connection.query(sql`
    update ${sql.identifier([SignInExperiences.table])}
    set
      ${sql.identifier(['sign_in'])} = ${JSON.stringify(signIn)}::jsonb,
      ${sql.identifier(['sign_up'])} = ${JSON.stringify(signUp)}::jsonb
      ${signInModeClause}
    where ${sql.identifier(['tenant_id'])} = ${defaultTenantId}
    and ${sql.identifier(['id'])} = 'default'
  `);

  consoleLog.succeed('Updated sign-in experience: email-primary sign-in enabled');
};

/**
 * Run the environment-based bootstrap after the standard database seed.
 * Creates admin user, OIDC application, SMTP connector, and seeded users as configured.
 */
export const runBootstrap = async (connection: DatabaseTransactionConnection): Promise<void> => {
  const adminConfig = getAdminConfig();
  const appConfig = getAppConfig();
  const smtpConfig = getSmtpConfig();
  const seedUsers = await loadSeedUsers();
  const signInIdentifier = getSignInIdentifier();

  if (!adminConfig && !appConfig && !smtpConfig && seedUsers.length === 0 && !signInIdentifier) {
    return;
  }

  consoleLog.info('Running environment-based bootstrap...');

  if (adminConfig) {
    await bootstrapAdminUser(connection, adminConfig);
  }

  if (appConfig) {
    await bootstrapApplication(connection, appConfig);
  }

  if (smtpConfig) {
    await bootstrapSmtpConnector(connection, smtpConfig);
  }

  if (seedUsers.length > 0) {
    await bootstrapSeedUsers(connection, seedUsers);
  }

  // Use email-primary sign-in when: users are seeded (always email-primary) or explicitly configured
  const useEmailIdentifier = seedUsers.length > 0 || signInIdentifier === 'email';
  await updateSignInExperience(connection, useEmailIdentifier, seedUsers.length > 0);

  consoleLog.succeed('Bootstrap complete');
};
