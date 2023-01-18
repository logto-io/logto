import type { Application } from '../db-entries/index.js';

export type ApplicationResponse = Application & { isAdmin: boolean };
