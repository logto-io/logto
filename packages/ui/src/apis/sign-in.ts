import ky from 'ky';

export const signInBasic = async (username: string, password: string) => {
  type Response = {
    redirectTo: string;
  };

  return ky
    .post('/api/session', {
      json: {
        username,
        password,
      },
    })
    .json<Response>();
};
