import { createApplicationLibrary } from '#src/libraries/application.js';
import { type CloudConnectionLibrary } from '#src/libraries/cloud-connection.js';
import type { ConnectorLibrary } from '#src/libraries/connector.js';
import { createCustomProfileFieldsLibrary } from '#src/libraries/custom-profile-fields/index.js';
import { createDomainLibrary } from '#src/libraries/domain.js';
import { createHookLibrary } from '#src/libraries/hook/index.js';
import { JwtCustomizerLibrary } from '#src/libraries/jwt-customizer.js';
import type { LogtoConfigLibrary } from '#src/libraries/logto-config.js';
import { createOneTimeTokenLibrary } from '#src/libraries/one-time-token.js';
import { OrganizationInvitationLibrary } from '#src/libraries/organization-invitation.js';
import { createPasscodeLibrary } from '#src/libraries/passcode.js';
import { createPhraseLibrary } from '#src/libraries/phrase.js';
import { createProtectedAppLibrary } from '#src/libraries/protected-app.js';
import { QuotaLibrary } from '#src/libraries/quota.js';
import { createRoleScopeLibrary } from '#src/libraries/role-scope.js';
import { createSamlApplicationsLibrary } from '#src/libraries/saml-application/saml-applications.js';
import { createScopeLibrary } from '#src/libraries/scope.js';
import { createSignInExperienceLibrary } from '#src/libraries/sign-in-experience/index.js';
import { createSocialLibrary } from '#src/libraries/social.js';
import { createSsoConnectorLibrary } from '#src/libraries/sso-connector.js';
import { type SubscriptionLibrary } from '#src/libraries/subscription.js';
import { createUserLibrary } from '#src/libraries/user.js';
import { createVerificationStatusLibrary } from '#src/libraries/verification-status.js';

import type Queries from './Queries.js';

export default class Libraries {
  users!: ReturnType<typeof createUserLibrary>;
  phrases!: ReturnType<typeof createPhraseLibrary>;
  hooks!: ReturnType<typeof createHookLibrary>;
  scopes!: ReturnType<typeof createScopeLibrary>;
  socials!: ReturnType<typeof createSocialLibrary>;
  jwtCustomizers!: JwtCustomizerLibrary;
  passcodes!: ReturnType<typeof createPasscodeLibrary>;
  applications!: ReturnType<typeof createApplicationLibrary>;
  verificationStatuses!: ReturnType<typeof createVerificationStatusLibrary>;
  samlApplications!: ReturnType<typeof createSamlApplicationsLibrary>;
  roleScopes!: ReturnType<typeof createRoleScopeLibrary>;
  domains!: ReturnType<typeof createDomainLibrary>;
  protectedApps!: ReturnType<typeof createProtectedAppLibrary>;
  quota!: QuotaLibrary;
  ssoConnectors!: ReturnType<typeof createSsoConnectorLibrary>;
  oneTimeTokens!: ReturnType<typeof createOneTimeTokenLibrary>;
  signInExperiences!: ReturnType<typeof createSignInExperienceLibrary>;
  organizationInvitations!: OrganizationInvitationLibrary;
  customProfileFields!: ReturnType<typeof createCustomProfileFieldsLibrary>;

  public readonly tenantId: string;
  private readonly queries: Queries;
  // Explicitly passing connector library to eliminate dependency issue
  private readonly connectors: ConnectorLibrary;
  private readonly cloudConnection: CloudConnectionLibrary;
  private readonly logtoConfigs: LogtoConfigLibrary;
  private readonly subscription: SubscriptionLibrary;

  constructor(options: {
    tenantId: string;
    queries: Queries;
    connectors: ConnectorLibrary;
    cloudConnection: CloudConnectionLibrary;
    logtoConfigs: LogtoConfigLibrary;
    subscription: SubscriptionLibrary;
  }) {
    this.tenantId = options.tenantId;
    this.queries = options.queries;
    this.connectors = options.connectors;
    this.cloudConnection = options.cloudConnection;
    this.logtoConfigs = options.logtoConfigs;
    this.subscription = options.subscription;

    // Initialize libraries after constructor properties are set
    this.users = createUserLibrary(this.queries);
    this.phrases = createPhraseLibrary(this.queries);
    this.hooks = createHookLibrary(this.queries);
    this.scopes = createScopeLibrary(this.queries);
    this.socials = createSocialLibrary(this.queries, this.connectors);
    this.jwtCustomizers = new JwtCustomizerLibrary({
      queries: this.queries,
      logtoConfigs: this.logtoConfigs,
      cloudConnection: this.cloudConnection,
      userLibrary: this.users,
      scopeLibrary: this.scopes,
    });

    this.passcodes = createPasscodeLibrary(this.queries, this.connectors);
    this.applications = createApplicationLibrary(this.queries);
    this.verificationStatuses = createVerificationStatusLibrary(this.queries);
    this.samlApplications = createSamlApplicationsLibrary(this.queries);
    this.roleScopes = createRoleScopeLibrary(this.queries);
    this.domains = createDomainLibrary(this.queries);
    this.protectedApps = createProtectedAppLibrary(this.queries);

    this.quota = new QuotaLibrary({
      tenantId: this.tenantId,
      queries: this.queries,
      connectorLibrary: this.connectors,
      cloudConnection: this.cloudConnection,
      subscription: this.subscription,
    });

    this.ssoConnectors = createSsoConnectorLibrary(this.queries);
    this.oneTimeTokens = createOneTimeTokenLibrary(this.queries);
    this.signInExperiences = createSignInExperienceLibrary({
      queries: this.queries,
      connectorLibrary: this.connectors,
      ssoConnectorLibrary: this.ssoConnectors,
      cloudConnection: this.cloudConnection,
      wellKnownCache: this.queries.wellKnownCache,
    });

    this.organizationInvitations = new OrganizationInvitationLibrary(
      this.tenantId,
      this.queries,
      this.connectors
    );

    this.customProfileFields = createCustomProfileFieldsLibrary(this.queries);
  }
}
