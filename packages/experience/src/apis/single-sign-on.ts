import api from './api';

const ssoPrefix = '/api/interaction/single-sign-on';

export const getSingleSignOnConnectors = async (email: string) =>
  api
    .get(`${ssoPrefix}/connectors`, {
      searchParams: {
        email,
      },
    })
    .json<string[]>();
