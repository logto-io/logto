import api from './api';

export const consent = async () => {
  type Response = {
    redirectTo: string;
  };

  return api.post('/api/interaction/consent').json<Response>();
};
