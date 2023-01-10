import { createConnectorLibrary } from '#src/libraries/connector.js';
import { createHookLibrary } from '#src/libraries/hook.js';
import { createPhraseLibrary } from '#src/libraries/phrase.js';
import { createResourceLibrary } from '#src/libraries/resource.js';
import { createSignInExperienceLibrary } from '#src/libraries/sign-in-experience/index.js';
import { createUserLibrary } from '#src/libraries/user.js';
import type { ModelRouters } from '#src/model-routers/index.js';

import type Queries from './Queries.js';

export default class Libraries {
  connectors = createConnectorLibrary(this.queries);
  users = createUserLibrary(this.queries);
  signInExperiences = createSignInExperienceLibrary(this.queries, this.connectors);
  phrases = createPhraseLibrary(this.queries);
  resources = createResourceLibrary(this.queries);
  hooks = createHookLibrary(this.queries, this.modelRouters);

  constructor(private readonly queries: Queries, private readonly modelRouters: ModelRouters) {}
}
