import type { CommonQueryMethods } from '@silverhand/slonik';

import { type WellKnownCache } from '#src/caches/well-known.js';
import { ApplicationSecretQueries } from '#src/queries/application-secrets.js';
import createApplicationSignInExperienceQueries from '#src/queries/application-sign-in-experience.js';
import { createApplicationQueries } from '#src/queries/application.js';
import { createApplicationsRolesQueries } from '#src/queries/applications-roles.js';
import { createConnectorQueries } from '#src/queries/connector.js';
import { createCustomPhraseQueries } from '#src/queries/custom-phrase.js';
import { createDailyActiveUsersQueries } from '#src/queries/daily-active-user.js';
import { createDailyTokenUsageQueries } from '#src/queries/daily-token-usage.js';
import { createDomainsQueries } from '#src/queries/domains.js';
import { createHooksQueries } from '#src/queries/hooks.js';
import { createLogQueries } from '#src/queries/log.js';
import { createLogtoConfigQueries } from '#src/queries/logto-config.js';
import { createOidcModelInstanceQueries } from '#src/queries/oidc-model-instance.js';
import OrganizationQueries from '#src/queries/organization/index.js';
import { createPasscodeQueries } from '#src/queries/passcode.js';
import { createResourceQueries } from '#src/queries/resource.js';
import { createRolesScopesQueries } from '#src/queries/roles-scopes.js';
import { createRolesQueries } from '#src/queries/roles.js';
import { createScopeQueries } from '#src/queries/scope.js';
import { createSignInExperienceQueries } from '#src/queries/sign-in-experience.js';
import SsoConnectorQueries from '#src/queries/sso-connectors.js';
import { createSubjectTokenQueries } from '#src/queries/subject-token.js';
import createTenantQueries from '#src/queries/tenant.js';
import UserSsoIdentityQueries from '#src/queries/user-sso-identities.js';
import { createUserQueries } from '#src/queries/user.js';
import { createUsersRolesQueries } from '#src/queries/users-roles.js';
import { createVerificationStatusQueries } from '#src/queries/verification-status.js';

export default class Queries {
  applications = createApplicationQueries(this.pool);
  applicationSecrets = new ApplicationSecretQueries(this.pool);
  applicationSignInExperiences = createApplicationSignInExperienceQueries(this.pool);
  connectors = createConnectorQueries(this.pool, this.wellKnownCache);
  customPhrases = createCustomPhraseQueries(this.pool, this.wellKnownCache);
  logs = createLogQueries(this.pool);
  oidcModelInstances = createOidcModelInstanceQueries(this.pool);
  passcodes = createPasscodeQueries(this.pool);
  resources = createResourceQueries(this.pool);
  rolesScopes = createRolesScopesQueries(this.pool);
  roles = createRolesQueries(this.pool);
  scopes = createScopeQueries(this.pool);
  logtoConfigs = createLogtoConfigQueries(this.pool);
  signInExperiences = createSignInExperienceQueries(this.pool, this.wellKnownCache);
  users = createUserQueries(this.pool);
  usersRoles = createUsersRolesQueries(this.pool);
  applicationsRoles = createApplicationsRolesQueries(this.pool);
  verificationStatuses = createVerificationStatusQueries(this.pool);
  hooks = createHooksQueries(this.pool);
  domains = createDomainsQueries(this.pool);
  dailyActiveUsers = createDailyActiveUsersQueries(this.pool);
  dailyTokenUsage = createDailyTokenUsageQueries(this.pool);
  organizations = new OrganizationQueries(this.pool);
  ssoConnectors = new SsoConnectorQueries(this.pool);
  userSsoIdentities = new UserSsoIdentityQueries(this.pool);
  subjectTokens = createSubjectTokenQueries(this.pool);
  tenants = createTenantQueries(this.pool);

  constructor(
    public readonly pool: CommonQueryMethods,
    public readonly wellKnownCache: WellKnownCache
  ) {}
}
