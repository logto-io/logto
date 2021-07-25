import ky from 'ky';

export const consent = async () => {
  type Response = {
    redirectTo: string;
  };
  return ky.post('/api/sign-in/consent').json<Response>();
};
