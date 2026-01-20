import type { CommonQueryMethods } from '@silverhand/slonik';

import { type WellKnownCache } from '#src/caches/well-known.js';
import { ApplicationSecretQueries } from '#src/queries/application-secrets.js';
import createApplicationSignInExperienceQueries from '#src/queries/application-sign-in-experience.js';
import { createApplicationQueries } from '#src/queries/application.js';
import { createApplicationsRolesQueries } from '#src/queries/applications-roles.js';
import { createConnectorQueries } from '#src/queries/connector.js';
import { createCustomPhraseQueries } from '#src/queries/custom-phrase.js';
import { createCustomProfileFieldsQueries } from '#src/queries/custom-profile-fields.js';
import { createDailyActiveUsersQueries } from '#src/queries/daily-active-user.js';
import { createDailyTokenUsageQueries } from '#src/queries/daily-token-usage.js';
import { createDomainsQueries } from '#src/queries/domains.js';
import { createHooksQueries } from '#src/queries/hooks.js';
import { createLogQueries } from '#src/queries/log.js';
import { createLogtoConfigQueries } from '#src/queries/logto-config.js';
import { createOidcModelInstanceQueries } from '#src/queries/oidc-model-instance.js';
import { createOneTimeTokenQueries } from '#src/queries/one-time-tokens.js';
import OrganizationQueries from '#src/queries/organization/index.js';
import { createPasscodeQueries } from '#src/queries/passcode.js';
import { createResourceQueries } from '#src/queries/resource.js';
import { createRolesScopesQueries } from '#src/queries/roles-scopes.js';
import { createRolesQueries } from '#src/queries/roles.js';
import { createSamlApplicationConfigQueries } from '#src/queries/saml-application/configs.js';
import { createSamlApplicationQueries } from '#src/queries/saml-application/index.js';
import { createSamlApplicationSecretsQueries } from '#src/queries/saml-application/secrets.js';
import { createSamlApplicationSessionQueries } from '#src/queries/saml-application/sessions.js';
import { createScopeQueries } from '#src/queries/scope.js';
import SecretQuery from '#src/queries/secret.js';
import { createSignInExperienceQueries } from '#src/queries/sign-in-experience.js';
import SsoConnectorQueries from '#src/queries/sso-connectors.js';
import { createSubjectTokenQueries } from '#src/queries/subject-token.js';
import createTenantQueries from '#src/queries/tenant.js';
import { createUserSignInCountriesQueries } from '#src/queries/user-sign-in-countries.js';
import UserSsoIdentityQueries from '#src/queries/user-sso-identities.js';
import { createUserQueries } from '#src/queries/user.js';
import { createUsersRolesQueries } from '#src/queries/users-roles.js';
import { createVerificationStatusQueries } from '#src/queries/verification-status.js';

import { AccountCenterQueries } from '../queries/account-center.js';
import { CaptchaProviderQueries } from '../queries/captcha-providers.js';
import EmailTemplatesQueries from '../queries/email-templates.js';
import { OidcSessionExtensionsQueries } from '../queries/oidc-session-extensions.js';
import { PersonalAccessTokensQueries } from '../queries/personal-access-tokens.js';
import { createSentinelActivitiesQueries } from '../queries/sentinel-activities.js';
import TenantUsageQuery from '../queries/tenant-usage/index.js';
import { VerificationRecordQueries } from '../queries/verification-records.js';

export default class Queries {
  applications = createApplicationQueries(this.pool);
  applicationSecrets = new ApplicationSecretQueries(this.pool);
  applicationSignInExperiences = createApplicationSignInExperienceQueries(this.pool);
  connectors = createConnectorQueries(this.pool, this.wellKnownCache);
  customPhrases = createCustomPhraseQueries(this.pool, this.wellKnownCache);
  customProfileFields = createCustomProfileFieldsQueries(this.pool);
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
  oneTimeTokens = createOneTimeTokenQueries(this.pool);
  domains = createDomainsQueries(this.pool);
  dailyActiveUsers = createDailyActiveUsersQueries(this.pool);
  dailyTokenUsage = createDailyTokenUsageQueries(this.pool);
  organizations = new OrganizationQueries(this.pool);
  ssoConnectors = new SsoConnectorQueries(this.pool);
  userSsoIdentities = new UserSsoIdentityQueries(this.pool);
  userSignInCountries = createUserSignInCountriesQueries(this.pool);
  subjectTokens = createSubjectTokenQueries(this.pool);
  samlApplicationSecrets = createSamlApplicationSecretsQueries(this.pool);
  samlApplicationConfigs = createSamlApplicationConfigQueries(this.pool);
  samlApplicationSessions = createSamlApplicationSessionQueries(this.pool);
  samlApplications = createSamlApplicationQueries(this.pool);
  personalAccessTokens = new PersonalAccessTokensQueries(this.pool);
  verificationRecords = new VerificationRecordQueries(this.pool);
  accountCenters = new AccountCenterQueries(this.pool, this.wellKnownCache);
  tenants = createTenantQueries(this.pool);
  tenantUsage = new TenantUsageQuery(this.pool);
  emailTemplates = new EmailTemplatesQueries(this.pool, this.wellKnownCache);
  captchaProviders = new CaptchaProviderQueries(this.pool);
  sentinelActivities = createSentinelActivitiesQueries(this.pool);
  oidcSessionExtensions = new OidcSessionExtensionsQueries(this.pool);
  secrets = new SecretQuery(this.pool);

  constructor(
    public readonly pool: CommonQueryMethods,
    public readonly wellKnownCache: WellKnownCache
  ) {}
}
