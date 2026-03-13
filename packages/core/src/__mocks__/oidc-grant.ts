type OidcGrantInstance = {
  id: string;
  payload: {
    kind: 'Grant';
    clientId: string;
    accountId: string;
  };
  expiresAt: number;
};

export const createMockOidcGrantInstance = (
  overrides?: Partial<OidcGrantInstance>
): OidcGrantInstance => ({
  id: 'grant-id',
  payload: {
    kind: 'Grant',
    clientId: 'demo-app',
    accountId: 'user-id',
  },
  expiresAt: 1_787_997_038_000,
  ...overrides,
});
