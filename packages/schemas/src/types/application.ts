import { type z } from 'zod';

import { Applications, type Application } from '../db-entries/index.js';

export type ApplicationResponse = Application & { isAdmin: boolean };

/**
 * An application that is featured for display. Usually used in a list of resources that are
 * related to a group of applications.
 */
export type FeaturedApplication = Pick<Application, 'id' | 'name' | 'type'>;

/** The guard for {@link FeaturedApplication}. */
export const featuredApplicationGuard = Applications.guard.pick({
  id: true,
  name: true,
  type: true,
}) satisfies z.ZodType<FeaturedApplication>;
