import type { SignInExperience, CreateSignInExperience } from '@logto/schemas';
import { SignInExperiences } from '@logto/schemas';

import { buildFindEntityById } from '@/database/find-entity-by-id';
import { buildUpdateWhere } from '@/database/update-where';

const updateSignInExperience = buildUpdateWhere<CreateSignInExperience, SignInExperience>(
  SignInExperiences,
  true
);

const id = 'default';

export const updateDefaultSignInExperience = async (set: Partial<CreateSignInExperience>) =>
  updateSignInExperience({ set, where: { id }, jsonbMode: 'replace' });

export const findDefaultSignInExperience = async () =>
  buildFindEntityById<CreateSignInExperience, SignInExperience>(SignInExperiences)(id);
