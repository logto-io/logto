import { createSignInExperienceLibrary } from '#src/libraries/sign-in-experience/index.js';
import { createUserLibrary } from '#src/libraries/user.js';

import type Queries from './Queries.js';

export default class Libraries {
  users = createUserLibrary(this.queries);
  signInExperiences = createSignInExperienceLibrary(this.queries);

  constructor(public readonly queries: Queries) {}
}
