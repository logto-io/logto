import { createConnectorLibrary } from '#src/libraries/connector.js';
import { createPhraseLibrary } from '#src/libraries/phrase.js';
import { createSignInExperienceLibrary } from '#src/libraries/sign-in-experience/index.js';
import { createUserLibrary } from '#src/libraries/user.js';

import type Queries from './Queries.js';

export default class Libraries {
  connectors = createConnectorLibrary(this.queries);
  users = createUserLibrary(this.queries);
  signInExperiences = createSignInExperienceLibrary(this.queries, this.connectors);
  phrases = createPhraseLibrary(this.queries);

  constructor(public readonly queries: Queries) {}
}
