import type { JsonObject, SubjectTokenResponse } from '@logto/schemas';

import { authedAdminApi } from './api.js';

export const createSubjectToken = async (userId: string, context?: JsonObject) =>
  authedAdminApi
    .post('security/subject-tokens', {
      json: {
        userId,
        context,
      },
    })
    .json<SubjectTokenResponse>();
