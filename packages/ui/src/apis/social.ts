import api from './api';

export const bindSocialAccount = async (connectorId: string) => {
  return api
    .post('/api/session/bind-social', {
      json: {
        connectorId,
      },
    })
    .json();
};
