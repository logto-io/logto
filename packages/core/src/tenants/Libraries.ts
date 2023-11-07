import { createApplicationLibrary } from '#src/libraries/application.js';
import { type CloudConnectionLibrary } from '#src/libraries/cloud-connection.js';
import type { ConnectorLibrary } from '#src/libraries/connector.js';
import { createDomainLibrary } from '#src/libraries/domain.js';
import { createHookLibrary } from '#src/libraries/hook/index.js';
import { createPasscodeLibrary } from '#src/libraries/passcode.js';
import { createPhraseLibrary } from '#src/libraries/phrase.js';
import { createQuotaLibrary } from '#src/libraries/quota.js';
import { createSignInExperienceLibrary } from '#src/libraries/sign-in-experience/index.js';
import { createSocialLibrary } from '#src/libraries/social.js';
import { createSsoConnectorLibrary } from '#src/libraries/sso-connector.js';
import { createUserLibrary } from '#src/libraries/user.js';
import { createVerificationStatusLibrary } from '#src/libraries/verification-status.js';

import type Queries from './Queries.js';

export default class Libraries {
  users = createUserLibrary(this.queries);
  phrases = createPhraseLibrary(this.queries);
  hooks = createHookLibrary(this.queries);
  socials = createSocialLibrary(this.queries, this.connectors);
  passcodes = createPasscodeLibrary(this.queries, this.connectors);
  applications = createApplicationLibrary(this.queries);
  verificationStatuses = createVerificationStatusLibrary(this.queries);
  domains = createDomainLibrary(this.queries);
  quota = createQuotaLibrary(this.queries, this.cloudConnection, this.connectors);
  ssoConnector = createSsoConnectorLibrary(this.queries);
  signInExperiences = createSignInExperienceLibrary(
    this.queries,
    this.connectors,
    this.ssoConnector,
    this.cloudConnection
  );

  constructor(
    public readonly tenantId: string,
    private readonly queries: Queries,
    // Explicitly passing connector library to eliminate dependency issue
    private readonly connectors: ConnectorLibrary,
    private readonly cloudConnection: CloudConnectionLibrary
  ) {}
}
