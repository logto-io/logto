import ky from 'ky';

export const createAuthenticatedKy = (accessToken: string) =>
  ky.create({
    hooks: {
      beforeRequest: [
        (request) => {
          request.headers.set('Authorization', `Bearer ${accessToken}`);
        },
      ],
    },
  });
