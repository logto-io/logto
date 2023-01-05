import type { Resource, Scope } from '../db-entries/index.js';

export type ResourceResponse = Resource & { scopes: Scope[] };
