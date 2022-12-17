import MockClient from '#src/client/index.js';

export const initClient = async () => {
  const client = new MockClient();
  await client.initSession();

  return client;
};

export const processSessionAndLogout = async (client: MockClient, redirectTo: string) => {
  await client.processSession(redirectTo);

  await expect(client.isAuthenticated()).resolves.toBe(true);

  await client.signOut();

  await expect(client.isAuthenticated()).resolves.toBe(false);
};
