import type { SignInExperience, CreateSignInExperience } from '@logto/schemas';
import { SignInExperiences } from '@logto/schemas';

import { buildFindEntityById } from '#src/database/find-entity-by-id.js';
import { buildUpdateWhere } from '#src/database/update-where.js';

const updateSignInExperience = buildUpdateWhere<CreateSignInExperience, SignInExperience>(
  SignInExperiences,
  true
);

const id = 'default';

export const updateDefaultSignInExperience = async (set: Partial<CreateSignInExperience>) =>
  updateSignInExperience({ set, where: { id }, jsonbMode: 'replace' });

export const findDefaultSignInExperience = async () =>
  buildFindEntityById<CreateSignInExperience, SignInExperience>(SignInExperiences)(id);
