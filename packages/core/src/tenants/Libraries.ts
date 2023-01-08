import { createUserLibrary } from '#src/libraries/user.js';

import type Queries from './Queries.js';

export default class Libraries {
  users = createUserLibrary(this.queries);

  constructor(public readonly queries: Queries) {}
}
