import {
  type ApplicationSignInExperienceCreate,
  type ApplicationSignInExperience,
} from '@logto/schemas';

import { authedAdminApi } from './api.js';

export const setApplicationSignInExperience = async (
  applicationId: string,
  payload: ApplicationSignInExperienceCreate
) =>
  authedAdminApi
    .put(`applications/${applicationId}/sign-in-experience`, { json: payload })
    .json<ApplicationSignInExperience>();

export const getApplicationSignInExperience = async (applicationId: string) =>
  authedAdminApi
    .get(`applications/${applicationId}/sign-in-experience`)
    .json<ApplicationSignInExperience>();
