import ky from 'ky';

export const register = async (username: string, password: string) => {
  type Response = {
    redirectTo: string;
  };
  return ky
    .post('/api/users', {
      json: {
        username,
        password,
      },
    })
    .json<Response>();
};
