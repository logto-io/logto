import api from '../api';

import { experienceApiRoutes } from './const';
import { submitInteraction } from './interaction';

export const skipPasswordExpirationReminder = async () =>
  api.post(`${experienceApiRoutes.passwordExpiration}/skip`);

export const resetExpiredPassword = async (password: string) => {
  await api.put(`${experienceApiRoutes.passwordExpiration}/reset`, {
    json: { password },
  });

  return submitInteraction();
};
