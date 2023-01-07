import type { Resource, Scope } from '../db-entries/index.js';

export type ScopeResponse = Scope & { resource: Resource };
