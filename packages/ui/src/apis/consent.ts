import ky from 'ky';

export const consent = async () => {
  type Response = {
    redirectTo: string;
  };
  return ky.post('/api/session/consent').json<Response>();
};
