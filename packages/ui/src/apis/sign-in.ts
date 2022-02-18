import ky from 'ky';

export const signInBasic = async (username: string, password: string) => {
  type Response = {
    redirectTo: string;
  };

  return ky
    .post('/api/session/sign-in/username-password', {
      json: {
        username,
        password,
      },
    })
    .json<Response>();
};
