import ky from 'ky';

export const signInBasic = async (username: string, password: string) => {
  type Response = {
    redirectTo: string;
  };
  return ky
    .post('/api/sign-in', {
      json: {
        username,
        password,
      },
    })
    .json<Response>();
};
