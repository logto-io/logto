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
  users = createUserLibrary(this.tenantId, this.queries);
  phrases = createPhraseLibrary(this.queries);
  hooks = createHookLibrary(this.queries);
  scopes = createScopeLibrary(this.queries);
  socials = createSocialLibrary(this.queries, this.connectors);
  jwtCustomizers = new JwtCustomizerLibrary(
    this.queries,
    this.logtoConfigs,
    this.cloudConnection,
    this.users,
    this.scopes
  );

  passcodes = createPasscodeLibrary(this.queries, this.connectors);
  applications = createApplicationLibrary(this.queries);
  verificationStatuses = createVerificationStatusLibrary(this.queries);
  samlApplications = createSamlApplicationsLibrary(this.queries);
  roleScopes = createRoleScopeLibrary(this.queries);
  domains = createDomainLibrary(this.queries);
  protectedApps = createProtectedAppLibrary(this.queries);

  quota = new QuotaLibrary(
    this.tenantId,
    this.queries,
    this.connectors,
    this.cloudConnection,
    this.subscription
  );

  ssoConnectors = createSsoConnectorLibrary(this.queries);
  oneTimeTokens = createOneTimeTokenLibrary(this.queries);
  signInExperiences = createSignInExperienceLibrary(
    this.tenantId,
    this.queries,
    this.connectors,
    this.ssoConnectors,
    this.queries.wellKnownCache
  );

  organizationInvitations = new OrganizationInvitationLibrary(
    this.tenantId,
    this.queries,
    this.connectors
  );

  customProfileFields = createCustomProfileFieldsLibrary(this.queries);

  constructor(
    public readonly tenantId: string,
    private readonly queries: Queries,
    // Explicitly passing connector library to eliminate dependency issue
    private readonly connectors: ConnectorLibrary,
    private readonly cloudConnection: CloudConnectionLibrary,
    private readonly logtoConfigs: LogtoConfigLibrary,
    private readonly subscription: SubscriptionLibrary
  ) {}
}
