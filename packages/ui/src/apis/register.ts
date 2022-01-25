import ky from 'ky';

export const register = async (username: string, password: string) => {
  type Response = {
    redirectTo: string;
  };
  return ky
    .post('/api/session/register', {
      json: {
        username,
        password,
      },
    })
    .json<Response>();
};
