import type { CommonQueryMethods } from 'slonik';

import { createApplicationQueries } from '#src/queries/application.js';
import { createApplicationsRolesQueries } from '#src/queries/applications-roles.js';
import { createConnectorQueries } from '#src/queries/connector.js';
import { createCustomPhraseQueries } from '#src/queries/custom-phrase.js';
import { createLogQueries } from '#src/queries/log.js';
import { createLogtoConfigQueries } from '#src/queries/logto-config.js';
import { createOidcModelInstanceQueries } from '#src/queries/oidc-model-instance.js';
import { createPasscodeQueries } from '#src/queries/passcode.js';
import { createResourceQueries } from '#src/queries/resource.js';
import { createRolesScopesQueries } from '#src/queries/roles-scopes.js';
import { createRolesQueries } from '#src/queries/roles.js';
import { createScopeQueries } from '#src/queries/scope.js';
import { createSignInExperienceQueries } from '#src/queries/sign-in-experience.js';
import { createUserQueries } from '#src/queries/user.js';
import { createUsersRolesQueries } from '#src/queries/users-roles.js';
import { createVerificationStatusQueries } from '#src/queries/verification-status.js';

export default class Queries {
  applications = createApplicationQueries(this.pool);
  connectors = createConnectorQueries(this.pool);
  customPhrases = createCustomPhraseQueries(this.pool);
  logs = createLogQueries(this.pool);
  oidcModelInstances = createOidcModelInstanceQueries(this.pool);
  passcodes = createPasscodeQueries(this.pool);
  resources = createResourceQueries(this.pool);
  rolesScopes = createRolesScopesQueries(this.pool);
  roles = createRolesQueries(this.pool);
  scopes = createScopeQueries(this.pool);
  logtoConfigs = createLogtoConfigQueries(this.pool);
  signInExperiences = createSignInExperienceQueries(this.pool);
  users = createUserQueries(this.pool);
  usersRoles = createUsersRolesQueries(this.pool);
  applicationsRoles = createApplicationsRolesQueries(this.pool);
  verificationStatuses = createVerificationStatusQueries(this.pool);

  constructor(public readonly pool: CommonQueryMethods) {}
}
