import ky from 'ky';

export const register = async (username: string, password: string) => {
  type Response = {
    redirectTo: string;
  };
  return ky
    .post('/api/register', {
      json: {
        username,
        password,
      },
    })
    .json<Response>();
};
